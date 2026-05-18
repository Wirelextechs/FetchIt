"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { WalletWidget, WalletStatus } from "./WalletWidget";
import { Phone, MoreVertical, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type UserRole = "user" | "rider";

interface ChatRoomProps {
  sessionId: string;
  role: UserRole;
  currentUserId: string;
  children?: React.ReactNode; // New prop for embedded content
}

interface ChatSession {
  id: string;
  status: 'active' | 'completed';
  escrow_amount: number;
  escrow_released: boolean;
  user_id: string;
  rider_id: string;
  gigs?: {
    dropoff_landmark: string;
  };
  direct_requests?: {
    dropoff_landmark: string;
  };
}

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'system_escrow_released' | 'system_withdrawal_success' | 'system_mission_completed';
  created_at: string;
}

interface UserProfile {
  id: string;
  phone_number: string;
  wallet_balance: number;
}

export function ChatRoom({ sessionId, role, currentUserId, children }: ChatRoomProps) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [escrowInput, setEscrowInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);

  const fetchOtherUser = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('id, phone_number, wallet_balance')
      .eq('id', userId)
      .single();
    if (data) setOtherUser(data as UserProfile);
  }, []);

  const fetchSession = useCallback(async () => {
    const { data } = await supabase
      .from('chat_sessions')
      .select(`
        id, status, escrow_amount, escrow_released, user_id, rider_id,
        gigs(dropoff_landmark),
        direct_requests(dropoff_landmark)
      `)
      .eq('id', sessionId)
      .single();

    if (data) {
      setSession(data as unknown as ChatSession);
      const sessionData = data as unknown as { rider_id: string; user_id: string };
      fetchOtherUser(role === 'user' ? sessionData.rider_id : sessionData.user_id);
    }
  }, [sessionId, role, fetchOtherUser]);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
  }, [sessionId]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;
      setLoading(true);
      await Promise.all([fetchSession(), fetchMessages()]);
      if (isMounted) setLoading(false);
    };

    init();

    // Subscribe to session changes
    const sessionSubscription = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (isMounted) setSession(prev => ({ ...prev, ...payload.new } as ChatSession));
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const newMessage = payload.new as Message;
          if (isMounted) {
            setMessages(prev => {
               if (prev.some(m => m.id === newMessage.id)) return prev;
               return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(sessionSubscription);
      supabase.removeChannel(messageSubscription);
    };
  }, [sessionId, fetchSession, fetchMessages]);

  const handleSendMessage = async (text: string, type: string = 'text') => {
    await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUserId,
      message_text: text,
      message_type: type
    });
  };

  const releaseFunds = async () => {
    if (!escrowInput || isNaN(Number(escrowInput))) return;
    setProcessing(true);
    const amount = Number(escrowInput);

    try {
      // 1. Deduct from wallet and log transaction
      const { data: userData } = await supabase.from('users').select('wallet_balance').eq('id', currentUserId).single();
      const newBalance = (userData?.wallet_balance || 0) - amount;

      await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', currentUserId);
      await supabase.from('user_transactions').insert({
        user_id: currentUserId,
        amount: amount,
        type: 'debit',
        description: 'Escrow release'
      });

      // 2. Update session
      await supabase.from('chat_sessions').update({
        escrow_amount: amount,
        escrow_released: true
      }).eq('id', sessionId);

      // 3. Send system message
      await handleSendMessage(`You released GHS ${amount.toFixed(2)} to escrow.`, 'system_escrow_released');

      setShowEscrowModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const withdrawToMoMo = async (momoNumber: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/moolre/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          amount: session?.escrow_amount,
          riderId: currentUserId,
          momoNumber
        })
      });

      if (response.ok) {
        await handleSendMessage(`Funds successfully withdrawn by Shopper to ${momoNumber}.`, 'system_withdrawal_success');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const completeMission = async () => {
    setProcessing(true);
    try {
      await supabase.from('chat_sessions').update({ status: 'completed' }).eq('id', sessionId);
      await handleSendMessage('Mission completed. Chat is now read-only.', 'system_mission_completed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  const walletStatus: WalletStatus = session?.status === 'completed'
    ? 'withdrawn'
    : session?.escrow_released
      ? (messages.some(m => m.message_type === 'system_withdrawal_success') ? 'withdrawn' : 'released')
      : (session?.escrow_amount ? 'funded' : 'awaiting_funds');

  const landmark = session?.gigs?.dropoff_landmark || session?.direct_requests?.dropoff_landmark || "Techiman Market";

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
            {otherUser?.phone_number?.substring(0, 2) || '??'}
          </div>
          <div>
            <div className="font-semibold text-sm flex items-center gap-1">
              {otherUser?.phone_number || 'Shopper'}
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-[10px] text-emerald-500 font-medium">
              {role === 'rider' ? `Dropoff: ${landmark}` : 'Online • Gig Chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Phone className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </div>
      </header>

      {/* Wallet Widget */}
      <WalletWidget
        status={walletStatus}
        balance={session?.escrow_amount || 0}
        userRole={role === 'rider' ? 'shopper' : 'user'}
        onTopUp={() => setShowEscrowModal(true)}
        onRelease={() => setShowEscrowModal(true)}
        onWithdraw={withdrawToMoMo}
      />

      {/* Chat Timeline and Scrollable Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
        {/* Embedded Children Content (e.g. Mission Details) */}
        {children}

        <div className="p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isSystem = msg.message_type !== 'text';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border-2 border-emerald-500/20 rounded-2xl p-4 max-w-[280px] shadow-sm text-center"
                  >
                    <div className="bg-emerald-500/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-foreground mb-1">
                      {msg.message_type.split('_').join(' ').toUpperCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {msg.message_text}
                    </p>

                    {role === 'rider' && msg.message_type === 'system_escrow_released' && walletStatus === 'released' && (
                      <button
                        onClick={() => withdrawToMoMo("024XXXXXXX")}
                        disabled={processing}
                        className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        Withdraw to MoMo
                      </button>
                    )}
                  </motion.div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={cn("px-4 py-2 rounded-2xl text-sm shadow-sm", isMe ? "bg-foreground text-background rounded-br-none" : "bg-card text-foreground border border-border rounded-bl-none")}>
                  {msg.message_text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar / Input */}
      {session?.status === 'active' ? (
        <div className="bg-card border-t border-border">
          {role === 'rider' && (
             <div className="px-4 py-2 bg-emerald-500/5 border-b border-emerald-500/10 flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Mission Tools</span>
                <button
                  onClick={completeMission}
                  disabled={processing}
                  className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                >
                  Complete Mission
                </button>
             </div>
          )}
          <div className="p-3">
            <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2 border border-border">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button className="text-emerald-500 font-bold text-sm">Send</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted p-4 text-center text-xs font-medium text-muted-foreground">
          This session is completed and is now read-only.
        </div>
      )}

      {/* Escrow Modal */}
      <AnimatePresence>
        {showEscrowModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEscrowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="relative bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-border"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold">Release Shopping Funds</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  Enter the exact amount for the goods. This will be held in escrow until the shopper withdraws.
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">GHS</span>
                  <input
                    type="number"
                    autoFocus
                    value={escrowInput}
                    onChange={(e) => setEscrowInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-4 bg-muted/50 border border-border rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div className="flex items-start gap-3 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-700 font-medium">
                    Once released, the shopper can withdraw these funds immediately. Ensure you have agreed on the price.
                  </div>
                </div>

                <button
                  onClick={releaseFunds}
                  disabled={!escrowInput || Number(escrowInput) <= 0 || processing}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                  Confirm & Release
                </button>
                <button
                  onClick={() => setShowEscrowModal(false)}
                  className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
