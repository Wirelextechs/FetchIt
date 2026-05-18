"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, User, Phone, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setName(data.name || "");
        setPhoneNumber(data.phone_number || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-md mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-20 shadow-xl border-x border-border">
      <header className="px-6 py-8 flex items-center gap-4 border-b border-border">
        <Link href="/profile" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-foreground">Account Settings</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Profile Info Section */}
        <div className="space-y-6">
          <div className="flex flex-col items-center pb-4">
             <div className="w-20 h-20 bg-muted rounded-[28px] flex items-center justify-center text-muted-foreground/40 mb-2 border border-border shadow-inner">
                <User className="w-10 h-10" />
             </div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profile Picture</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-emerald-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-muted/50 border-none rounded-2xl py-4 pl-12 pr-4 text-foreground font-bold placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 px-1">Phone Number</label>
              <div className="relative opacity-60">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/30">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  disabled
                  className="w-full bg-muted/50 border-none rounded-2xl py-4 pl-12 pr-4 text-foreground font-bold outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 px-1">Phone number cannot be changed once verified.</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
              saved 
                ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10'
                : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Changes Saved
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
