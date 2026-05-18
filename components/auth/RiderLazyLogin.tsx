"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Phone as PhoneIcon, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface RiderLazyLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RiderLazyLogin({ isOpen, onClose, onSuccess }: RiderLazyLoginProps) {
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email/Password mapping for seamless lazy account creation
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
      let userId: string | null = null;

      // 1. Try to sign in first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          // 2. If user doesn't exist, create a new account
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
            setLoading(false);
            return;
          } else if (signUpData.user) {
            userId = signUpData.user.id;
            // Sync new user to public.users table
            await fetch('/api/auth/sync-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, phone }),
            });
          }
        } else {
          setError(signInError.message);
          setLoading(false);
          return;
        }
      } else if (data.user) {
        userId = data.user.id;
        // Backfill public.users record if missing
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, phone }),
        });
      }

      // 3. Set role = 'rider' and is_verified = false for this authenticated user
      if (userId) {
        const { error: roleError } = await supabase
          .from('users')
          .update({ role: 'rider', is_verified: false })
          .eq('id', userId);

        if (roleError) {
          console.error("Error setting rider role:", roleError);
        }
        
        onSuccess();
      } else {
        setError("Authentication failed. Please try again.");
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
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden p-6 pb-8 border border-slate-200/50 dark:border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center mb-8 mt-2 space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Become a FetchIt Rider</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                {step === "phone" ? "Enter your phone number to start earning in Techiman." : "Setup a 4-digit security PIN."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.div
                  key="phone-step"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
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
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold transition-all text-slate-950 dark:text-white"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                  <button
                    onClick={handleNext}
                    disabled={phone.length < 10}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="pin-step"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-6"
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
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-center text-2xl tracking-[1em] font-black transition-all text-slate-950 dark:text-white"
                      autoFocus
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide text-center leading-normal max-w-xs mx-auto">
                    By entering your number to continue, you agree to register as a FetchIt Delivery Rider / Shopper.
                  </p>

                  {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                  <button
                    onClick={handleAuthenticate}
                    disabled={pin.length < 4 || loading}
                    className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Agree & Secure Login</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setStep("phone");
                      setError(null);
                    }}
                    className="w-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider py-2 hover:text-slate-900 dark:hover:text-white transition-colors"
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
