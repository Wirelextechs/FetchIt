"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { BottomNav } from "@/components/layout/BottomNav";
import LocationInput from "@/components/map/LocationInput";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Star, Navigation } from "lucide-react";
import { SUPPORTED_CITIES } from "@/config/cities";

// CRITICAL: ssr: false prevents "window is not defined" errors from Leaflet
const RiderTrackingMap = dynamic(
  () => import("@/components/map/RiderTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400/50 border-t-amber-400 rounded-full animate-spin" />
      </div>
    ),
  }
);

type BottomSheetState = "riders" | "confirm";

const RIDERS = [
  { id: 1, name: "Kwame A.", type: "company" as const, eta: "2 min", rating: 4.9 },
  { id: 2, name: "Ama B.", type: "individual" as const, eta: "5 min", rating: 4.7 },
  { id: 3, name: "Kofi C.", type: "company" as const, eta: "4 min", rating: 5.0 },
];

export default function MapPage() {
  const { requireAuth, isAuthModalOpen } = useAuth();
  const router = useRouter();

  const city = SUPPORTED_CITIES.techiman;
  const [sheetState, setSheetState] = useState<BottomSheetState>("riders");
  const [confirmedLocation, setConfirmedLocation] = useState<string | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLocationConfirm = (location: string) => {
    setConfirmedLocation(location);
    setSheetState("confirm");
  };

  const handleRequestRider = () => {
    requireAuth(() => {
      router.push("/user/chat/123e4567-e89b-12d3-a456-426614174000");
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        margin: "0 auto",
        overflow: "hidden",
      }}
      className="max-w-7xl"
    >
      {/* ── 1. Full-screen Live Map ── */}
      <RiderTrackingMap
        fallbackCenter={city.coordinates}
        isSatellite={isSatellite}
      />

      {/* ── 2. Top Bar ── */}
      <div className={`absolute top-0 left-0 right-0 z-[500] p-4 space-y-3 transition-opacity duration-300 ${isAuthModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* City badge + satellite toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="glass rounded-full px-4 py-2 text-foreground text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {city.name} • {RIDERS.length} riders active
          </div>

          {/* Satellite Toggle */}
          <button
            onClick={() => setIsSatellite((v) => !v)}
            className={`glass rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all border-border ${
              isSatellite
                ? "bg-emerald-500/80 border-emerald-400/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-foreground"
            }`}
          >
            {isSatellite ? "🗺 Street" : "🛰 Satellite"}
          </button>
        </div>

        {/* Location Input */}
        <LocationInput 
          onConfirm={handleLocationConfirm} 
          hideConfirmButton={sheetState === "confirm"}
        />
      </div>

      {/* ── 3. Floating Rider List ── */}
      <div className={`absolute bottom-28 right-4 z-[500] transition-opacity duration-300 ${isAuthModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <AnimatePresence mode="wait">
          {!isAuthModalOpen && sheetState === "riders" && (
            <motion.div
              key="rider-icon"
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-end gap-3"
            >
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="glass rounded-3xl p-4 shadow-2xl w-[320px] mb-2"
                >
                  <h2 className="text-foreground font-bold text-sm mb-3 px-1">
                    Nearby Riders
                  </h2>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {RIDERS.map((rider) => (
                      <div
                        key={rider.id}
                        className="flex items-center justify-between bg-card/50 border border-border rounded-2xl p-3 hover:bg-card/80 transition-colors cursor-pointer"
                        onClick={handleRequestRider}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                            rider.type === "company" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-blue-500/10 border-blue-500/30"
                          }`}>
                            <Navigation className={`w-4 h-4 ${rider.type === "company" ? "text-emerald-400" : "text-blue-400"}`} />
                          </div>
                          <div>
                            <div className="text-foreground font-bold text-xs">{rider.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-muted-foreground text-[10px]">{rider.eta}</span>
                              <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
                                <Star className="w-2.5 h-2.5 fill-emerald-400" />
                                {rider.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all">
                          Get
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-border ${
                  isExpanded ? "bg-foreground text-background" : "glass text-emerald-400"
                }`}
              >
                {isExpanded ? (
                  <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                    <Plus className="w-6 h-6 rotate-45" />
                  </motion.div>
                ) : (
                  <div className="relative">
                    <Navigation className="w-6 h-6 fill-emerald-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background">
                      {RIDERS.length}
                    </span>
                  </div>
                )}
              </button>
            </motion.div>
          )}

          {!isAuthModalOpen && sheetState === "confirm" && (
            <div className="fixed inset-x-4 bottom-28 z-[500]">
              <motion.div
                key="confirm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="glass rounded-[32px] p-6 shadow-2xl max-w-lg mx-auto border-border"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-foreground font-black text-lg tracking-tight">Confirm Pickup</h2>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Techiman Service Area</p>
                  </div>
                </div>

                <div className="bg-card/50 border border-border rounded-2xl p-4 mb-6">
                  <p className="text-foreground text-sm font-bold leading-relaxed">{confirmedLocation}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSheetState("riders")}
                    className="flex-1 py-4 rounded-2xl glass border-border text-foreground text-xs font-black uppercase tracking-widest hover:bg-card/50 transition-all"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleRequestRider}
                    className="flex-[2] py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                  >
                    Find Rider
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
