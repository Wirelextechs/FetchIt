"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { MapPin, ArrowRight, ShieldCheck, Timer, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Gig {
  id: string;
  user_id: string;
  description: string;
  pickup_landmark: string;
  dropoff_landmark: string | null;
  offered_price: number;
  gig_type: string;
  status: string;
  is_visible_to_all: boolean;
  created_at: string;
}

export default function RiderGigsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setGigs(data);
      }
      setLoading(false);
    };

    fetchGigs();

    // Subscribe to new gigs
    const channel = supabase
      .channel('public:gigs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, () => {
        fetchGigs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcceptGig = async (gig: Gig) => {
    if (!user) return;
    setAcceptingId(gig.id);

    try {
      // 1. Update gig status
      const { error: updateError } = await supabase
        .from('gigs')
        .update({ status: 'accepted' })
        .eq('id', gig.id);

      if (updateError) throw updateError;

      // 2. Create chat session
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          gig_id: gig.id,
          user_id: gig.user_id,
          shopper_id: user.id
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 3. Create chat wallet
      const { error: walletError } = await supabase
        .from('chat_wallets')
        .insert({
          session_id: sessionData.id,
          balance: 0,
          status: 'awaiting_funds'
        });

      if (walletError) throw walletError;

      // 4. Redirect to chat
      router.push(`/user/chat/${sessionData.id}`); // Both user and rider use the same chat page structure usually
    } catch (err) {
      console.error("Error accepting gig:", err);
      alert("Failed to accept gig. It might have been taken by another rider.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto pb-20">
      <header className="bg-card px-4 py-6 text-foreground sticky top-0 z-20 shadow-sm border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center">
              Available Gigs
            </h1>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Looking for jobs in Techiman
            </p>
          </div>
          <div className="bg-muted p-2 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button className="flex-1 bg-card text-foreground text-sm font-semibold py-2 rounded-lg shadow-sm border border-border">
            All Feed
          </button>
          <button className="flex-1 text-muted-foreground text-sm font-semibold py-2 hover:text-foreground transition-colors">
            Priority (5m)
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Scanning for gigs...</p>
          </div>
        ) : gigs.length > 0 ? (
          gigs.map((gig) => (
            <div key={gig.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-1.5 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 w-max mb-2">
                  <Timer className="w-3 h-3 text-rose-500" />
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">New Gig</span>
                </div>
                <span className="text-xl font-bold text-foreground">GH₵{gig.offered_price}</span>
              </div>
              
              <h3 className="font-bold text-foreground text-base mb-3 pr-4">{gig.description}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-emerald-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Pickup</p>
                    <p className="text-sm font-semibold text-foreground/70">{gig.pickup_landmark}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleAcceptGig(gig)}
                disabled={acceptingId === gig.id}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 disabled:bg-slate-300"
              >
                {acceptingId === gig.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Accept Gig</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No available gigs right now.</p>
            <p className="text-sm">We'll notify you when new ones arrive!</p>
          </div>
        )}
      </div>
    </div>
  );
}
