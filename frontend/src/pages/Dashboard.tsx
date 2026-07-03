import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../services/api";
import StatCard from "../components/StatCard";
import type { DashboardStats } from "../types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = () => fetchDashboardStats().then(setStats);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <h1 className="text-xl font-bold">Live Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Parking Locations" value={stats.totalParkingLocations} />
        <StatCard label="Nearby Parking" value={stats.nearbyParking} />
        <StatCard label="Average Occupancy" value={`${stats.averageOccupancy}%`} />
        <StatCard label="Prediction Accuracy" value={`${stats.predictionAccuracy}%`} />
        <StatCard label="Today's Searches" value={stats.todaysSearches} />
        <StatCard label="Traffic Level" value={stats.trafficLevel} />
      </div>
    </div>
  );
}