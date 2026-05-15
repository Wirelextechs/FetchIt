"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { LogOut, User, Phone, Shield, Star, Package, Settings, ChevronRight, Loader2, MapPin, CreditCard, Bike } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        if (!authLoading) setLoading(false);
        return;
    }
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center w-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
     return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center w-full border-x border-slate-200">
            <User className="w-16 h-16 text-slate-300 mb-4" />
            <h1 className="text-xl font-bold text-slate-800">Account Access</h1>
            <p className="text-slate-500 text-sm mt-2 mb-8 px-8">Please log in to view your profile and manage your orders.</p>
            <button onClick={() => router.push("/")} className="bg-emerald-600 text-white font-bold w-full max-w-xs py-4 rounded-2xl shadow-lg shadow-emerald-600/20">Sign In</button>
        </div>
     )
  }

  // Determine role
  const isRider = profile?.role === 'rider';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FetchIt - The fastest delivery in Techiman',
          text: 'Need something delivered or an errand run? Use FetchIt!',
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full pb-32 relative">
      <div className="max-w-4xl mx-auto w-full">
        {/* Dynamic Glassmorphism Header */}
        <div className="relative pt-16 pb-24 px-6 overflow-hidden md:rounded-[48px] md:mt-4">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-full h-full bg-slate-900">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-[36px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl p-1">
                <div className="w-full h-full bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-400 overflow-hidden">
                  <User className="w-12 h-12" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-slate-900 rounded-full flex items-center justify-center shadow-lg">
                 <Shield className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-white mt-6 tracking-tight">
              {profile?.name || "Premium User"}
            </h1>
            <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2 mt-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
               <Phone className="w-3.5 h-3.5 text-emerald-400" />
               {profile?.phone_number || "Verified Account"}
            </p>
          </div>
        </div>

        {/* Floating Action Section */}
        <div className="px-6 -mt-12 relative z-20 space-y-4 pb-20">
          {/* Stats Row - Adapted for User vs Rider */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 shadow-xl shadow-slate-200/50 border border-white flex gap-2">
             <div className="flex-1 bg-slate-50/50 rounded-[24px] p-4 flex flex-col items-center text-center">
                <Package className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-lg font-black text-slate-800">--</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Gigs Posted</span>
             </div>
             
             {isRider ? (
               <>
                 <div className="flex-1 bg-slate-50/50 rounded-[24px] p-4 flex flex-col items-center text-center">
                    <Star className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-lg font-black text-slate-800">5.0</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Rating</span>
                 </div>
                 <div className="flex-1 bg-emerald-600 rounded-[24px] p-4 flex flex-col items-center text-center text-white shadow-lg shadow-emerald-600/30">
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="text-lg font-black italic">GH₵0</span>
                    <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest">Wallet</span>
                 </div>
               </>
             ) : (
               <div className="flex-1 bg-blue-600 rounded-[24px] p-4 flex flex-col items-center text-center text-white shadow-lg shadow-blue-600/30">
                  <Star className="w-5 h-5 mb-1" />
                  <span className="text-lg font-black italic">Top</span>
                  <span className="text-[9px] text-blue-100 font-bold uppercase tracking-widest">Customer</span>
               </div>
             )}
          </div>

          {/* Account Sections */}
          <div className="space-y-6">
             <div className="space-y-3">
               <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Settings</h2>
               <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                  <MenuItem 
                    icon={<Bike className="w-5 h-5 text-emerald-600" />} 
                    label="Rider Portal" 
                    onClick={() => router.push('/rider/dashboard')}
                  />
                  <MenuItem 
                    icon={<MapPin className="w-5 h-5 text-blue-500" />} 
                    label="Saved Locations" 
                    onClick={() => router.push('/profile/locations')}
                  />
                  <MenuItem 
                    icon={<Settings className="w-5 h-5 text-slate-500" />} 
                    label="Account Settings" 
                    onClick={() => router.push('/profile/settings')}
                  />
                  <MenuItem 
                    icon={<Shield className="w-5 h-5 text-emerald-500" />} 
                    label="Security & Verification" 
                    onClick={() => router.push('/profile/security')}
                  />
               </div>
             </div>

             <div className="space-y-3">
               <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Support & Legal</h2>
               <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                  <MenuItem icon={<LogOut className="w-5 h-5 text-rose-500" />} label="Log Out" onClick={handleLogout} destructive />
               </div>
             </div>

             {/* Share Banner */}
             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">Spread the Word</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-6 relative z-10">Share FetchIt with your friends and family so they can also get things done fast!</p>
                <button 
                  onClick={handleShare}
                  className="bg-white text-blue-700 text-[10px] font-black uppercase tracking-wider px-8 py-3 rounded-full relative z-10 shadow-lg active:scale-95 transition-transform"
                >
                  Share App
                </button>
             </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function MenuItem({ icon, label, onClick, destructive }: { icon: React.ReactNode, label: string, onClick?: () => void, destructive?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all active:scale-[0.98] border-b border-slate-50 last:border-0 text-left"
    >
      <div className="flex items-center gap-4">
         <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center shadow-inner">
            {icon}
         </div>
         <span className={`font-bold ${destructive ? 'text-rose-600' : 'text-slate-700'}`}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300" />
    </button>
  );
}
