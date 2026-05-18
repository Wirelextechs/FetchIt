"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Radar,
  Package, 
  MapPin, 
  Clock, 
  Loader2,
  AlertCircle,
  ShieldCheck,
  Navigation,
  DollarSign,
  Edit3
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { RiderLazyLogin } from "@/components/auth/RiderLazyLogin";
import { KycPromptModal } from "@/components/kyc/KycPromptModal";

const RadarMap = dynamic(() => import("@/components/rider/RadarMap"), { ssr: false });

export default function RiderDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [directRequest, setDirectRequest] = useState<any>(null);
  const [countdown, setCountdown] = useState(180);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  
  // Zone Pricing Matrix States
  const [priceWithinCity, setPriceWithinCity] = useState(15);
  const [priceAroundCity, setPriceAroundCity] = useState(30);
  const [priceOutsideCity, setPriceOutsideCity] = useState(50);

  const fetchGigs = useCallback(async () => {
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGigs(data);
    }
    setLoading(false);
  }, []);

  // Fetch user's profile verification status and zone rates
  useEffect(() => {
    if (!user) {
      setIsVerified(false);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('is_verified, price_within_city, price_around_city, price_outside_city')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setIsVerified(!!data.is_verified);
        if (data.price_within_city !== null) setPriceWithinCity(Number(data.price_within_city));
        if (data.price_around_city !== null) setPriceAroundCity(Number(data.price_around_city));
        if (data.price_outside_city !== null) setPriceOutsideCity(Number(data.price_outside_city));
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    // Check for direct requests first
    const init = async () => {
       if (isMounted) {
         setLoading(true);
         await fetchGigs();
       }
     };
    init();

    // Listen for new gigs
    const channel = supabase
      .channel('public:gigs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gigs' },
        () => fetchGigs()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'gigs' },
        () => fetchGigs()
      )
      .subscribe();

    // Listen for direct requests specifically for this rider (only if authenticated)
    let directChannel: any = null;
    if (user) {
      directChannel = supabase
        .channel(`direct_requests:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT', 
            schema: 'public', 
            table: 'direct_requests',
            filter: `rider_id=eq.${user.id}`
          },
          (payload) => {
            if (isMounted) {
              setDirectRequest(payload.new);
              setCountdown(180);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'direct_requests',
            filter: `rider_id=eq.${user.id}`
          },
          (payload) => {
            if (isMounted && payload.new.status !== 'pending') {
              setDirectRequest(null);
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      if (directChannel) {
        supabase.removeChannel(directChannel);
      }
    };
  }, [user?.id, fetchGigs]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (directRequest && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [directRequest, countdown]);

  useEffect(() => {
    if (directRequest && countdown === 0) {
      const t = setTimeout(() => setDirectRequest(null), 0);
      return () => clearTimeout(t);
    }
  }, [countdown, directRequest]);

  const handleAccept = async (gigId: string, isDirect: boolean) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!isVerified) {
      setIsKycModalOpen(true);
      return;
    }

    const table = isDirect ? 'direct_requests' : 'gigs';

    // 1. Update status and assigned rider
    const { data: gigData, error: updateError } = await supabase
      .from(table)
      .update({
        status: isDirect ? 'accepted' : 'assigned',
        ...(isDirect ? {} : { assigned_rider_id: user.id })
      })
      .eq('id', gigId)
      .select()
      .single();
    
    if (updateError) {
      alert("Gig already taken or error: " + updateError.message);
      return;
    }

    // 2. Create Chat Session
    const { error: chatError } = await supabase
      .from('chat_sessions')
      .insert({
        [isDirect ? 'direct_request_id' : 'gig_id']: gigId,
        user_id: gigData.user_id,
        rider_id: user.id,
        status: 'active'
      });

    if (chatError) {
      console.error("Chat session creation error:", chatError);
    }

    // 3. Redirect
    setDirectRequest(null);
    router.push("/rider/active");
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
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden relative">
      {/* Tactical Radar Map */}
      <div className="h-[45vh] lg:h-full lg:flex-1 relative border-r border-border shrink-0">
        <RadarMap gigs={gigs} />
        
        {/* Current Rates HUD Widget */}
        <div className="absolute top-6 left-6 right-6 z-[400] glass p-4 rounded-[24px] border border-border flex flex-wrap gap-4 items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Your Zone Rates</p>
              <h3 className="text-[11px] font-bold text-foreground mt-0.5">Techiman Delivery Pricing</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Central</span>
              <span className="text-xs font-black text-emerald-500 italic">GH₵{priceWithinCity}</span>
            </div>
            <div className="w-[1px] h-6 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Around</span>
              <span className="text-xs font-black text-emerald-500 italic">GH₵{priceAroundCity}</span>
            </div>
            <div className="w-[1px] h-6 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Outside</span>
              <span className="text-xs font-black text-emerald-500 italic">GH₵{priceOutsideCity}</span>
            </div>
            <div className="w-[1px] h-6 bg-border" />
            <button 
              onClick={() => router.push("/rider/settings")}
              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all active:scale-95 flex items-center justify-center"
              title="Edit Rates"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-20 lg:bottom-12 left-6 z-[400] glass px-4 py-2 rounded-2xl border border-border flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Scanning sector</span>
        </div>
      </div>

      {/* Gig Feed */}
      <div className="flex-1 flex flex-col bg-card rounded-t-[40px] lg:rounded-none -mt-12 lg:mt-0 relative z-20 overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.1)] lg:shadow-none border-t lg:border-t-0 border-border lg:max-w-md xl:max-w-lg">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-4 shrink-0 lg:hidden opacity-50" />
        
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-2 lg:pt-8 custom-scrollbar">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white mb-1 italic">Tactical Radar</h2>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Missions in your sector</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-500">{gigs.length}</span>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Gigs Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-muted-foreground/30 animate-spin" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Updating Feed...</p>
              </div>
            ) : gigs.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border">
                  <Radar className="w-10 h-10 text-muted-foreground/20 animate-pulse" />
                </div>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest px-10 leading-relaxed italic">
                  Quiet sector. Move to a glow zone to increase visibility.
                </p>
              </div>
            ) : (
              gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} isVerified={isVerified} onAccept={() => handleAccept(gig.id, false)} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Direct Booking Takeover */}
      <AnimatePresence>
        {directRequest && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#8B0000] flex flex-col p-8 overflow-hidden"
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

      {/* Guest Interceptor Lazy Login Modal */}
      <RiderLazyLogin 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => {
          setIsLoginModalOpen(false);
          window.location.reload();
        }}
      />

      {/* KYC Prompt Modal */}
      <KycPromptModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />
    </div>
  );
}

function GigCard({ gig, onAccept, isVerified }: { gig: any, onAccept: () => void, isVerified: boolean }) {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);

  const handleClaim = () => {
    if (!user || !isVerified) {
      onAccept();
      return;
    }
    setClaiming(true);
    onAccept();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/50 border border-border p-6 rounded-[32px] relative overflow-hidden group shadow-sm"
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-base text-foreground italic">{gig.description || "General Delivery"}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Broadcast</span>
              <div className="w-1 h-1 rounded-full bg-border" />
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
            <span className="text-2xl font-black text-foreground tracking-tighter">{Number(gig.offered_price || 0).toFixed(2)}</span>
          </div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Target Pay</p>
        </div>
      </div>

      <div className="space-y-4 mb-8 relative z-10 px-2">
        <div className="flex items-center gap-4 text-xs font-bold text-foreground/70">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="truncate">{gig.pickup_landmark}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-foreground/70">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          <span className="truncate">{gig.dropoff_landmark}</span>
        </div>
      </div>

      <button 
        onClick={handleClaim}
        disabled={claiming}
        className="w-full bg-emerald-600 text-white font-black py-4 rounded-[20px] text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(16,185,129,0.15)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground"
      >
        {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim Mission"}
      </button>

      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
    </motion.div>
  );
}
