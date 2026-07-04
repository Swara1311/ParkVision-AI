import { useEffect, useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useLiveParkingUpdates } from "../hooks/useSocket";
import { fetchParkingLocations, logSearch } from "../services/api";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import ParkingCard from "../components/ParkingCard";
import MapView from "../components/MapView";
import type { ParkingLocation, FilterState } from "../types";

export default function Home() {
  const { coords } = useGeolocation();
  const [city, setCity] = useState("Pune");
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ ev: false, accessible: false, openNow: false, sort: "" });

  const liveLocations = useLiveParkingUpdates(locations);

  useEffect(() => {
    setLoading(true);
    fetchParkingLocations(city, filters, coords)
      .then(setLocations)
      .finally(() => setLoading(false));
    logSearch(city);
  }, [city, filters, coords]);

  function handleNavigate(loc: ParkingLocation) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
    window.open(url, "_blank");
  }

  const mapCenter = coords || { lat: 18.5204, lng: 73.8567 };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <SearchBar onSearch={setCity} />
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <MapView center={mapCenter} locations={liveLocations} onMarkerClick={handleNavigate} />

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Parking near {city} {loading && <span className="text-sm text-slate-400">(loading...)</span>}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
              ))
            : liveLocations.map((loc) => <ParkingCard key={loc.id} loc={loc} onNavigate={handleNavigate} />)}
        </div>
        {!loading && liveLocations.length === 0 && (
          <p className="text-slate-500 text-sm mt-4">No parking locations found for "{city}". Try Pune, Mumbai, Delhi, Bangalore, or Hyderabad.</p>
        )}
      </div>
    </div>
  );
}