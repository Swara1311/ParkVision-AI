import type { FilterState } from "../types";

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const toggle = (key: keyof FilterState) => onChange({ ...filters, [key]: !filters[key] });

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? "bg-brand-500 text-white border-brand-500"
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button className={chip(filters.ev)} onClick={() => toggle("ev")}>⚡ EV Charging</button>
      <button className={chip(filters.accessible)} onClick={() => toggle("accessible")}>♿ Accessible</button>
      <button className={chip(filters.openNow)} onClick={() => toggle("openNow")}>🟢 Open Now</button>
      <select
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as FilterState["sort"] })}
        className="px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <option value="">Sort: Default</option>
        <option value="nearest">Nearest</option>
        <option value="most-available">Most Available</option>
        <option value="cheapest">Cheapest</option>
      </select>
    </div>
  );
}