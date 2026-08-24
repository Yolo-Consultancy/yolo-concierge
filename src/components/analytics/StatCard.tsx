/* eslint-disable prettier/prettier */
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
  trend?: number;
  subtitle?: string;
};

export function formatAnalyticsNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function StatCard({ label, value, icon: Icon, accent = "bg-blue-500/10 text-blue-600", trend, subtitle }: StatCardProps) {
  const display = typeof value === "number" ? formatAnalyticsNumber(value) : value;
  const showTrend = typeof trend === "number";
  const positive = (trend ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-2xl font-semibold">{display}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      {subtitle && <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>}
      {showTrend && (
        <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-600"}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {positive ? "+" : ""}{trend}% vs période précédente
        </p>
      )}
    </div>
  );
}
