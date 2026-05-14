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
    <div className="w-full bg-slate-50 border-b border-slate-200 p-4 shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-slate-800">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-sm">In-Chat MoMo Wallet</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
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
            <p className="text-xs text-slate-500">
              Negotiate the price with your shopper. When ready, top up this wallet.
            </p>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">GH₵</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
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
            className="bg-slate-100 p-3 rounded-lg text-center"
          >
            <p className="text-sm text-slate-600">
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
            className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-lg"
          >
            <div>
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">Balance</p>
              <p className="text-2xl font-bold text-slate-800">GH₵{balance.toFixed(2)}</p>
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
            className="space-y-3 bg-emerald-50 border border-emerald-200 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-semibold">Funds Released: GH₵{balance.toFixed(2)}</p>
            </div>
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                placeholder="Your MoMo Number"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={() => onWithdraw(momoNumber)}
                disabled={momoNumber.length < 10}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors"
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
            className="flex items-center justify-between bg-slate-100 border border-slate-200 p-3 rounded-lg"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-bold text-slate-800">Funds Released</p>
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
            className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 p-3 rounded-lg border border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Transaction Complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
