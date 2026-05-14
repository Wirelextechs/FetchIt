"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  Bike,
  ShieldCheck,
  AlertCircle,
  Radar,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamically import map to avoid SSR issues
const RadarMap = dynamic(() => import("@/components/rider/RadarMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-600 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Radar...</p>
    </div>
  )
});

export default function RiderDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [gigs, setGigs] = useState<any[]>([]);
  const [directRequest, setDirectRequest] = useState<any>(null);
  const [countdown, setCountdown] = useState(180);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchGigs();

    // Subscribe to new broadcast gigs
    const gigsChannel = supabase
      .channel('public:gigs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gigs' }, (payload) => {
        setGigs((prev) => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gigs' }, (payload) => {
        setGigs((prev) => prev.map(g => g.id === payload.new.id ? payload.new : g).filter(g => g.status === 'pending'));
      })
      .subscribe();

    // Subscribe to direct requests targeting this rider
    const directChannel = supabase
      .channel(`rider:${user.id}:direct_requests`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_requests', 
        filter: `rider_id=eq.${user.id}` 
      }, (payload) => {
        if (payload.new.status === 'pending') {
          setDirectRequest(payload.new);
          setCountdown(180);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'direct_requests',
        filter: `rider_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.status !== 'pending') {
          setDirectRequest(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gigsChannel);
      supabase.removeChannel(directChannel);
    };
  }, [user]);

  useEffect(() => {
    let timer: any;
    if (directRequest && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && directRequest) {
      handleDecline();
    }
    return () => clearInterval(timer);
  }, [directRequest, countdown]);

  const fetchGigs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gigs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (data) setGigs(data);
    setLoading(false);
  };

  const handleAccept = async (gigId: string, isDirect: boolean) => {
    const table = isDirect ? 'direct_requests' : 'gigs';
    const { error } = await supabase
      .from(table)
      .update({ status: 'accepted' })
      .eq('id', gigId);
    
    if (!error) {
      setDirectRequest(null);
      router.push("/rider/active");
    } else {
      alert("Gig already taken or error: " + error.message);
    }
  };

  const handleDecline = async () => {
    if (!directRequest) return;
    await supabase
      .from('direct_requests')
      .update({ status: 'rejected' })
      .eq('id', directRequest.id);
    setDirectRequest(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Tactical Radar Map */}
      <div className="h-1/2 w-full relative">
        <RadarMap gigs={gigs} />
        <div className="absolute bottom-12 left-6 z-[400] bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Scanning techiman</span>
        </div>
      </div>

      {/* Gig Feed */}
      <div className="flex-1 bg-[#0F1115] rounded-t-[40px] -mt-10 relative z-20 p-6 overflow-y-auto shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/5">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 opacity-50" />
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white mb-1">Tactical Radar</h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Missions in your sector</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-500">{gigs.length}</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Gigs Ready</span>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Updating Feed...</p>
            </div>
          ) : gigs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Radar className="w-10 h-10 text-slate-700 animate-pulse" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest px-10 leading-relaxed">
                Quiet sector. Move to a glow zone to increase visibility.
              </p>
            </div>
          ) : (
            gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} onAccept={() => handleAccept(gig.id, false)} />
            ))
          )}
        </div>
      </div>

      {/* Direct Booking Takeover */}
      <AnimatePresence>
        {directRequest && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#8B0000] flex flex-col p-8 overflow-hidden"
          >
            {/* Takeover Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent animate-pulse" />
              <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.03)_20px,rgba(255,255,255,0.03)_40px)]" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[40px] flex items-center justify-center mb-10 border border-white/20 shadow-2xl animate-bounce">
                <AlertCircle className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-5xl font-black text-white mb-3 uppercase tracking-tighter italic scale-110">Priority Booking</h1>
              <p className="text-rose-200 font-bold text-lg mb-12 opacity-80 italic">User is requesting YOUR services specifically</p>

              <div className="w-full bg-black/30 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 space-y-10 shadow-3xl">
                <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">Guaranteed Pay</p>
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-lg font-bold">GH₵</span>
                      <span className="text-4xl font-black tracking-tighter">{Number(directRequest.offered_price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-full border-8 border-white/5 flex items-center justify-center relative bg-black/20">
                    <span className="text-3xl font-black text-white tabular-nums">{countdown}</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        fill="transparent" 
                        stroke="white" 
                        strokeWidth="8" 
                        strokeDasharray={251} 
                        strokeDashoffset={251 - (251 * countdown / 180)} 
                        className="transition-all duration-1000" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-6 px-2">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">Pickup Landmark</p>
                      <p className="text-lg font-bold text-white truncate">{directRequest.pickup_landmark}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                      <Navigation className="w-6 h-6 rotate-90" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">Dropoff Point</p>
                      <p className="text-lg font-bold text-white truncate">{directRequest.dropoff_landmark}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-5 mt-12 mb-4">
              <button 
                onClick={() => handleAccept(directRequest.id, true)}
                className="w-full bg-white text-[#8B0000] font-black py-7 rounded-[32px] text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <ShieldCheck className="w-8 h-8" />
                CLAIM MISSION
              </button>
              <button 
                onClick={handleDecline}
                className="w-full bg-transparent text-white/40 font-black py-4 rounded-[32px] text-xs uppercase tracking-widest active:scale-95 transition-all hover:text-white/60"
              >
                Decline & Pass to Others
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GigCard({ gig, onAccept }: { gig: any, onAccept: () => void }) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = () => {
    setClaiming(true);
    onAccept();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] relative overflow-hidden group shadow-xl"
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100">{gig.description || "General Delivery"}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Broadcast</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> 
                {new Date(gig.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-black text-emerald-500">GH₵</span>
            <span className="text-2xl font-black text-white tracking-tighter">{Number(gig.offered_price || 0).toFixed(2)}</span>
          </div>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Target Pay</p>
        </div>
      </div>

      <div className="space-y-4 mb-8 relative z-10 px-2">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="truncate">{gig.pickup_landmark}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          <span className="truncate">{gig.dropoff_landmark}</span>
        </div>
      </div>

      <button 
        onClick={handleClaim}
        disabled={claiming}
        className="w-full bg-emerald-600 text-white font-black py-4 rounded-[20px] text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(16,185,129,0.15)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-600"
      >
        {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim Mission"}
      </button>

      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
    </motion.div>
  );
}
