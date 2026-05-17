"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

// ── Custom Markers ──────────────────────────────────────────────
const companyRiderIcon = L.divIcon({
  className: "",
  html: `<div style="width:48px;height:48px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 0 0 3px rgba(245,158,11,0.35),0 4px 14px rgba(0,0,0,0.35);">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -28],
});

const individualRiderIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.25);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
});

const userLocationIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="position:absolute;inset:-12px;background:rgba(59,130,246,0.15);border-radius:50%;animation:ping 1.5s ease-in-out infinite;"></div>
    <div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:1;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ── Fly-to helper ────────────────────────────────────────────────
function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// ── Tile Layer URLs ──────────────────────────────────────────────
const TILE_LAYERS = {
  standard: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18,
  },
};

// ── Props ────────────────────────────────────────────────────────
interface RiderTrackingMapProps {
  fallbackCenter: [number, number]; // city center used only if GPS denied
  isSatellite: boolean;
  onUserLocationFound?: (coords: [number, number]) => void;
}

export default function RiderTrackingMap({
  fallbackCenter,
  isSatellite,
  onUserLocationFound,
}: RiderTrackingMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(fallbackCenter);
  const [locating, setLocating] = useState(true);

  // Attempt GPS on mount
  useEffect(() => {
    let isMounted = true;
    if (!navigator.geolocation) {
      const timer = setTimeout(() => {
        if (isMounted) setLocating(false);
      }, 0);
      return () => { isMounted = false; clearTimeout(timer); };
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMounted) return;
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        onUserLocationFound?.(coords);
        if (isMounted) setLocating(false);
      },
      () => {
        if (!isMounted) return;
        // Permission denied or error — fall back to city center
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 30000 }
    );
    return () => { isMounted = false; };
  }, [onUserLocationFound]);

  // Generate dummy riders offset from the map center (user or city)
  // Use useMemo to prevent re-calculating on every render which causes jitter
  const activeRiders = useMemo(() => [
    { id: 1, type: "company", lat: mapCenter[0] + 0.002, lng: mapCenter[1] + 0.001, name: "Kwame A.", eta: "2 min" },
    { id: 2, type: "individual", lat: mapCenter[0] - 0.0015, lng: mapCenter[1] - 0.0022, name: "Ama B.", eta: "5 min" },
    { id: 3, type: "company", lat: mapCenter[0] + 0.003, lng: mapCenter[1] - 0.0028, name: "Kofi C.", eta: "4 min" },
  ], [mapCenter]);

  const layer = isSatellite ? TILE_LAYERS.satellite : TILE_LAYERS.standard;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {locating && (
        <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 600, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", color: "white", fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)" }}>
          📍 Finding your location…
        </div>
      )}

      <MapContainer
        center={fallbackCenter}
        zoom={15}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        {/* Fly to user's real location once found */}
        <FlyToCenter center={mapCenter} />

        <TileLayer
          key={isSatellite ? "satellite" : "standard"} // key forces re-mount on toggle
          url={layer.url}
          attribution={layer.attribution}
          maxZoom={layer.maxZoom}
        />

        {/* User's real location dot */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup><b style={{ fontSize: 12 }}>📍 You are here</b></Popup>
          </Marker>
        )}

        {/* Nearby Riders */}
        {activeRiders.map((rider) => (
          <Marker
            key={rider.id}
            position={[rider.lat, rider.lng]}
            icon={rider.type === "company" ? companyRiderIcon : individualRiderIcon}
          >
            <Popup>
              <div style={{ minWidth: 140 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{rider.name}</div>
                <div style={{ color: rider.type === "company" ? "#d97706" : "#059669", fontSize: 11, marginTop: 2 }}>
                  {rider.type === "company" ? "✅ Verified Company Rider" : "🟢 Independent Rider"}
                </div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>⏱ {rider.eta} away</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
