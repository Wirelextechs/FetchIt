"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";

interface TimeoutFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  riderName: string;
}

export function TimeoutFallbackModal({ isOpen, onClose, onAccept, riderName }: TimeoutFallbackModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm glass rounded-[32px] overflow-hidden p-8 shadow-2xl border-border"
          >
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            
            <h2 className="text-xl font-black text-foreground text-center mb-2">Rider Unavailable</h2>
            <p className="text-sm text-muted-foreground text-center font-medium leading-relaxed mb-8">
              {riderName} didn't respond in time. Do you want to post this as an open gig to all nearby riders?
            </p>

            <div className="space-y-3">
              <button 
                onClick={onAccept}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
                Post to Broadcast
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-muted text-muted-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-muted/80"
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
