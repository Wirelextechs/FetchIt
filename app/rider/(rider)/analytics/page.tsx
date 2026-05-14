"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Star, 
  Percent, 
  ArrowUpRight,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

const data = [
  { day: 'Mon', earnings: 120 },
  { day: 'Tue', earnings: 190 },
  { day: 'Wed', earnings: 150 },
  { day: 'Thu', earnings: 210 },
  { day: 'Fri', earnings: 280 },
  { day: 'Sat', earnings: 350 },
  { day: 'Sun', earnings: 220 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(450.50);
  const [pending, setPending] = useState(120.00);

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    const { data } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', user?.id)
      .single();
    
    if (data) setBalance(Number(data.wallet_balance || 0));
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Moolre Wallet Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1A1C22] to-[#0F1115] p-8 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Wallet className="w-32 h-32 text-emerald-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Moolre Secured Wallet</p>
          </div>
          
          <div className="flex flex-col gap-6 mb-10">
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2">Available Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-500">GH₵</span>
                <span className="text-5xl font-black tracking-tighter text-white">{balance.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex gap-10">
              <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">In Escrow</p>
                <p className="text-base font-black text-amber-500 tracking-tight">GH₵ {pending.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] group">
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Withdraw to MoMo
          </button>
        </div>
      </motion.div>

      {/* Today's Hustle */}
      <div className="space-y-4">
        <h2 className="text-sm font-black tracking-[0.15em] uppercase text-slate-500 ml-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Today's Performance
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Earned Today" value="84.00" sub="GHS" icon={DollarSign} color="emerald" />
          <StatCard label="Missions" value="12" sub="Done" icon={CheckCircle2} color="blue" />
          <StatCard label="Active Time" value="6.5" sub="Hrs" icon={Clock} color="purple" />
          <StatCard label="Customer Tips" value="15.00" sub="GHS" icon={Star} color="amber" />
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#0F1115] border border-white/5 p-6 rounded-[40px] shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">7-Day Revenue Trend</h2>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+12.4% vs last week</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.2} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F1115', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '10px', fontWeight: '900', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#10b981' }}
                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#10b981" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorEarnings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account Health */}
      <div className="grid grid-cols-3 gap-4">
        <HealthMetric label="Rating" value="4.9" icon={Star} />
        <HealthMetric label="Acceptance" value="98%" icon={Percent} />
        <HealthMetric label="Canceled" value="2%" icon={AlertCircle} warning />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="bg-[#16181D] border border-white/5 p-5 rounded-[32px] group">
      <div className={`w-10 h-10 ${colors[color]} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold text-slate-700">{sub}</span>
      </div>
    </div>
  );
}

function HealthMetric({ label, value, icon: Icon, warning }: any) {
  return (
    <div className="flex flex-col items-center text-center p-5 bg-[#16181D] rounded-[32px] border border-white/5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${warning ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xl font-black text-white tabular-nums">{value}</p>
      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}
