"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Plus, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

interface SavedLocation {
  id: string;
  label: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function SavedLocationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLocations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_locations').delete().eq('id', id);
    if (!error) {
      setLocations(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-32 border-x border-border shadow-xl">
      <header className="bg-card px-6 py-8 flex items-center gap-4 border-b border-border sticky top-0 z-20">
        <Link href="/profile" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-foreground">Saved Locations</h1>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading locations...</p>
          </div>
        ) : locations.length > 0 ? (
          <div className="space-y-4">
            <button 
              onClick={() => router.push("/profile/locations/new")}
              className="w-full bg-emerald-500/10 border-2 border-dashed border-emerald-500/20 rounded-[32px] p-6 flex flex-col items-center gap-2 text-emerald-500 hover:bg-emerald-500/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold">Add Another Location</span>
            </button>

            {locations.map((loc) => (
              <div key={loc.id} className="bg-card p-5 rounded-[32px] border border-border shadow-sm flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{loc.label}</h3>
                  <p className="text-xs text-muted-foreground truncate">{loc.description}</p>
                </div>
                <button 
                  onClick={() => handleDelete(loc.id)}
                  className="p-2 text-muted-foreground/30 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[32px] flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
              <MapPin className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">No Saved Places</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">Save your home, office, or favorite shops to book gigs even faster.</p>
            
            <button 
              onClick={() => router.push("/profile/locations/new")}
              className="bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
