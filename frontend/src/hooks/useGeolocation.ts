import { useEffect, useState } from "react";

interface GeoState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ coords: null, error: null, loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: "Geolocation not supported by this browser", loading: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({ coords: { lat: 18.5204, lng: 73.8567 }, error: err.message, loading: false });
      }
    );
  }, []);

  return state;
}