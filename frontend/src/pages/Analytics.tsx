import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchHourlyAnalytics, fetchWeeklyAnalytics, fetchPeakHours } from "../services/api";
import type { HourlyPoint, WeeklyPoint, PeakHour } from "../types";

export default function Analytics() {
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [weekly, setWeekly] = useState<WeeklyPoint[]>([]);
  const [peaks, setPeaks] = useState<PeakHour[]>([]);

  useEffect(() => {
    fetchHourlyAnalytics().then(setHourly);
    fetchWeeklyAnalytics().then(setWeekly);
    fetchPeakHours().then(setPeaks);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
      <h1 className="text-xl font-bold">Analytics</h1>

      <div className="rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">Hourly Occupancy</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="hour" fontSize={11} interval={2} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="occupancy" stroke="#3466db" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">Weekly Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Bar dataKey="occupancy" fill="#5b8def" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">Peak Hours</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {peaks.map((p) => (
            <div key={p.label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-xs text-slate-500">{p.window}</p>
              <p className="text-xl font-bold text-brand-500 mt-1">{p.occupancy}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
