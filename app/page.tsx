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
    <div className="flex flex-col min-h-screen bg-slate-50 w-full pb-20 relative">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Section */}
        <div className="bg-emerald-600 px-6 pt-12 pb-10 text-white md:rounded-[40px] md:mt-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 mix-blend-overlay w-64 h-64 -mr-16 -mt-16 rounded-full bg-white blur-3xl"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Current Location</p>
              <h1 className="text-xl font-bold flex items-center mt-1">
                <MapPin className="w-5 h-5 mr-1" />
                {DEFAULT_CITY.name} Region
              </h1>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <span className="font-bold text-lg">
                {user ? user.email?.charAt(0).toUpperCase() : "G"}
              </span>
            </div>
          </div>
          
          <div className="mt-8 relative z-10 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="What do you need? (e.g., Delivery, Groceries)"
                className="w-full bg-white text-slate-800 rounded-2xl py-4 pl-12 pr-4 shadow-sm outline-none font-medium placeholder:font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Service Toggle */}
        <div className="px-6 py-8 flex flex-col gap-6">
          <div className="bg-white p-2 rounded-[28px] shadow-xl border border-slate-100 flex items-center max-w-xl self-center w-full">
            <button 
              onClick={() => setServiceMode("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                serviceMode === "delivery" 
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Bike className="w-4 h-4" />
              Delivery Riders
            </button>
            <button 
              onClick={() => setServiceMode("shopping")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                serviceMode === "shopping" 
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4" />
              Personal Shoppers
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={serviceMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 p-6 rounded-[32px] max-w-3xl self-center w-full shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-emerald-800 text-xs md:text-sm font-bold leading-relaxed">
                {serviceMode === "delivery" 
                  ? "Fast logistics. Hire a rider to move packages or run quick custom errands."
                  : "Market experts. Hire a vetted shopper to buy groceries and goods safely in the market for you."
                }
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* List Section */}
        <div className="px-6 pb-24 flex-1">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {serviceMode === "delivery" ? "Available Riders" : "Available Shoppers"}
            </h2>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">See all</span>
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
              className="relative w-full max-w-md bg-white rounded-t-[32px] overflow-hidden p-6 pt-8 shadow-2xl"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Bike className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Request {selectedRider?.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">Direct Booking Mode</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pickup Landmark</label>
                  <input 
                    type="text" 
                    value={pickupLandmark}
                    onChange={(e) => setPickupLandmark(e.target.value)}
                    placeholder="e.g. Near Top Oil Techiman"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-800 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dropoff Landmark</label>
                  <input 
                    type="text" 
                    value={dropoffLandmark}
                    onChange={(e) => setDropoffLandmark(e.target.value)}
                    placeholder="e.g. Krobo Gate 3"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-800 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl flex justify-between items-center border border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Estimated Cost</span>
                  <span className="text-2xl font-black text-emerald-600">
                    GHS {selectedRider?.type === 'company' ? '25.00' : '15.00'}
                  </span>
                </div>

                <button 
                  onClick={handleConfirmRequest}
                  disabled={!pickupLandmark || !dropoffLandmark || submitting}
                  className="w-full bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none transition-all active:scale-95"
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
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-slate-200 rounded-[24px] flex items-center justify-center overflow-hidden border-2 border-emerald-100 shadow-inner relative">
          <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=rider-${i}`} alt="Avatar" fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h3 className="font-black text-slate-800 text-base">{name}</h3>
          <div className={`flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 w-max ${
            type === 'company' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            {type === 'company' ? <ShieldCheck className="w-3 h-3 mr-1.5" /> : <User className="w-3 h-3 mr-1.5" />}
            {type === 'company' ? 'Company Verified' : 'Individual'}
          </div>
        </div>
      </div>
      <button 
        onClick={onAction}
        className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg"
      >
        Request
      </button>
    </div>
  );
}

function ShopperCard({ name, i, onAction }: { name: string, i: number, onAction: () => void }) {
  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-slate-200 rounded-[24px] flex items-center justify-center overflow-hidden border-2 border-emerald-100 shadow-inner relative">
          <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=shopper-${i}`} alt="Avatar" fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h3 className="font-black text-slate-800 text-base">{name}</h3>
          <div className="flex items-center text-emerald-600 text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mt-2 w-max border border-emerald-100">
            <ShieldCheck className="w-3 h-3 mr-1.5" />
            Verified Shopper
          </div>
        </div>
      </div>
      <button 
        onClick={onAction}
        className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg"
      >
        Chat
      </button>
    </div>
  );
}
