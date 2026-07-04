import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";
import type { ParkingLocation } from "../types";

export function useLiveParkingUpdates(initial: ParkingLocation[]) {
  const [live, setLive] = useState<Record<string, { availableSlots: number; occupiedSlots: number }>>({});

  useEffect(() => {
    const socket = getSocket();
    const onUpdate = (payload: { locations: any[] }) => {
      setLive((prev) => {
        const next = { ...prev };
        payload.locations.forEach((loc) => {
          next[loc.id] = { availableSlots: loc.availableSlots, occupiedSlots: loc.occupiedSlots };
        });
        return next;
      });
    };
    socket.on("parking:update", onUpdate);
    socket.on("parking:snapshot", onUpdate);
    return () => {
      socket.off("parking:update", onUpdate);
      socket.off("parking:snapshot", onUpdate);
    };
  }, []);

  return initial.map((loc) => ({
    ...loc,
    availableSlots: live[loc.id]?.availableSlots ?? loc.availableSlots,
    occupiedSlots: live[loc.id]?.occupiedSlots ?? loc.occupiedSlots,
  }));
}