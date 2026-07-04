import { useState } from "react";
import { Search } from "lucide-react";

const CITIES = ["Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad"];

export default function SearchBar({ onSearch }: { onSearch: (city: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a city (Pune, Mumbai, Delhi...)"
        list="city-suggestions"
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <datalist id="city-suggestions">
        {CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </form>
  );
}