"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Clock, CheckCircle2, ChevronRight, MessageSquare, Loader2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Tab = "ongoing" | "past";

export default function ActivityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("ongoing");
  const [loading, setLoading] = useState(true);
  const [ongoing, setOngoing] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchActivity();
  }, [user]);

  const fetchActivity = async () => {
    setLoading(true);
    
    // Fetch Gigs (Broadcasts)
    const { data: gigs } = await supabase
      .from('gigs')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    // Fetch Direct Requests
    const { data: directRequests } = await supabase
      .from('direct_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    const all = [
      ...(gigs || []).map(g => ({ ...g, activity_type: 'broadcast' })),
      ...(directRequests || []).map(d => ({ ...d, activity_type: 'direct' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setOngoing(all.filter(i => i.status === 'pending' || i.status === 'accepted' || i.status === 'in_transit'));
    setPast(all.filter(i => i.status === 'completed' || i.status === 'cancelled' || i.status === 'expired' || i.status === 'rejected'));
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background w-full pb-24 relative">
      <header className="px-6 pt-12 pb-6 bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-2xl font-black text-foreground">Your Activity</h1>
          <div className="flex mt-6 bg-muted p-1 rounded-2xl max-w-md">
            <button 
              onClick={() => setActiveTab("ongoing")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "ongoing" ? "bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
              }`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "past" ? "bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading Mission Control…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "ongoing" ? ongoing : past).length === 0 ? (
              <div className="text-center py-20 px-10 col-span-full">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-black text-foreground">No {activeTab} activity</h3>
                <p className="text-sm text-muted-foreground mt-2">When you request a rider, it will appear here.</p>
              </div>
            ) : (
              (activeTab === "ongoing" ? ongoing : past).map((item) => (
                <ActivityCard key={item.id} item={item} tab={activeTab} onRefresh={fetchActivity} />
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function ActivityCard({ item, tab, onRefresh }: { item: any, tab: Tab, onRefresh: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pickup, setPickup] = useState(item.pickup_landmark);
  const [dropoff, setDropoff] = useState(item.dropoff_landmark);
  
  const isDirect = item.activity_type === 'direct';
  const isPending = item.status === 'pending';
  
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    setLoading(true);
    const table = isDirect ? 'direct_requests' : 'gigs';
    const { error } = await supabase
      .from(table)
      .update({ status: 'cancelled' })
      .eq('id', item.id);
    
    if (error) alert(error.message);
    else onRefresh();
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const table = isDirect ? 'direct_requests' : 'gigs';
    const { error } = await supabase
      .from(table)
      .update({ pickup_landmark: pickup, dropoff_landmark: dropoff })
      .eq('id', item.id);
    
    if (error) alert(error.message);
    else {
      setIsEditing(false);
      onRefresh();
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card p-5 rounded-3xl shadow-sm border border-border"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
          }`}>
            {isDirect ? <Bike className="w-6 h-6" /> : <Package className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              {isDirect ? "Direct Rider Request" : "Broadcast Delivery"}
            </h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {new Date(item.created_at).toLocaleDateString()} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          item.status === 'accepted' || item.status === 'in_transit' ? 'bg-emerald-100 text-emerald-700' :
          item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
          item.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'
        }`}>
          {item.status.replace('_', ' ')}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="truncate">{item.pickup_landmark}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="truncate">{item.dropoff_landmark}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {tab === 'ongoing' ? (
          <>
            <button 
              onClick={() => router.push(`/user/chat/${item.id}`)}
              disabled={isPending}
              className="flex-[2] bg-foreground text-background font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-all disabled:bg-muted disabled:text-muted-foreground"
            >
              <MessageSquare className="w-4 h-4" />
              {isPending ? "Waiting for Accept..." : "Open Chat"}
            </button>
            {isPending && (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-muted text-muted-foreground font-bold py-3 rounded-2xl text-sm hover:bg-muted/80 transition-colors border border-border"
                >
                  Edit
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-rose-500/10 text-rose-500 font-bold py-3 rounded-2xl text-sm hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                >
                  {loading ? "..." : "Cancel"}
                </button>
              </>
            )}
          </>
        ) : (
          <button 
            onClick={() => router.push(`/user/chat/${item.id}`)}
            className="w-full bg-muted text-muted-foreground font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-muted/80 transition-colors border border-border"
          >
            View Summary
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[1000] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-card rounded-t-[32px] p-6 pt-8 shadow-2xl"
            >
              <h2 className="text-xl font-black text-foreground mb-6">Edit Landmarks</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Pickup Landmark</label>
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-muted border-none rounded-2xl py-4 px-6 text-foreground font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Dropoff Landmark</label>
                  <input 
                    type="text" 
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full bg-muted border-none rounded-2xl py-4 px-6 text-foreground font-bold outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
