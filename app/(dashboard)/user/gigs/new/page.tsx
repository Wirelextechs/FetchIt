"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Navigation,
  Coins,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

// ── Types ────────────────────────────────────────────────────────
interface GigForm {
  description: string;
  pickup_landmark: string;
  dropoff_landmark: string;
  offered_price: string;
  gig_type: "delivery" | "errand" | "shopping";
}

const GIG_TYPES = [
  { value: "delivery", label: "📦 Delivery", desc: "Move an item from A to B" },
  { value: "errand",   label: "🏃 Errand",   desc: "Pay a bill, pick something up" },
  { value: "shopping", label: "🛍 Shopping", desc: "Buy items on my behalf" },
] as const;

// ── Page ─────────────────────────────────────────────────────────
export default function PostGigPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<GigForm>({
    description: "",
    pickup_landmark: "",
    dropoff_landmark: "",
    offered_price: "",
    gig_type: "delivery",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const set = (field: keyof GigForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    form.description.length >= 10 &&
    form.pickup_landmark.length >= 5 &&
    Number(form.offered_price) > 0;

  const handleSubmit = async () => {
    if (!user) return;
    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The gig is inserted with is_visible_to_all = false.
      // A DB trigger (or background job) flips this to true after 5 minutes,
      // opening it up to Individual Riders after Company Riders had first dibs.
      const { error: insertError } = await supabase.from("gigs").insert({
        user_id: user.id,
        description: form.description,
        pickup_landmark: form.pickup_landmark,
        dropoff_landmark: form.dropoff_landmark || null,
        offered_price: Number(form.offered_price),
        gig_type: form.gig_type,
        status: "pending",
        is_visible_to_all: false, // Shadow timer: Company-only for first 5 mins
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      // Redirect to gig dashboard after short celebration pause
      setTimeout(() => router.push("/user/gigs"), 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center w-full px-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="max-w-md"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Gig Posted!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your gig is live. Our verified Company Riders have first priority for
            the next 5 minutes.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Shadow Timer Active</span>
            </div>
            <p className="text-xs text-amber-500/80">
              Company Riders are notified first. After 5 minutes, all available
              riders will see your gig.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Redirecting you to your gigs…</p>
        </motion.div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col relative pb-32">
      {/* Header */}
      <div className="bg-card sticky top-0 z-20 px-4 pt-10 pb-4 border-b border-border shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Post a Gig</h1>
        </div>
        <p className="text-xs text-muted-foreground ml-12">
          Tell us what you need done. Be specific so riders can help you better.
        </p>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">

        {/* Gig Type Selector */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Gig Type
          </label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {GIG_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm((p) => ({ ...p, gig_type: t.value }))}
                className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all text-xs font-semibold gap-1 ${
                  form.gig_type === t.value
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                <span className="text-xl">{t.label.split(" ")[0]}</span>
                {t.label.split(" ").slice(1).join(" ")}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> What do you need done?
            <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="e.g. Pick up 2 bags of rice from Mamprusi lane market and deliver to my house. The rice should be Tasia brand."
            rows={4}
            className="w-full mt-2 text-sm text-foreground bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder:text-muted-foreground transition-all"
          />
          <p className={`text-xs mt-1 text-right ${form.description.length < 10 && form.description.length > 0 ? "text-red-400" : "text-muted-foreground"}`}>
            {form.description.length} chars {form.description.length < 10 ? `(min 10)` : "✓"}
          </p>
        </div>

        {/* Landmarks */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Locations
          </label>

          {/* Pickup */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground/70">
                Pickup Landmark <span className="text-red-400">*</span>
              </span>
            </div>
            <input
              type="text"
              value={form.pickup_landmark}
              onChange={set("pickup_landmark")}
              placeholder="e.g. Blue gate behind the main mosque, Techiman"
              className="w-full text-sm text-foreground bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-muted-foreground transition-all"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 -my-1">
            <div className="flex-1 border-t border-dashed border-border" />
            <Navigation className="w-4 h-4 text-muted-foreground rotate-180" />
            <div className="flex-1 border-t border-dashed border-border" />
          </div>

          {/* Dropoff */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
              <span className="text-xs font-semibold text-foreground/70">
                Dropoff / Delivery Landmark{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </span>
            </div>
            <input
              type="text"
              value={form.dropoff_landmark}
              onChange={set("dropoff_landmark")}
              placeholder="e.g. White fence, 2nd junction after Kenten"
              className="w-full text-sm text-foreground bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-muted-foreground transition-all"
            />
          </div>

          {/* No-pin note */}
          <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-xl p-2.5 border border-border">
            💡 Describe any local landmark. No map pin needed — our riders know Techiman and Sunyani well.
          </p>
        </div>

        {/* Price */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" /> Your Offer (GH₵)
            <span className="text-red-400">*</span>
          </label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
              GH₵
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={form.offered_price}
              onChange={set("offered_price")}
              placeholder="0.00"
              className="w-full pl-14 pr-4 py-4 text-xl font-bold text-foreground bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-muted-foreground/30 transition-all"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Set a fair price. Riders can accept or decline. Negotiation happens in the chat.
          </p>

          {/* Price guide toggle */}
          <button
            onClick={() => setShowTip((v) => !v)}
            className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1 hover:text-emerald-700 transition-colors"
          >
            {showTip ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Typical price ranges in Techiman
          </button>

          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {[
                    ["Short delivery (within town)", "GH₵10 – GH₵25"],
                    ["Grocery shopping run", "GH₵30 – GH₵80"],
                    ["Bill payment errand", "GH₵15 – GH₵30"],
                    ["Long-distance pickup", "GH₵50 – GH₵150"],
                  ].map(([label, range]) => (
                    <div key={label} className="flex justify-between bg-muted px-3 py-2 rounded-xl border border-border">
                      <span>{label}</span>
                      <span className="font-bold text-emerald-600">{range}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-3 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Submit Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4 z-30">
        <div className="max-w-4xl mx-auto">
          {/* Shadow timer info pill */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-500/80 font-medium">
              Company Riders get <span className="font-bold">5 min priority</span> before all riders see your gig.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Post Gig</span>
                <span className="text-emerald-200 text-sm font-normal">
                  {form.offered_price ? `· GH₵${form.offered_price}` : ""}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
