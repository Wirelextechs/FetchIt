"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { Package, Clock, Loader2, Plus, ArrowRight, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Gig {
  id: string;
  description: string;
  pickup_landmark: string;
  dropoff_landmark: string | null;
  offered_price: number;
  gig_type: string;
  status: string;
  created_at: string;
  chat_sessions: { id: string }[];
}

export default function UserGigsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGigs() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("gigs")
          .select("*, chat_sessions(id)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGigs((data as any) || []);
      } catch (err) {
        console.error("Error fetching gigs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGigs();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto pb-20">
      <header className="bg-card px-4 py-6 border-b border-border sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Gigs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your active deliveries and errands.</p>
        </div>
        <button
          onClick={() => router.push("/user/gigs/new")}
          className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading your gigs...</p>
          </div>
        ) : gigs.length > 0 ? (
          gigs.map((gig) => (
            <div key={gig.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className={`w-2 h-2 rounded-full ${gig.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className={`text-xs font-semibold ${gig.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'} capitalize`}>
                    {gig.status}
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{formatDate(gig.created_at)}</span>
              </div>
              
              <h3 className="font-bold text-foreground text-lg mb-1">{gig.description}</h3>
              <p className="text-sm text-muted-foreground flex items-center mb-4 capitalize">
                <Package className="w-4 h-4 mr-1.5" />
                Type: {gig.gig_type}
              </p>
              
              <div className="flex justify-between items-center border-t border-border pt-3">
                <div className="text-sm font-semibold text-foreground">
                  Offer: GH₵{gig.offered_price}
                </div>
                {gig.chat_sessions && gig.chat_sessions.length > 0 ? (
                  <button 
                    onClick={() => router.push(`/user/chat/${gig.chat_sessions[0].id}`)}
                    className="text-sm font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Open Chat
                  </button>
                ) : (
                  <div className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-1 rounded-lg border border-border italic">
                    {gig.gig_type === 'delivery' ? 'Awaiting Rider...' : 
                     gig.gig_type === 'errand' ? 'Awaiting Errand Runner...' : 
                     gig.gig_type === 'shopping' ? 'Awaiting Shopper...' : 
                     'Looking for someone...'}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Gigs Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">You haven't posted any gigs. Need something done?</p>
            <Link 
              href="/user/gigs/new"
              className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20"
            >
              Post your first gig
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
