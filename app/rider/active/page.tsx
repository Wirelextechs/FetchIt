"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  MessageSquare, 
  Send,
  Phone,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
  Navigation,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ActiveMission() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchActiveMission();
    
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [user, messages]);

  const fetchActiveMission = async () => {
    setLoading(true);
    // Find either a direct request or a gig accepted by this rider
    const { data: request } = await supabase
      .from('direct_requests')
      .select('*')
      .eq('rider_id', user?.id)
      .eq('status', 'accepted')
      .single();
    
    if (request) {
      setMission({ ...request, type: 'direct' });
      // In a real app, subscribe to messages. For now, mock data.
      setMessages([
        { id: 1, sender_id: 'user', text: 'Please pick up the rice from Top Oil.' },
        { id: 2, sender_id: 'rider', text: 'On my way now!' },
        { id: 3, sender_id: 'system', text: 'Customer has released GHS 120.00 for shopping.', type: 'escrow_release' }
      ]);
    } else {
      // Check for broadcast gigs (if we had a junction table or rider_id on gigs)
      // For MVP, we'll assume direct requests for now or check gigs where status=accepted and rider_id=...
      const { data: gig } = await supabase
        .from('gigs')
        .select('*')
        .eq('status', 'accepted')
        .single(); // In real app, filter by rider_id if added
      
      if (gig) {
        setMission({ ...gig, type: 'broadcast' });
      }
    }
    setLoading(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { id: Date.now(), sender_id: 'rider', text: newMessage.trim() };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleComplete = async () => {
    if (!confirm("🏁 Are you sure you've delivered the items? This will notify the user.")) return;
    const table = mission.type === 'direct' ? 'direct_requests' : 'gigs';
    await supabase.from(table).update({ status: 'completed' }).eq('id', mission.id);
    router.push("/rider/analytics");
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Comms...</p>
    </div>
  );

  if (!mission) return (
    <div className="p-12 text-center flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <div className="w-24 h-24 bg-muted rounded-[40px] flex items-center justify-center mb-8 border border-border text-muted-foreground shadow-2xl">
        <Navigation className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-foreground mb-3 tracking-tighter">No Active Mission</h2>
      <p className="text-muted-foreground text-sm font-medium px-10 leading-relaxed">
        Check the tactical radar for nearby gigs or wait for a direct booking.
      </p>
      <button 
        onClick={() => router.push("/rider/dashboard")}
        className="mt-10 bg-emerald-600 text-white font-black px-10 py-5 rounded-[24px] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]"
      >
        Open Tactical Radar
      </button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden animate-in fade-in duration-700">
      {/* Mission Header */}
      <div className="p-6 bg-card border-b border-border space-y-6 sticky top-0 z-50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Live Mission
              </p>
              <h2 className="text-lg font-black text-foreground tracking-tight">{mission.type === 'direct' ? 'Direct Delivery' : 'Broadcast Gig'}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-0.5 text-emerald-500">
              <span className="text-xs font-bold">GH₵</span>
              <span className="text-2xl font-black tracking-tighter">{Number(mission.offered_price).toFixed(2)}</span>
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Payout</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-2xl border border-border relative group overflow-hidden">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pickup</p>
            <p className="text-xs font-bold text-foreground/70 truncate">{mission.pickup_landmark}</p>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
              <MapPin className="w-3 h-3" />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-2xl border border-border relative group overflow-hidden">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Dropoff</p>
            <p className="text-xs font-bold text-foreground/70 truncate">{mission.dropoff_landmark}</p>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]"
        >
          <ShieldCheck className="w-4 h-4" />
          Mission Accomplished
        </button>
      </div>

      {/* Chat Interface */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-background"
      >
        <div className="text-center py-4">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] bg-muted px-4 py-1 rounded-full border border-border">
            Communication Channel Encrypted
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === 'rider' ? 'justify-end' : msg.sender_id === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.type === 'escrow_release' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-4 my-6"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[40px] flex items-center gap-5 shadow-inner">
                  <div className="w-14 h-14 bg-emerald-500 rounded-[20px] flex items-center justify-center text-white shrink-0 shadow-[0_10px_20px_rgba(16,185,129,0.3)]">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-1">Escrow Funded</p>
                    <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">The customer has released GH₵ 120.00 into your Moolre shopping wallet.</p>
                  </div>
                </div>
                <button className="w-full bg-foreground text-background font-black py-6 rounded-[32px] shadow-3xl flex items-center justify-center gap-3 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] group">
                  <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Transfer to MoMo to Shop
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-1.5 max-w-[85%]">
                <div className={`p-5 rounded-[28px] text-[13px] font-bold leading-relaxed ${
                  msg.sender_id === 'rider' 
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-600/10' 
                    : 'bg-card text-foreground rounded-tl-none border border-border shadow-sm'
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[8px] font-black uppercase tracking-widest text-muted-foreground ${msg.sender_id === 'rider' ? 'text-right mr-2' : 'ml-2'}`}>
                  {msg.sender_id === 'rider' ? 'You' : 'Customer'} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-card border-t border-border sticky bottom-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mission update..."
              className="w-full bg-muted border border-border rounded-[24px] py-5 px-8 text-foreground font-black placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleSendMessage}
            className="w-16 h-16 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30 active:scale-90 transition-all group"
          >
            <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
