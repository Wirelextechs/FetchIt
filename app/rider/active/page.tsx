"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Package, 
  MapPin, 
  ShieldCheck,
  Loader2,
  Navigation,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ChatRoom } from "@/components/chat/ChatRoom";

export default function ActiveMissionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const fetchActiveMission = useCallback(async () => {
    if (!user) return;
    
    const { data: request } = await supabase
      .from('direct_requests')
      .select('*')
      .eq('rider_id', user.id)
      .eq('status', 'accepted')
      .single();
    
    let activeMission = null;

    if (request) {
      activeMission = { ...request, type: 'direct' };
    } else {
      const { data: gig } = await supabase
        .from('gigs')
        .select('*')
        .eq('status', 'accepted')
        .single();
      
      if (gig) {
        activeMission = { ...gig, type: 'broadcast' };
      }
    }

    if (activeMission) {
      setMission(activeMission);

      const { data: chatSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .or(`direct_request_id.eq.${activeMission.id},gig_id.eq.${activeMission.id}`)
        .single();

      if (chatSession) {
        setChatSessionId(chatSession.id);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchActiveMission();
  }, [fetchActiveMission]);

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

  if (!mission || !chatSessionId) return (
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ChatRoom
        sessionId={chatSessionId}
        role="rider"
        currentUserId={user?.id || ""}
      >
        {/* Embedded Mission Details */}
        <div className="p-6 bg-card border-b border-border space-y-6">
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
                <div className="text-lg font-black text-foreground tracking-tight">
                  {mission.type === 'direct' ? 'Direct Delivery' : 'Broadcast Gig'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-0.5 text-emerald-500">
                <span className="text-xs font-bold">GH₵</span>
                <span className="text-2xl font-black tracking-tighter">
                  {Number(mission.offered_price).toFixed(2)}
                </span>
              </div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Payout</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-2xl border border-border relative group overflow-hidden">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pickup</p>
              <div className="text-xs font-bold text-foreground/70 truncate">{mission.pickup_landmark}</div>
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <MapPin className="w-3 h-3" />
              </div>
            </div>
            <div className="bg-muted p-4 rounded-2xl border border-border relative group overflow-hidden">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Dropoff</p>
              <div className="text-xs font-bold text-foreground/70 truncate">{mission.dropoff_landmark}</div>
              <div className="absolute top-0 right-0 p-2 opacity-10">
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
      </ChatRoom>
    </div>
  );
}
