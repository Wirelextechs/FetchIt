"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Phone as PhoneIcon, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface LazyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LazyAuthModal({ isOpen, onClose, onSuccess }: LazyAuthModalProps) {
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a real-looking domain so Supabase's email validator accepts it.
  // The .local TLD is RFC-invalid and rejected by Supabase's backend.
  const formatEmail = (p: string) => `${p}@auth.fetchit.com`;
  const formatPassword = (p: string) => `fi-${p}-secure`;

  const handleNext = () => {
    if (phone.length >= 10) {
      setStep("pin");
      setError(null);
    } else {
      setError("Please enter a valid phone number.");
    }
  };

  const handleAuthenticate = async () => {
    if (pin.length < 4) {
      setError("PIN must be 4 digits.");
      return;
    }
    
    setLoading(true);
    setError(null);

    const email = formatEmail(phone);
    const password = formatPassword(pin);

    try {
      // Try to sign in first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          // If invalid login credentials, it means the user doesn't exist or PIN is wrong.
          // Let's try to sign up instead (since it's a passwordless/seamless UX, new users just "login" and it creates their account).
          const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            if (signUpError.message.includes("already registered")) {
               setError("Incorrect PIN. Please try again.");
            } else {
               setError(signUpError.message);
            }
          } else if (signUpData.user) {
            // Sync the new auth user to public.users table
            // This satisfies the gigs_user_id_fkey foreign key constraint
            await fetch('/api/auth/sync-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: signUpData.user.id,
                phone: phone,
              }),
            });
            onSuccess();
          }
        } else {
          setError(signInError.message);
        }
      } else {
        // Success Sign In — also ensure public.users record exists (backfill)
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user!.id, phone }),
        });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden p-6 pb-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-100/50 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center mb-8 mt-2">
              <h2 className="text-2xl font-bold text-slate-800">Welcome to FetchIt</h2>
              <p className="text-slate-500 text-sm mt-1">
                {step === "phone" ? "Enter your phone number to secure your order." : "Enter your 4-digit PIN."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.div
                  key="phone-step"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <PhoneIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 0241234567"
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-medium transition-all"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    onClick={handleNext}
                    disabled={phone.length < 10}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="pin-step"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-center text-2xl tracking-[1em] font-black transition-all"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    onClick={handleAuthenticate}
                    disabled={pin.length < 4 || loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-lg shadow-slate-900/20"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Secure Login</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setStep("phone");
                      setError(null);
                    }}
                    className="w-full text-slate-500 text-sm py-2 hover:text-slate-800 transition-colors"
                  >
                    Back to Phone
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
