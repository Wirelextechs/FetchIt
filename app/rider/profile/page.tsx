"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  ShieldCheck, 
  Bike, 
  MapPin, 
  CheckCircle2, 
  CreditCard,
  ChevronRight,
  Settings,
  LogOut,
  Camera,
  Verified
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";

export default function RiderProfile() {
  const { user, signOut } = useAuth();
  
  const payouts = [
    { id: 1, date: '2026-05-12', amount: 350.00, status: 'completed' },
    { id: 2, date: '2026-05-10', amount: 210.00, status: 'completed' },
    { id: 3, date: '2026-05-08', amount: 450.00, status: 'completed' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 pb-24 space-y-8 animate-in slide-in-from-bottom-4 duration-700 custom-scrollbar">
      {/* Rider ID Card */}
      <div className="relative pt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1A1C22] to-[#0F1115] border border-white/10 rounded-[48px] p-8 relative overflow-hidden shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 blur-[80px] rounded-full -mr-32 -mt-32" />
          </div>

          <div className="absolute top-8 right-8">
            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center gap-2">
              <Verified className="w-3.5 h-3.5" />
              Company Pro
            </div>
          </div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-[40px] bg-slate-800 border-4 border-[#0F1115] overflow-hidden shadow-2xl relative">
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'rider'}`} 
                  alt="Avatar" 
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center border-4 border-[#0F1115] text-white shadow-xl active:scale-90 transition-all">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <h1 className="text-3xl font-black text-white mb-1 tracking-tighter">Kwame Mensah</h1>
            <p className="text-slate-500 text-sm font-bold opacity-60">{user?.email}</p>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="flex flex-col items-center">
                <p className="text-xl font-black text-white">1,240</p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Lifetime Gigs</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center">
                <p className="text-xl font-black text-emerald-500">4.9</p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Avg Rating</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center">
                <p className="text-xl font-black text-white">2.4y</p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Experience</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trust & Vehicle Hub */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Verification & Assets</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#16181D] p-6 rounded-[32px] border border-white/5 group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Ghana Card Status</p>
            <p className="text-xs font-black text-white">VERIFIED</p>
          </div>
          <div className="bg-[#16181D] p-6 rounded-[32px] border border-white/5 group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/10">
              <Bike className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Primary Vehicle</p>
            <p className="text-xs font-black text-white">AS-2024-TG</p>
          </div>
        </div>
      </div>

      {/* Payout Ledger */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Payout Ledger</h2>
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">View All</span>
        </div>
        <div className="space-y-3">
          {payouts.map((p) => (
            <motion.div 
              key={p.id} 
              whileHover={{ x: 4 }}
              className="bg-[#16181D] p-5 rounded-[28px] border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Moolre Payout</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">{p.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-500">GH₵ {p.amount.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Settled</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-3 pt-4">
        <button className="w-full bg-slate-800/10 hover:bg-slate-800/20 p-6 rounded-[32px] border border-white/5 flex items-center justify-between transition-all group">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rider Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-700 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => signOut()}
          className="w-full bg-rose-500/5 hover:bg-rose-500/10 p-6 rounded-[32px] border border-rose-500/10 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-4 text-rose-500">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Offline & Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
