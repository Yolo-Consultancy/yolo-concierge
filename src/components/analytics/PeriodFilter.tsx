/* eslint-disable prettier/prettier */
import type { AnalyticsPreset } from "@/lib/analytics/types";

export const PERIOD_OPTIONS: { value: AnalyticsPreset; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "3 derniers mois" },
  { value: "180d", label: "6 derniers mois" },
  { value: "year", label: "Cette année" },
  { value: "custom", label: "Période personnalisée" },
];

type PeriodFilterProps = {
  preset: AnalyticsPreset;
  from: string;
  to: string;
  onPresetChange: (preset: AnalyticsPreset) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export function PeriodFilter({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="block min-w-[180px]">
        <span className="text-xs font-medium text-muted-foreground">Période</span>
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as AnalyticsPreset)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      {preset === "custom" && (
        <>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Date début</span>
            <input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Date fin</span>
            <input
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
        </>
      )}
    </div>
  );
}
