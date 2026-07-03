import { useEffect, useRef } from "react";
import type { ParkingLocation } from "../types";

declare global {
  interface Window {
    google: any;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapView({
  center,
  locations,
  onMarkerClick,
}: {
  center: { lat: number; lng: number };
  locations: ParkingLocation[];
  onMarkerClick: (loc: ParkingLocation) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    if (window.google?.maps) {
      initMap();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initMap() {
    if (!mapRef.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
    });
    renderMarkers();
  }

  function renderMarkers() {
    if (!mapInstance.current) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = locations.map((loc) => {
      const marker = new window.google.maps.Marker({
        position: { lat: loc.latitude, lng: loc.longitude },
        map: mapInstance.current,
        title: loc.name,
      });
      marker.addListener("click", () => onMarkerClick(loc));
      return marker;
    });
  }

  useEffect(() => {
    if (mapInstance.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  useEffect(() => {
    if (mapInstance.current) mapInstance.current.setCenter(center);
  }, [center]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-center p-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Add a Google Maps API key to <code>frontend/.env</code> as{" "}
          <code>VITE_GOOGLE_MAPS_API_KEY</code> to render the live map.
          <br />
          Parking cards below still work using simulated live data.
        </p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg" />;
}