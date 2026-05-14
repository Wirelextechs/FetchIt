"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
const riderIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
           <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const gigIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-blue-500 rounded-lg border-2 border-white shadow-md flex items-center justify-center">
           <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
         </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function RadarMap({ gigs }: { gigs: any[] }) {
  const center: [number, number] = [7.5833, -1.9333]; // Techiman center

  return (
    <div className="w-full h-full relative group">
      <MapContainer 
        center={center} 
        zoom={14} 
        className="w-full h-full grayscale-[0.8] invert-[0.9] hue-rotate-[180deg] brightness-[0.7]"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {/* Rider's Pulse */}
        <Circle 
          center={center} 
          radius={500} 
          pathOptions={{ fillColor: '#10b981', fillOpacity: 0.1, color: '#10b981', weight: 1, dashArray: '5, 10' }} 
        />
        <Marker position={center} icon={riderIcon} />

        {/* Gig Markers */}
        {gigs.map((gig, idx) => (
          <Marker 
            key={gig.id || idx} 
            position={[
              7.5833 + (Math.random() - 0.5) * 0.015, 
              -1.9333 + (Math.random() - 0.5) * 0.015
            ]} 
            icon={gigIcon}
          >
            <Popup className="custom-popup">
              <div className="bg-slate-900 text-white p-3 rounded-xl border border-white/10 min-w-[120px]">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">New Gig</p>
                <p className="font-bold text-xs mb-1 truncate">{gig.pickup_landmark}</p>
                <p className="text-[10px] font-medium text-slate-400">GH₵ {Number(gig.offered_price).toFixed(2)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-[400]" />
    </div>
  );
}
