/* eslint-disable prettier/prettier */
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { TrafficMetric } from "@/lib/analytics/types";

const chartConfig = {
  value: { label: "Valeur", color: "hsl(var(--chart-1))" },
};

const METRIC_LABELS: Record<TrafficMetric, string> = {
  visitors: "Visiteurs",
  uniqueVisitors: "Visiteurs uniques",
  sessions: "Sessions",
  pageViews: "Pages vues",
};

type TrafficChartProps = {
  series: { date: string; value: number }[];
  metric: TrafficMetric;
  onMetricChange: (metric: TrafficMetric) => void;
  loading?: boolean;
};

function formatAxisLabel(date: string) {
  if (date.includes(" ")) return date.split(" ")[1] || date;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function TrafficChart({ series, metric, onMetricChange, loading }: TrafficChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold">Évolution du trafic</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(METRIC_LABELS) as TrafficMetric[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onMetricChange(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                metric === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {METRIC_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chargement…</div>
      ) : series.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Aucune donnée pour cette période.
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatAxisLabel} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
