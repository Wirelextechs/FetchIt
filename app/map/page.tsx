"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { BottomNav } from "@/components/layout/BottomNav";
import LocationInput from "@/components/map/LocationInput";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ShieldCheck, Star, Navigation } from "lucide-react";
import { SUPPORTED_CITIES } from "@/config/cities";

// CRITICAL: ssr: false prevents "window is not defined" errors from Leaflet
const RiderTrackingMap = dynamic(
  () => import("@/components/map/RiderTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
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
          <div className="backdrop-blur-md bg-black/60 border border-white/10 rounded-full px-4 py-2 text-white text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {city.name} • {RIDERS.length} riders active
          </div>

          {/* Satellite Toggle */}
          <button
            onClick={() => setIsSatellite((v) => !v)}
            className={`backdrop-blur-md border rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSatellite
                ? "bg-amber-500/80 border-amber-400/50 text-slate-900"
                : "bg-black/60 border-white/10 text-white"
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

      {/* ── 3. Bottom Sheet ── */}
      <div className={`absolute bottom-16 left-0 right-0 z-[500] px-3 transition-opacity duration-300 ${isAuthModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <AnimatePresence mode="wait">
          {!isAuthModalOpen && sheetState === "riders" && (
            <motion.div
              key="riders"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="backdrop-blur-md bg-black/70 border border-white/10 rounded-3xl p-4 shadow-2xl"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <h2 className="text-white font-bold text-base mb-3">
                Riders Available Nearby
              </h2>

              <div className="space-y-2">
                {RIDERS.map((rider) => (
                  <div
                    key={rider.id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={handleRequestRider}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          rider.type === "company"
                            ? "bg-amber-500/20 border-amber-500/40"
                            : "bg-emerald-600/20 border-emerald-500/40"
                        }`}
                      >
                        <Navigation
                          className={`w-5 h-5 ${
                            rider.type === "company" ? "text-amber-400" : "text-emerald-400"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-semibold text-sm">{rider.name}</span>
                          {rider.type === "company" && (
                            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              COMPANY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-white/50 text-xs">{rider.eta} away</span>
                          <span className="flex items-center gap-0.5 text-amber-400 text-xs">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {rider.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleRequestRider(); }}
                      className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                        rider.type === "company"
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-900"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      Request
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!isAuthModalOpen && sheetState === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="backdrop-blur-md bg-black/70 border border-white/10 rounded-3xl p-5 shadow-2xl"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <h2 className="text-white font-bold text-base mb-1">Confirm Pickup</h2>
              <p className="text-white/50 text-xs mb-4">
                Your rider will navigate to this location.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">📍</span>
                <p className="text-white text-sm font-medium">{confirmedLocation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSheetState("riders")}
                  className="py-3 rounded-2xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  ← Change
                </button>
                <button
                  onClick={handleRequestRider}
                  className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold transition-colors shadow-lg shadow-amber-500/20"
                >
                  Find My Rider →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
