export interface CityConfig {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [lat, lng]
  defaultZoom: number;
}

export const SUPPORTED_CITIES: Record<string, CityConfig> = {
  techiman: {
    id: "techiman",
    name: "Techiman",
    region: "Bono East",
    coordinates: [7.5855, -1.9366],
    defaultZoom: 15,
  },
  sunyani: {
    id: "sunyani",
    name: "Sunyani",
    region: "Bono",
    coordinates: [7.3349, -2.3123],
    defaultZoom: 14,
  },
};

// For the MVP, we can default to Techiman if geolocation isn't available
export const DEFAULT_CITY = SUPPORTED_CITIES.techiman;
