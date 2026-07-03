import axios from "axios";
import type { ParkingLocation, DashboardStats, HourlyPoint, WeeklyPoint, PeakHour, FilterState } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({ baseURL: API_BASE_URL });

export async function fetchParkingLocations(
  city?: string,
  filters?: Partial<FilterState>,
  coords?: { lat: number; lng: number } | null
): Promise<ParkingLocation[]> {
  const params: Record<string, string> = {};
  if (city) params.city = city;
  if (filters?.ev) params.ev = "true";
  if (filters?.accessible) params.accessible = "true";
  if (filters?.openNow) params.openNow = "true";
  if (filters?.sort) params.sort = filters.sort;
  if (coords) {
    params.lat = String(coords.lat);
    params.lng = String(coords.lng);
  }
  const res = await api.get("/api/parking", { params });
  return res.data.data;
}

export async function fetchParkingDetail(id: string): Promise<ParkingLocation> {
  const res = await api.get(`/api/parking/${id}`);
  return res.data.data;
}

export async function logSearch(city: string, query?: string) {
  return api.post("/api/parking/search-log", { city, query });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await api.get("/api/dashboard");
  return res.data.data;
}

export async function fetchHourlyAnalytics(): Promise<HourlyPoint[]> {
  const res = await api.get("/api/analytics/hourly");
  return res.data.data;
}

export async function fetchWeeklyAnalytics(): Promise<WeeklyPoint[]> {
  const res = await api.get("/api/analytics/weekly");
  return res.data.data;
}

export async function fetchPeakHours(): Promise<PeakHour[]> {
  const res = await api.get("/api/analytics/peak-hours");
  return res.data.data;
}

export default api;