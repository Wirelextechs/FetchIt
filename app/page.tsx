"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, MapPin, Navigation, ShieldCheck, Plus, Package, Bike, User, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

import { DEFAULT_CITY } from "@/config/cities";

type ServiceMode = "delivery" | "shopping";

export default function HomePage() {
  const { requireAuth, user } = useAuth();
  const router = useRouter();
  const [serviceMode, setServiceMode] = useState<ServiceMode>("delivery");
  
  // Direct Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<{ id: string, name: string, type: 'company' | 'individual' } | null>(null);
  const [pickupLandmark, setPickupLandmark] = useState("");
  const [dropoffLandmark, setDropoffLandmark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePostGig = () => {
    requireAuth(() => {
      router.push("/user/gigs/new");
    });
  };

  const handleRequestClick = (rider: { id: string, name: string, type: 'company' | 'individual' }) => {
    requireAuth(() => {
      setSelectedRider(rider);
      setIsModalOpen(true);
    });
  };

  const handleConfirmRequest = async () => {
    if (!user || !selectedRider) return;
    setSubmitting(true);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3);

    const { error } = await supabase.from('direct_requests').insert({
      user_id: user.id,
      rider_id: selectedRider.id,
      pickup_landmark: pickupLandmark,
      dropoff_landmark: dropoffLandmark,
      offered_price: selectedRider.type === 'company' ? 25 : 15,
      expires_at: expiresAt.toISOString()
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setIsModalOpen(false);
      setPickupLandmark("");
      setDropoffLandmark("");
      router.push("/user/activity");
    }
    setSubmitting(false);
  };

  const handleChatShopper = () => {
    requireAuth(() => {
      router.push("/user/chat/123e4567-e89b-12d3-a456-426614174000");
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] w-full pb-20 relative">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Section */}
        <div className="px-6 pt-16 pb-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full -ml-24 -mb-24"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">FetchIt Techiman</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                Everywhere, <span className="text-emerald-500">Fast.</span>
              </h1>
            </div>
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-white/10 shadow-xl group cursor-pointer hover:border-emerald-500/30 transition-all">
              <span className="font-black text-emerald-400 group-hover:scale-110 transition-transform">
                {user ? user.email?.charAt(0).toUpperCase() : "F"}
              </span>
            </div>
          </div>
          
          <div className="mt-10 relative z-10 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Where should we pick up or shop?"
                className="w-full glass text-white rounded-2xl py-5 pl-14 pr-6 outline-none font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Service Toggle */}
        <div className="px-6 py-4 flex flex-col gap-8">
          <div className="glass-dark p-1.5 rounded-[32px] flex items-center max-w-xl self-center w-full shadow-2xl border-white/5">
            <button 
              onClick={() => setServiceMode("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[26px] font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${
                serviceMode === "delivery" 
                  ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Bike className="w-4 h-4" />
              Logistics
            </button>
            <button 
              onClick={() => setServiceMode("shopping")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[26px] font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${
                serviceMode === "shopping" 
                  ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <User className="w-4 h-4" />
              Shoppers
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={serviceMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-6 rounded-[32px] max-w-3xl self-center w-full flex items-center gap-5 border-emerald-500/10"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-slate-300 text-xs font-bold leading-relaxed">
                {serviceMode === "delivery" 
                  ? "Instant logistics. Hire a verified rider to transport goods or handle errands across the city."
                  : "Expert shopping. Connect with vetted agents who know the local markets and deliver quality goods."
                }
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* List Section */}
        <div className="px-6 pb-24 flex-1">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-black text-white tracking-tight">
              {serviceMode === "delivery" ? "Active Dispatchers" : "Expert Agents"}
            </h2>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">Live Now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceMode === "delivery" ? (
              <>
                <RiderCard 
                  id="rider-1"
                  name="Individual Rider #1" 
                  type="individual" 
                  i={1} 
                  onAction={() => handleRequestClick({ id: '00000000-0000-0000-0000-000000000001', name: 'Individual Rider #1', type: 'individual' })} 
                />
                <RiderCard 
                  id="rider-2"
                  name="Express Logistics" 
                  type="company" 
                  i={2} 
                  onAction={() => handleRequestClick({ id: '00000000-0000-0000-0000-000000000002', name: 'Express Logistics', type: 'company' })} 
                />
                <RiderCard 
                  id="rider-3"
                  name="Individual Rider #3" 
                  type="individual" 
                  i={3} 
                  onAction={() => handleRequestClick({ id: '00000000-0000-0000-0000-000000000003', name: 'Individual Rider #3', type: 'individual' })} 
                />
              </>
            ) : (
              <>
                {[1, 2, 3].map((i) => (
                  <ShopperCard 
                    key={i} 
                    name={`Vetted Shopper #${i}`} 
                    i={i} 
                    onAction={handleChatShopper} 
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Direct Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md glass-dark rounded-t-[40px] overflow-hidden p-8 pt-10 shadow-2xl border-t border-white/10"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />
              
              <div className="flex items-center gap-5 mb-10">
                <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center border-emerald-500/20">
                  <Bike className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Request {selectedRider?.name}</h2>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Direct Dispatch</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Pickup Point</label>
                  <input 
                    type="text" 
                    value={pickupLandmark}
                    onChange={(e) => setPickupLandmark(e.target.value)}
                    placeholder="e.g. Near Top Oil Techiman"
                    className="w-full glass border-none rounded-2xl py-5 px-6 text-white font-bold placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Dropoff Point</label>
                  <input 
                    type="text" 
                    value={dropoffLandmark}
                    onChange={(e) => setDropoffLandmark(e.target.value)}
                    placeholder="e.g. Krobo Gate 3"
                    className="w-full glass border-none rounded-2xl py-5 px-6 text-white font-bold placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="glass p-6 rounded-3xl flex justify-between items-center border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Fare</span>
                  <span className="text-3xl font-black text-emerald-400">
                    GHS {selectedRider?.type === 'company' ? '25.00' : '15.00'}
                  </span>
                </div>

                <button 
                  onClick={handleConfirmRequest}
                  disabled={!pickupLandmark || !dropoffLandmark || submitting}
                  className="w-full bg-emerald-500 text-white font-black py-6 rounded-[28px] shadow-[0_20px_40px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 disabled:glass disabled:text-slate-600 disabled:shadow-none transition-all active:scale-95"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                  Confirm Direct Request
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                  Rider has 3 minutes to accept this request before it expires.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={handlePostGig}
          className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all group"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function RiderCard({ id, name, type, i, onAction }: { id: string, name: string, type: 'company' | 'individual', i: number, onAction: () => void }) {
  return (
    <div className="glass p-6 rounded-[32px] flex items-center justify-between hover:bg-white/5 transition-all group">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center overflow-hidden border-white/10 shadow-inner relative group-hover:scale-110 transition-transform">
          <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=rider-${i}`} alt="Avatar" fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h3 className="font-black text-white text-base">{name}</h3>
          <div className={`flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 w-max ${
            type === 'company' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {type === 'company' ? <ShieldCheck className="w-3 h-3 mr-1.5" /> : <User className="w-3 h-3 mr-1.5" />}
            {type === 'company' ? 'Verified Partner' : 'Freelance'}
          </div>
        </div>
      </div>
      <button 
        onClick={onAction}
        className="glass-dark text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 border-white/10"
      >
        Select
      </button>
    </div>
  );
}

function ShopperCard({ name, i, onAction }: { name: string, i: number, onAction: () => void }) {
  return (
    <div className="glass p-6 rounded-[32px] flex items-center justify-between hover:bg-white/5 transition-all group">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center overflow-hidden border-white/10 shadow-inner relative group-hover:scale-110 transition-transform">
          <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=shopper-${i}`} alt="Avatar" fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h3 className="font-black text-white text-base">{name}</h3>
          <div className="flex items-center text-emerald-400 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full mt-2 w-max border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 mr-1.5" />
            Market Expert
          </div>
        </div>
      </div>
      <button 
        onClick={onAction}
        className="glass-dark text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 border-white/10"
      >
        Connect
      </button>
    </div>
  );
}
