import { motion } from "framer-motion";
import { Zap, Accessibility, Navigation, Car } from "lucide-react";
import type { ParkingLocation } from "../types";

export default function ParkingCard({ loc, onNavigate }: { loc: ParkingLocation; onNavigate: (loc: ParkingLocation) => void }) {
  const occupancyPct = Math.round((loc.occupiedSlots / loc.totalSlots) * 100);
  const isRecommended = loc.availableSlots / loc.totalSlots > 0.4;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Car size={16} className="text-brand-500" /> {loc.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{loc.address}</p>
        </div>
        {isRecommended && (
          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-1 rounded-full">
            Recommended
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-400">Available</span>
          <p className="font-semibold text-emerald-600">{loc.availableSlots}</p>
        </div>
        <div>
          <span className="text-slate-400">Occupied</span>
          <p className="font-semibold text-rose-500">{loc.occupiedSlots}</p>
        </div>
        {loc.distanceKm != null && (
          <div>
            <span className="text-slate-400">Distance</span>
            <p className="font-semibold">{loc.distanceKm} km</p>
          </div>
        )}
        <div>
          <span className="text-slate-400">Fee</span>
          <p className="font-semibold">₹{loc.fee}/hr</p>
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${occupancyPct > 80 ? "bg-rose-500" : occupancyPct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${occupancyPct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-3 text-slate-400">
        {loc.isEvCharging && <Zap size={16} className="text-brand-500" />}
        {loc.isAccessible && <Accessibility size={16} className="text-brand-500" />}
      </div>

      <button
        onClick={() => onNavigate(loc)}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
      >
        <Navigation size={14} /> Navigate
      </button>
    </motion.div>
  );
}