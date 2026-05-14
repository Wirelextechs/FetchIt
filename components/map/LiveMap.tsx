"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js, though we will use custom DivIcons anyway
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default?.src || "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: require("leaflet/dist/images/marker-icon.png").default?.src || "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png").default?.src || "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// A custom HTML icon using Tailwind and Lucide-like styling
const createRiderIcon = (delay: number) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div class="relative group cursor-pointer" style="animation: bounce 2s infinite ${delay}s;">
        <div class="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const userIcon = L.divIcon({
  className: "custom-user-icon",
  html: `
    <div class="relative">
      <div class="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute -top-5 -left-5"></div>
      <div class="w-6 h-6 bg-blue-600 border-4 border-white rounded-full relative z-10 shadow-md"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface LiveMapProps {
  center: [number, number];
  riders: { id: number; lat: number; lng: number; delay: number }[];
}

export default function LiveMap({ center, riders }: LiveMapProps) {
  return (
    <div className="absolute inset-0 z-0" style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={15} 
        zoomControl={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* User Location */}
        <Marker position={center} icon={userIcon} />

        {/* Rider Markers */}
        {riders.map((rider) => (
          <Marker 
            key={rider.id} 
            position={[rider.lat, rider.lng]} 
            icon={createRiderIcon(rider.delay)}
          >
            <Popup className="rounded-xl">
              <div className="font-bold text-slate-800">Company Rider #{rider.id}</div>
              <div className="text-emerald-600 text-xs">2 mins away</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
