export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  fee: number;
  isEvCharging: boolean;
  isAccessible: boolean;
  openNow: boolean;
  distanceKm?: number | null;
  prediction?: AIPrediction;
}

export interface AIPrediction {
  predicted_available_slots: number;
  success_probability: number;
  estimated_search_time_minutes: number;
  confidence_score: number;
  recommendation: string;
}

export interface DashboardStats {
  totalParkingLocations: number;
  nearbyParking: number;
  averageOccupancy: number;
  predictionAccuracy: number;
  todaysSearches: number;
  trafficLevel: "Low" | "Moderate" | "High";
}

export interface HourlyPoint { hour: string; occupancy: number; }
export interface WeeklyPoint { day: string; occupancy: number; }
export interface PeakHour { label: string; window: string; occupancy: number; }

export interface FilterState {
  ev: boolean;
  accessible: boolean;
  openNow: boolean;
  sort: "" | "nearest" | "most-available" | "cheapest";
}