"use client";

import { useState, useEffect, use } from "react";
import { WalletWidget, WalletStatus } from "@/components/chat/WalletWidget";
import { ChatTimeline, Message } from "@/components/chat/ChatTimeline";
import { ChatInput } from "@/components/chat/ChatInput";
import { ArrowLeft, Phone, MoreVertical, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ChatPage(props: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const params = use(props.params);
  const sessionId = params.id;

  const [walletStatus, setWalletStatus] = useState<WalletStatus>("awaiting_funds");
  const [balance, setBalance] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id;

  useEffect(() => {
    if (!currentUserId) return;

    const fetchInitialData = async () => {
      setLoading(true);
      
      // 1. Fetch Session Info
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          gigs:gig_id (*)
        `)
        .eq('id', sessionId)
        .single();
      
      if (sessionData) {
        setSession(sessionData);
      }

      // 2. Fetch messages
      const { data: initialMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (initialMessages) {
        setMessages(initialMessages);
      }

      // 3. Fetch wallet state
      const { data: walletData } = await supabase
        .from('chat_wallets')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (walletData) {
        setWalletStatus(walletData.status);
        setBalance(Number(walletData.balance));
      }
      
      setLoading(false);
    };

    fetchInitialData();

    // 4. Set up Real-time Subscriptions
    const messagesChannel = supabase
      .channel(`chat:${sessionId}:messages`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    const walletChannel = supabase
      .channel(`chat:${sessionId}:wallet`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_wallets', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const updatedWallet = payload.new;
          setWalletStatus(updatedWallet.status);
          setBalance(Number(updatedWallet.balance));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(walletChannel);
    };
  }, [sessionId, currentUserId]);

  const handleTopUp = async (amount: number) => {
    if (!currentUserId) return;
    
    // In a real flow, this triggers Moolre payment gateway.
    await supabase
      .from('chat_wallets')
      .update({ balance: amount, status: 'funded' })
      .eq('session_id', sessionId);

    await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUserId,
      content: `Wallet funded with GH₵${amount.toFixed(2)} via Moolre.`,
      message_type: 'wallet_action'
    });
  };

  const handleRelease = async () => {
    if (!currentUserId) return;
    
    await supabase
      .from('chat_wallets')
      .update({ status: 'released' })
      .eq('session_id', sessionId);

    await supabase.from('messages').insert([
      {
        session_id: sessionId,
        sender_id: currentUserId,
        content: `User released GH₵${balance.toFixed(2)} to the shopper.`,
        message_type: 'wallet_action'
      }
    ]);
  };

  const handleWithdraw = async (momoNumber: string) => {
    // Shopper triggers this.
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUserId) return;
    
    await supabase.from('messages').insert({
      session_id: sessionId,
      sender_id: currentUserId,
      content,
      message_type: 'text'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white max-w-md mx-auto items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Opening chat...</p>
      </div>
    );
  }

  // Determine role and other party name
  const isUser = currentUserId === session?.user_id;
  const shopperName = isUser ? "Shopper" : "Customer"; // In real app, fetch name from profiles

  const isClosed = session?.status === 'closed';

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/user/activity" className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-base leading-tight">
              {isUser ? "Gig Rider" : "Customer"}
            </h1>
            <p className="text-xs text-emerald-400 flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isClosed ? 'bg-slate-400' : 'bg-emerald-400 animate-pulse'}`}></span>
              {isClosed ? 'Session Closed' : 'Online'} • {session?.gigs?.description || "Gig Chat"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Closed Banner */}
      {isClosed && (
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-xs font-bold text-slate-600">
            This service is completed. Chat is closed.
          </p>
        </div>
      )}

      {/* Wallet Widget */}
      <div className={isClosed ? "opacity-60 pointer-events-none" : ""}>
        <WalletWidget
          status={walletStatus}
          balance={balance}
          userRole={isUser ? "user" : "shopper"}
          onTopUp={handleTopUp}
          onRelease={handleRelease}
          onWithdraw={handleWithdraw}
        />
      </div>

      {/* Chat Timeline */}
      <ChatTimeline
        messages={messages}
        currentUserId={currentUserId || ""}
        shopperId={session?.shopper_id}
        shopperName={isUser ? "Rider" : "Customer"}
      />

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isClosed} />
    </div>
  );
}
