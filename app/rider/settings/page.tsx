"use client";

import { useState, useEffect, useRef } from "react";
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
  Hash,
  Camera,
  MapPin,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

export default function RiderSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Profile data & loading
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // SECTION 1: Edit Profile states
  const [fullNameState, setFullNameState] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // SECTION 2: My Rates & Zones states
  const [priceWithinCity, setPriceWithinCity] = useState(15);
  const [priceAroundCity, setPriceAroundCity] = useState(30);
  const [priceOutsideCity, setPriceOutsideCity] = useState(50);
  const [pricingSaving, setPricingSaving] = useState(false);

  // SECTION 3: Vehicle Management states
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleSaving, setVehicleSaving] = useState(false);

  // SECTION 4: App Preferences states
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
          setFullNameState(data.full_name || "");
          setAvatarUrl(data.avatar_url || "");
          setVehicleModel(data.vehicle_model || "Royal 125");
          setLicensePlate(data.license_plate || "AS-2024-TG");
          
          // Pricing zone matrix defaults
          setPriceWithinCity(data.price_within_city !== null ? Number(data.price_within_city) : 15);
          setPriceAroundCity(data.price_around_city !== null ? Number(data.price_around_city) : 30);
          setPriceOutsideCity(data.price_outside_city !== null ? Number(data.price_outside_city) : 50);
        }
      } catch (err) {
        console.error("Error loading settings profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Profile fields saving
  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setSaveStatus(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullNameState,
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) throw error;
      setSaveStatus({ success: true, message: "Profile updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ success: false, message: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Avatar file upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setSaveStatus(null);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload image binary directly
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      // Get public reading URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Instantly synchronize with DB
      const { error: dbError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setSaveStatus({ success: true, message: "New avatar uploaded and synced successfully!" });
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ success: false, message: err.message || "Avatar upload failed." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Pricing zones Matrix saving
  const handleSavePricing = async () => {
    if (!user) return;
    setPricingSaving(true);
    setSaveStatus(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          price_within_city: Number(priceWithinCity),
          price_around_city: Number(priceAroundCity),
          price_outside_city: Number(priceOutsideCity)
        })
        .eq("id", user.id);

      if (error) throw error;
      setSaveStatus({ success: true, message: "Zone pricing matrix updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ success: false, message: err.message || "Failed to update pricing rates." });
    } finally {
      setPricingSaving(false);
    }
  };

  // Vehicle saving
  const handleSaveVehicle = async () => {
    if (!user) return;
    setVehicleSaving(true);
    setSaveStatus(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          vehicle_model: vehicleModel,
          license_plate: licensePlate
        })
        .eq("id", user.id);

      if (error) throw error;
      setSaveStatus({ success: true, message: "Vehicle details updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ success: false, message: err.message || "Failed to update vehicle details." });
    } finally {
      setVehicleSaving(false);
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
    <div className="min-h-screen flex flex-col overflow-y-auto pb-32 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-8 relative">
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

          {/* SECTION 1: EDIT PROFILE (AVATAR & DISPLAY NAME) */}
          <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <User className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 font-sans">Edit Profile Card</h2>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              {/* Circular Click to upload Avatar */}
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full bg-muted border-4 border-white dark:border-slate-800 overflow-hidden relative shadow-md">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'rider'}`}
                      alt="Placeholder Avatar"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 text-white shadow-md group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
              </div>

              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Click photo to upload avatar</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Display Name</label>
                <input
                  type="text"
                  placeholder="Kwame Mensah"
                  value={fullNameState}
                  onChange={(e) => setFullNameState(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Identity...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Identity
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 2: MY RATES & ZONES (CITY CONFIGURATION CARD) */}
          <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">My Rates & Zones (Techiman GHS)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Within Techiman Central (GHS)</label>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Zone A</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-450">GH₵</div>
                  <input
                    type="number"
                    value={priceWithinCity}
                    onChange={(e) => setPriceWithinCity(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Around Techiman (GHS)</label>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Zone B</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-450">GH₵</div>
                  <input
                    type="number"
                    value={priceAroundCity}
                    onChange={(e) => setPriceAroundCity(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Outside Techiman (GHS)</label>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Zone C</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-450">GH₵</div>
                  <input
                    type="number"
                    value={priceOutsideCity}
                    onChange={(e) => setPriceOutsideCity(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold transition-all text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePricing}
                disabled={pricingSaving}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                {pricingSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Pricing Matrix...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Pricing Matrix
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 3: ACCOUNT DETAILS (READ-ONLY) */}
          <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <User className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Account details (Read-Only)</h2>
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

          {/* SECTION 4: VEHICLE MANAGEMENT */}
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

              <button
                onClick={handleSaveVehicle}
                disabled={vehicleSaving}
                className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {vehicleSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Asset...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Asset Details
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 5: APP PREFERENCES */}
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

        </div>
      </div>
    </div>
  );
}
