"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export type WalletStatus = "awaiting_funds" | "funded" | "released" | "withdrawn";

interface WalletWidgetProps {
  status: WalletStatus;
  balance: number;
  userRole: "user" | "shopper";
  onTopUp: (amount: number) => void;
  onRelease: () => void;
  onWithdraw: (momoNumber: string) => void;
}

export function WalletWidget({
  status,
  balance,
  userRole,
  onTopUp,
  onRelease,
  onWithdraw,
}: WalletWidgetProps) {
  const [topUpAmount, setTopUpAmount] = useState("");
  const [momoNumber, setMomoNumber] = useState("");

  return (
    <div className="w-full bg-card border-b border-border p-4 shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-foreground">
          <Wallet className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-sm">In-Chat MoMo Wallet</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full font-medium border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          <span>Moolre Secured</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "awaiting_funds" && userRole === "user" && (
          <motion.div
            key="awaiting_user"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">
              Negotiate the price with your shopper. When ready, top up this wallet.
            </p>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">GH₵</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-border bg-muted/50 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-foreground"
                />
              </div>
              <button
                onClick={() => onTopUp(Number(topUpAmount))}
                disabled={!topUpAmount || Number(topUpAmount) <= 0}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Top Up
              </button>
            </div>
          </motion.div>
        )}

        {status === "awaiting_funds" && userRole === "shopper" && (
          <motion.div
            key="awaiting_shopper"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-muted p-3 rounded-lg text-center border border-border"
          >
            <p className="text-sm text-muted-foreground">
              Awaiting user to fund the wallet. Do not purchase items yet.
            </p>
          </motion.div>
        )}

        {status === "funded" && (
          <motion.div
            key="funded"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg"
          >
            <div>
              <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider mb-1">Balance</p>
              <p className="text-2xl font-bold text-foreground">GH₵{balance.toFixed(2)}</p>
            </div>
            {userRole === "user" ? (
              <button
                onClick={onRelease}
                className="flex items-center space-x-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <span>Release Funds</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <p className="text-xs text-emerald-600 text-right font-medium max-w-[120px]">
                Funds secured. You may purchase items.
              </p>
            )}
          </motion.div>
        )}

        {status === "released" && userRole === "shopper" && (
          <motion.div
            key="released_shopper"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-semibold">Funds Released: GH₵{balance.toFixed(2)}</p>
            </div>
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                placeholder="Your MoMo Number"
                className="flex-1 px-3 py-2 border border-border bg-muted/50 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none text-foreground"
              />
              <button
                onClick={() => onWithdraw(momoNumber)}
                disabled={momoNumber.length < 10}
                className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </motion.div>
        )}

        {status === "released" && userRole === "user" && (
          <motion.div
            key="released_user"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-muted border border-border p-3 rounded-lg"
          >
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-bold text-foreground">Funds Released</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </motion.div>
        )}

        {status === "withdrawn" && (
          <motion.div
            key="withdrawn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center space-x-2 bg-muted text-muted-foreground p-3 rounded-lg border border-border"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Transaction Complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
