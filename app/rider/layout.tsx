"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, 
  Navigation, 
  BarChart3, 
  UserCircle, 
  Power, 
  AlertOctagon, 
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState(0.00);

  const fetchRiderStatus = useCallback(async (userId: string, isActive: boolean) => {
    const { data } = await supabase
      .from('users')
      .select('is_online, wallet_balance')
      .eq('id', userId)
      .single();
    
    if (isActive && data) {
      setIsOnline(data.is_online);
      setEarnings(Number(data.wallet_balance || 0));
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    if (user) {
      fetchRiderStatus(user.id, isActive);
    }
    return () => { isActive = false; };
  }, [user, fetchRiderStatus]);

  const toggleOnline = async () => {
    const nextStatus = !isOnline;
    const { error } = await supabase
      .from('users')
      .update({ is_online: nextStatus })
      .eq('id', user?.id);
    
    if (!error) setIsOnline(nextStatus);
  };

  const triggerSOS = async () => {
    if (!user) return;
    if (confirm("🚨 Trigger Emergency SOS? This will alert dispatch and pause your active gigs.")) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { error } = await supabase
          .from('sos_alerts')
          .insert({
            rider_id: user.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            status: 'active'
          });
        
        if (error) alert("Error sending SOS: " + error.message);
        else alert("🆘 SOS DISPATCHED. Help is on the way. Your current location has been sent to Mission Control.");
      }, (err) => {
        alert("Geolocation failed. Sending SOS without coordinates.");
        supabase.from('sos_alerts').insert({ rider_id: user.id, status: 'active' });
      });
    }
  };

  const navLinks = [
    { href: "/rider/dashboard", label: "Radar", icon: Radar },
    { href: "/rider/active", label: "Active", icon: Navigation },
    { href: "/rider/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/rider/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0F1115] text-white w-full relative overflow-hidden font-sans">
      {/* Top Header */}
      <header className="p-6 pt-10 bg-slate-900/40 backdrop-blur-2xl border-b border-white/5 shrink-0 z-[100]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {isOnline ? 'Active on Radar' : 'System Offline'}
            </span>
          </div>
          <button 
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all duration-500 ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                : 'bg-slate-800 text-slate-400 border border-white/5'
            }`}
          >
            <Power className="w-3 h-3" />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Total Payout Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-emerald-500">GH₵</span>
              <span className="text-3xl font-black tracking-tighter">{earnings.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={triggerSOS}
            className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 active:scale-90 transition-all shadow-[0_10px_20px_rgba(244,63,94,0.1)] group"
          >
            <AlertOctagon className="w-6 h-6 group-active:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#0F1115]/90 backdrop-blur-2xl border-t border-white/5 safe-area-bottom z-[100] flex justify-center shrink-0">
        <div className="w-full max-w-lg flex justify-around items-center h-20 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl relative transition-all duration-300 ${
                  isActive ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                  />
                )}
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Obsidian Backdrop Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
