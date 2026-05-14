"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Save, Loader2, ChevronDown, 
  PenLine, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { GHANA_REGIONS, getTowns, getLocalAreas } from "@/config/ghana-locations";

// ── Reusable Select Component ─────────────────────────────────────────────────
function SelectField({
  label, value, onChange, options, placeholder, disabled = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-12 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer ${
            disabled ? "opacity-40 cursor-not-allowed" : ""
          } ${!value ? "text-slate-300" : "text-slate-800"}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${disabled ? "text-slate-200" : "text-slate-400"}`} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AddLocationPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [region, setRegion] = useState("");
  const [town, setTown] = useState("");
  const [localArea, setLocalArea] = useState("");
  const [manualArea, setManualArea] = useState("");
  const [useManualArea, setUseManualArea] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const towns = region ? getTowns(region) : [];
  const localAreas = region && town ? getLocalAreas(region, town) : [];

  // Reset downstream when upstream changes
  useEffect(() => { setTown(""); setLocalArea(""); setManualArea(""); setUseManualArea(false); }, [region]);
  useEffect(() => { setLocalArea(""); setManualArea(""); setUseManualArea(false); }, [town]);

  const finalArea = useManualArea ? manualArea : localArea;

  const canSave = !!label && !!region && !!town;

  const handleSave = async () => {
    if (!user || !canSave) return;
    setLoading(true);

    const fullLabel = label;
    const fullDescription = [
      finalArea,
      town,
      region + " Region",
      description
    ].filter(Boolean).join(", ");

    const { error } = await supabase.from("saved_locations").insert({
      user_id: user.id,
      label: fullLabel,
      description: fullDescription,
      latitude: null,
      longitude: null,
    });

    if (error) { alert("Failed to save: " + error.message); }
    else { router.push("/profile/locations"); }
    setLoading(false);
  };

  // ── Progress steps ────────────────────────────────────────────────────────
  const steps = [
    { key: "region", label: "Region", done: !!region },
    { key: "town", label: "Town", done: !!town },
    { key: "area", label: "Area", done: !!(localArea || manualArea) },
    { key: "detail", label: "Details", done: !!description },
  ];

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col shadow-xl border-x border-slate-100">
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4 border-b border-slate-50 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <Link href="/profile/locations" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800">Add New Location</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Fill in your area details</p>
        </div>
      </header>

      {/* Progress steps */}
      <div className="px-6 pt-5 pb-2 flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-1.5 flex-1">
            <div className={`flex items-center gap-1.5 transition-all ${step.done ? "text-emerald-600" : "text-slate-300"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                step.done ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-200 text-slate-300"
              }`}>
                {step.done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold hidden sm:block ${step.done ? "text-emerald-600" : "text-slate-300"}`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] rounded-full transition-all ${step.done ? "bg-emerald-300" : "bg-slate-100"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-36 px-6 pt-4 space-y-5">

        {/* Location name */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
            Location Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Home, Office, Mum's House"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-slate-100" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Location</span>
          <div className="flex-1 border-t border-slate-100" />
        </div>

        {/* Step 1 — Region */}
        <SelectField
          label="Region *"
          value={region}
          onChange={setRegion}
          options={GHANA_REGIONS}
          placeholder="Select your region…"
        />

        {/* Step 2 — Town */}
        <SelectField
          label="Town / City *"
          value={town}
          onChange={setTown}
          options={towns}
          placeholder={region ? "Select your town…" : "Select a region first"}
          disabled={!region}
        />

        {/* Step 3 — Local Area */}
        {town && (
          <div className="space-y-3">
            {!useManualArea ? (
              <>
                <SelectField
                  label="Local Area / Neighbourhood"
                  value={localArea}
                  onChange={setLocalArea}
                  options={localAreas}
                  placeholder="Select your local area…"
                  disabled={localAreas.length === 0}
                />
                <button
                  onClick={() => { setUseManualArea(true); setLocalArea(""); }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 px-1"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  My area isn't listed — enter it manually
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Local Area / Neighbourhood</label>
                  <input
                    type="text"
                    value={manualArea}
                    onChange={(e) => setManualArea(e.target.value)}
                    placeholder="e.g. Krobo, Atonsu, Nkyia Lane…"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => { setUseManualArea(false); setManualArea(""); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 px-1"
                >
                  ← Back to dropdown
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 4 — Description */}
        {town && (
          <>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 border-t border-slate-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Directions</span>
              <div className="flex-1 border-t border-slate-100" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                Detailed Description <span className="text-slate-300 font-normal">(helps riders find you)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Yellow gate at the end of the road, opposite the church. Call on arrival."
                rows={4}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
              />
            </div>
          </>
        )}

        {/* Summary preview */}
        {region && town && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Location Preview</p>
              <p className="text-sm font-bold text-slate-700">
                {[finalArea, town, region + " Region"].filter(Boolean).join(" · ")}
              </p>
              {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-5 bg-white/90 backdrop-blur-md border-t border-slate-50 z-50">
        <button
          onClick={handleSave}
          disabled={!canSave || loading}
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none transition-all active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {canSave ? "Confirm & Save Place" : "Select Region & Town to Save"}
        </button>
      </div>
    </div>
  );
}
