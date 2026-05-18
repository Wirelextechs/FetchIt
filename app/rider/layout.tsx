"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, 
  Navigation, 
  BarChart3, 
  UserCircle, 
  Power, 
  AlertOctagon, 
  DollarSign,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { RiderLazyLogin } from "@/components/auth/RiderLazyLogin";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState(0.00);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  // ── Layout Guard: guest users are allowed, users with other roles are blocked ──
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCheckingRole(false);
      return;
    }

    const checkRole = async () => {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (data) {
        if (data.role !== 'rider') {
          router.push('/user/explore');
        } else {
          setCheckingRole(false);
        }
      } else {
        setCheckingRole(false);
      }
    };

    checkRole();
  }, [user, authLoading, router]);

  useEffect(() => {
    let isActive = true;
    if (user) {
      // Small delay to avoid synchronous state update during render cycle
      const timeoutId = setTimeout(() => {
        if (isActive) {
          fetchRiderStatus(user.id, isActive);
        }
      }, 0);
      return () => {
        isActive = false;
        clearTimeout(timeoutId);
      };
    }
    return () => { isActive = false; };
  }, [user, fetchRiderStatus]);

  const toggleOnline = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    const nextStatus = !isOnline;
    const { error } = await supabase
      .from('users')
      .update({ is_online: nextStatus })
      .eq('id', user?.id);
    
    if (!error) setIsOnline(nextStatus);
  };

  const triggerSOS = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
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

  if (authLoading || (user && checkingRole)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground w-full relative overflow-hidden font-sans">
      {/* Top Header */}
      <header className="p-8 pt-12 bg-card border-b border-border shrink-0 z-[100]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-muted-foreground/30'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {isOnline ? 'Live Command' : 'System Standby'}
            </span>
          </div>
          <button 
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'glass text-muted-foreground border-border'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isOnline ? 'Signal Off' : 'Engage'}
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Command Center Balance</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black text-emerald-500">GHS</span>
              <span className="text-4xl font-black tracking-tighter text-foreground drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]">{earnings.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={triggerSOS}
            className="w-14 h-14 glass border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 active:scale-90 transition-all shadow-[0_0_30px_rgba(244,63,94,0.15)] group"
          >
            <AlertOctagon className="w-7 h-7 group-active:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border safe-area-bottom z-[100] flex justify-center shrink-0">
        <div className="w-full max-w-lg flex justify-around items-center h-20 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl relative transition-all duration-300 ${
                  isActive ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
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

      {/* Rider Lazy Login Modal */}
      <RiderLazyLogin 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => {
          setIsLoginModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
