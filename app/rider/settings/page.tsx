"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Bike, 
  Bell, 
  SunMoon, 
  Save, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Hash
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

export default function RiderSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Load Profile from DB
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Editable fields states (Vehicle Management)
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  // App Preferences states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfile(data);
          // Pull vehicle details from recent KYC submissions or placeholders
          setVehicleModel(data.vehicle_model || "Royal 125");
          setLicensePlate(data.license_plate || "AS-2024-TG");
        }
      } catch (err) {
        console.error("Error loading settings profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus(null);

    try {
      // Save changes back to public.users table
      const { error } = await supabase
        .from("users")
        .update({
          vehicle_model: vehicleModel,
          license_plate: licensePlate
        })
        .eq("id", user.id);

      if (error) throw error;

      setSaveStatus({ success: true, message: "Settings updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ success: false, message: err.message || "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-8 relative overflow-y-auto pb-40">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Constraints wrapper */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-start">
        
        {/* Header Back Link */}
        <button 
          onClick={() => router.push("/rider/profile")}
          className="self-start mb-6 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <h1 className="text-3xl font-black text-slate-950 dark:text-white mb-6 italic tracking-tight px-1">Rider Settings</h1>

        <div className="space-y-6">
          
          {/* SECTION 1: ACCOUNT DETAILS (READ-ONLY) */}
          <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <User className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Account Details (Read-Only)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</span>
                <span className="text-xs font-black text-slate-950 dark:text-white tracking-wider flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.phone || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ghana Card KYC Verification</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                  profile?.is_verified 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {profile?.is_verified ? "VERIFIED" : "UNVERIFIED"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: VEHICLE MANAGEMENT */}
          <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <Bike className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Vehicle Management</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Motorbike Brand / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Royal 125, Honda Ace"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">License Plate</label>
                <input
                  type="text"
                  placeholder="e.g. M-26-AS-489"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: APP PREFERENCES */}
          <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <Bell className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">App Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-950 dark:text-white">Push Notifications</span>
                  <span className="text-[10px] text-slate-400">Alert me immediately for near broadcast gigs</span>
                </div>
                <button 
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${
                    pushNotifications ? "bg-emerald-500 flex justify-end" : "bg-slate-200 dark:bg-white/10 flex justify-start"
                  }`}
                >
                  <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex justify-between items-center py-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-950 dark:text-white">App Color Mode</span>
                  <span className="text-[10px] text-slate-400">Dark Mode is optimized to preserve battery</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <SunMoon className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-350">
                    {isDarkMode ? "Dark Theme" : "Light Theme"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Save Status Warning/Check Alerts */}
          {saveStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                saveStatus.success 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}
            >
              {saveStatus.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="text-xs font-bold leading-relaxed">{saveStatus.message}</span>
            </motion.div>
          )}

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-40 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Database...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
