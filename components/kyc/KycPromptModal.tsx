"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CreditCard, User, Bike, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface KycPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KycPromptModal({ isOpen, onClose }: KycPromptModalProps) {
  const router = useRouter();

  const handleStartKyc = () => {
    onClose();
    router.push("/rider/profile");
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

            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 border border-emerald-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Verify Your Identity to Earn</h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold mt-2 px-2 leading-relaxed">
                To protect our customers and enable instant Moolre MoMo payouts, FetchIt requires identity verification before you can claim gigs. It takes less than 2 minutes.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Documents Needed:</p>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-950 dark:text-white">Ghana Card</p>
                  <p className="text-[10px] text-slate-500">Valid National ID document</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-950 dark:text-white">Live Selfie</p>
                  <p className="text-[10px] text-slate-500">For face verification match</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-950 dark:text-white">Motorbike / Tricycle Details</p>
                  <p className="text-[10px] text-slate-500">Vehicle registration number</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartKyc}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
              >
                Start Verification
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider py-2 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
