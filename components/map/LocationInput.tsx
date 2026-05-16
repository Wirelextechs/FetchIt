"use client";

import { useState } from "react";
import { MapPin, Search, X } from "lucide-react";

interface LocationInputProps {
  onConfirm: (location: string) => void;
  hideConfirmButton?: boolean;
}

const COMMON_LANDMARKS = [
  "Behind Main Mosque, Techiman",
  "Techiman Central Market",
  "Techiman Bus Terminal",
  "Kenten Junction",
  "Fiapre Road, Sunyani",
  "Sunyani Market Circle",
];

export default function LocationInput({ onConfirm, hideConfirmButton }: LocationInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setValue(text);
    if (text.length > 1) {
      setSuggestions(
        COMMON_LANDMARKS.filter((l) =>
          l.toLowerCase().includes(text.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (landmark: string) => {
    setValue(landmark);
    setSuggestions([]);
    setFocused(false);
  };

  return (
    <div className="relative">
      {/* Main Input — Obsidian Glassmorphism */}
      <div className="flex items-center gap-3 backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
        <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Enter landmark or description... (e.g. Blue gate near mosque)"
          className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm font-medium"
        />
        {value && (
          <button onClick={() => setValue("")}>
            <X className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* Helper label */}
      <p className="text-white/30 text-[10px] font-medium mt-2 ml-1">
        💡 No pin needed — describe any local landmark and your rider will find you.
      </p>

      {/* Suggestions Dropdown */}
      {focused && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 backdrop-blur-md bg-black/80 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Confirm Button */}
      {value.length > 3 && !hideConfirmButton && (
        <button
          onClick={() => onConfirm(value)}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm"
        >
          Confirm Pickup Location →
        </button>
      )}
    </div>
  );
}
