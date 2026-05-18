"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bike, 
  ShoppingBag, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Sun, 
  Moon, 
  MessageSquare, 
  Wallet, 
  Package, 
  Compass, 
  Users, 
  Zap, 
  ArrowUpRight 
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

// ── Tab Type Definition ──────────────────────────────────────────
type UseCaseTab = "shopper" | "errand" | "rider";

export default function RootLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<UseCaseTab>("shopper");

  // Scroll Reveal Animations variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* ── Background Glow Effects ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[-100px] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[150px]" />
      </div>

      {/* ── Branded Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)] border border-emerald-400/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-1.5">
                FetchIt
                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Techiman</span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">How it works</a>
            <a href="/user/explore" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Explore Marketplace</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/5 hover:border-emerald-500/30 transition-all text-slate-700 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Quick Action Button */}
            <button
              onClick={() => router.push("/user/explore")}
              className="hidden sm:flex bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-600/20 border border-emerald-400/20"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (The Split Hook) ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6 max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/25 border border-emerald-500/20 rounded-full px-4 py-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Ghana's Premier Logistics Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white">
            Techiman's First Hybrid Marketplace for <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 bg-clip-text text-transparent">
              Riders and The Good People
            </span> in Town.
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Hire vetted personal shoppers to buy your market goods safely, or get a lightning-fast dispatch rider in minutes. All backed by our secure escrow pipeline.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <div className="w-full sm:w-auto">
              <button
                onClick={() => router.push("/user/explore")}
                className="w-full sm:w-auto bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-[11px] uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all duration-300 active:scale-95 shadow-xl dark:shadow-white/5 flex items-center justify-center gap-2"
              >
                Find a Rider / Shop Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">
                No sign-up required to browse.
              </p>
            </div>

            <div className="w-full sm:w-auto self-start">
              <button
                onClick={() => router.push("/rider/gigs")}
                className="w-full sm:w-auto bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-black text-[11px] uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all duration-300 active:scale-95 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 shadow-sm"
              >
                Become a Rider on FetchIt
                <Bike className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Value Proposition (Bento Grid) ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-200/50 dark:border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">Built for Trust & Speed</h2>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Why FetchIt stands out from the rest</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 rounded-[36px] p-8 shadow-xl hover:shadow-2xl hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-500 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-500/20">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-3">100% Escrow Protection</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Your hard-earned money is held safely by our Moolre escrow system. Shoppers only receive payment via MoMo once you confirm the market goods are correct.
              </p>
            </div>
            <div className="pt-6 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
              Learn about security <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 rounded-[36px] p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/20 dark:hover:border-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 border border-blue-500/20">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-3">Landmark Navigation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                No street names or digital address pins in Techiman? No problem. Simply reference popular landmarks (Top Oil, Krobo Gate) and let our expert riders handle the rest.
              </p>
            </div>
            <div className="pt-6 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
              Try landmark route <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 rounded-[36px] p-8 shadow-xl hover:shadow-2xl hover:border-purple-500/20 dark:hover:border-purple-500/10 transition-all duration-500 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 border border-purple-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-3">5-Minute Priority Loop</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Our advanced dispatch loop matches your request to our vetted Company Riders first. This gives you high-fidelity security, speed, and premium delivery execution.
              </p>
            </div>
            <div className="pt-6 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
              View rider specs <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Use Cases (Interactive Tabs) ── */}
      <section id="use-cases" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-200/50 dark:border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">Interactive Workflows</h2>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Select a profile to explore FetchIt</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/50 dark:bg-white/5 p-2 rounded-[32px] max-w-lg mx-auto mb-12 border border-slate-200/50 dark:border-white/5">
          {[
            { id: "shopper", label: "🛍 Personal Shopper" },
            { id: "errand", label: "📦 Custom Errand" },
            { id: "rider", label: "🚴 Rider Hustle" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as UseCaseTab)}
              className={`flex-1 py-4 rounded-[26px] text-xs font-black uppercase tracking-wider relative transition-all duration-300 ${
                activeTab === tab.id 
                  ? "text-white dark:text-slate-900" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-slate-950 dark:bg-white rounded-[26px] z-0 shadow-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="glass p-8 md:p-12 rounded-[48px] border-slate-200/50 dark:border-white/5 shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {activeTab === "shopper" && (
              <motion.div
                key="shopper-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">Need market goods? Send an agent.</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Need fresh tomatoes, rice, or yams from the Techiman Central Market but don't want to deal with the crowds? 
                    Simply post a shopping request, add your custom budget, fund the secure escrow account, and chat directly with your dedicated buyer.
                  </p>
                  <ul className="space-y-3 pt-2">
                    {[
                      "Vetted personal shopper selection",
                      "Fund transaction safely via Mobile Money (MoMo)",
                      "Verify receipt of goods in live chat before release"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 p-6 md:p-8 rounded-[36px] border border-slate-200 dark:border-white/5 space-y-6 shadow-inner relative">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center font-bold text-emerald-600">S</div>
                      <div>
                        <p className="text-xs font-black text-slate-950 dark:text-white">Amina K.</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase">Market Expert Shopper</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full font-black uppercase tracking-wider">Active</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-200/50 dark:bg-slate-900/50 p-4 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300">
                      "I've picked the fresh yams from Mamprusi lane. Sending photos to your chat now!"
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase">MoMo Escrow Wallet</p>
                        <p className="text-lg font-black text-emerald-500">GH₵ 120.00</p>
                      </div>
                      <button className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20">Release</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "errand" && (
              <motion.div
                key="errand-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">Left your keys? package to move?</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Have documents that need signing across town or left your keys behind? Set your own payout offer, specify simple pickup and delivery landmarks, and our dispatch priority system handles the rest.
                  </p>
                  <ul className="space-y-3 pt-2">
                    {[
                      "No map pin required, use local landmarks",
                      "Name your own delivery price",
                      "Real-time dispatch tracking and encrypted chat"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 p-6 md:p-8 rounded-[36px] border border-slate-200 dark:border-white/5 space-y-4 shadow-inner">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Dispatch Gig</p>
                  <div className="space-y-3">
                    <div className="bg-slate-200/50 dark:bg-slate-900/50 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-400 uppercase">Pickup Landmark</span>
                        <span className="text-slate-900 dark:text-white">Top Oil Station</span>
                      </div>
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-400 uppercase">Dropoff Landmark</span>
                        <span className="text-slate-900 dark:text-white">Kenten Market Entrance</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Your Offer</span>
                      <span className="text-xl font-black text-blue-500">GH₵ 35.00</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "rider" && (
              <motion.div
                key="rider-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">Be your own boss. Earn on the Radar.</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Have a motorbike, tricycle, or bicycle? Jump onto the FetchIt Tactical Radar. Claim gigs posted in town, complete deliveries safely, and withdraw your earnings directly to your Mobile Money wallet instantly.
                  </p>
                  <ul className="space-y-3 pt-2">
                    {[
                      "Real-time nearby gigs map radar",
                      "Zero hidden platform commission fees",
                      "Instant, secure withdrawals directly to MoMo"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 p-6 md:p-8 rounded-[36px] border border-slate-200 dark:border-white/5 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rider Terminal</p>
                    <span className="flex items-center gap-1.5 text-[9px] bg-emerald-500/15 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/25 font-black uppercase tracking-wider">Online</span>
                  </div>
                  <div className="bg-[#0F1115] p-5 rounded-[24px] border border-white/5 space-y-3 text-white">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Available Balance</p>
                    <p className="text-2xl font-black italic text-emerald-400">GH₵ 480.00</p>
                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] py-4 rounded-xl uppercase tracking-widest transition-all">Withdraw to MoMo</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Massive Final CTA Banner ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-800 rounded-[48px] p-8 md:p-20 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Ready to experience <br className="hidden md:inline" />
              the future of dispatch?
            </h2>
            <p className="text-slate-100/80 max-w-xl mx-auto text-sm md:text-base font-semibold leading-relaxed">
              No matter who you are—a business owner, a local shopper, or an ambitious rider—FetchIt provides the trust, protection, and speed you need.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => router.push("/user/explore")}
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-widest py-5 px-10 rounded-2xl transition-transform active:scale-95 shadow-xl"
              >
                Post Your First Gig
              </button>
              <button
                onClick={() => router.push("/rider/gigs")}
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 font-black text-xs uppercase tracking-widest py-5 px-10 rounded-2xl transition-transform active:scale-95 border border-white/20"
              >
                Become a Rider
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Branded Footer ── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-white/5 transition-colors duration-300 relative z-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-950 dark:text-white">FetchIt</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-xs">
              Specialized hybrid dispatch, errand, and personal shopping marketplace for Techiman, Sunyani, and beyond.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li><a href="/user/explore" className="hover:text-emerald-500 transition-colors">Explore Gigs</a></li>
              <li><a href="/map" className="hover:text-emerald-500 transition-colors">Rider Radar Map</a></li>
              <li><a href="/rider/gigs" className="hover:text-emerald-500 transition-colors">Rider Board</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Trust & Safety</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li><span className="text-slate-400 dark:text-slate-600">Escrow Protections</span></li>
              <li><span className="text-slate-400 dark:text-slate-600">Vetting Procedure</span></li>
              <li><span className="text-slate-400 dark:text-slate-600">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} FetchIt Ltd. All rights reserved.</span>
          <span>Powered by Moolre Pay Gateway.</span>
        </div>
      </footer>
    </div>
  );
}
