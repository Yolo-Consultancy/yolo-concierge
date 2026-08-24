/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock3,
  Eye,
  MousePointerClick,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { PeriodFilter } from "@/components/analytics/PeriodFilter";
import { StatCard } from "@/components/analytics/StatCard";
import { TrafficChart } from "@/components/analytics/TrafficChart";
import { TopPagesTable } from "@/components/analytics/TopPagesTable";
import {
  fetchAnalyticsOverview,
  fetchAnalyticsPages,
  fetchAnalyticsTraffic,
} from "@/lib/analytics/analytics-api";
import type { AnalyticsOverview, AnalyticsPageRow, AnalyticsPreset, TrafficMetric } from "@/lib/analytics/types";
import { getAccessToken } from "@/lib/api/client";

export const Route = createFileRoute("/admin/statistiques")({
  head: () => ({
    meta: [
      { title: "Statistiques — Admin YOLO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminStatistiques,
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function AdminStatistiques() {
  const [preset, setPreset] = useState<AnalyticsPreset>("7d");
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(todayIso());
  const [metric, setMetric] = useState<TrafficMetric>("visitors");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [traffic, setTraffic] = useState<{ date: string; value: number }[]>([]);
  const [pages, setPages] = useState<AnalyticsPageRow[]>([]);
  const [showAllPages, setShowAllPages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const customFrom = preset === "custom" ? from : undefined;
      const customTo = preset === "custom" ? to : undefined;
      const [overviewData, trafficData, pagesData] = await Promise.all([
        fetchAnalyticsOverview(token, preset, customFrom, customTo),
        fetchAnalyticsTraffic(token, preset, metric, customFrom, customTo),
        fetchAnalyticsPages(token, preset, customFrom, customTo, showAllPages ? 100 : 10),
      ]);
      setOverview(overviewData);
      setTraffic(trafficData.series);
      setPages(pagesData.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les statistiques.");
      setOverview(null);
      setTraffic([]);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [preset, from, to, metric, showAllPages]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Statistiques"
        subtitle="Visiteurs, pages consultées et évolution du trafic sur le site public"
      />

      <div className="mb-6">
        <PeriodFilter
          preset={preset}
          from={from}
          to={to}
          onPresetChange={(next) => {
            setPreset(next);
            setShowAllPages(false);
          }}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Visiteurs aujourd'hui"
          value={overview?.visitorsToday ?? 0}
          icon={Users}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Visiteurs cette semaine"
          value={overview?.visitorsWeek ?? 0}
          icon={Activity}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Visiteurs ce mois"
          value={overview?.visitorsMonth ?? 0}
          icon={BarChart3}
          accent="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          label="Visiteurs uniques (période)"
          value={overview?.uniqueVisitors ?? 0}
          icon={Users}
          accent="bg-amber-500/10 text-amber-600"
          trend={overview?.comparison.uniqueVisitors}
        />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pages vues"
          value={overview?.pageViews ?? 0}
          icon={Eye}
          accent="bg-cyan-500/10 text-cyan-600"
          trend={overview?.comparison.pageViews}
        />
        <StatCard
          label="Sessions"
          value={overview?.sessions ?? 0}
          icon={MousePointerClick}
          accent="bg-indigo-500/10 text-indigo-600"
          trend={overview?.comparison.sessions}
        />
        <StatCard
          label="Taux de rebond"
          value={overview ? `${overview.bounceRate} %` : "0 %"}
          icon={Activity}
          accent="bg-orange-500/10 text-orange-600"
          trend={overview?.comparison.bounceRate}
        />
        <StatCard
          label="Durée moyenne"
          value={overview?.avgDurationLabel ?? "0 min"}
          icon={Clock3}
          accent="bg-rose-500/10 text-rose-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TrafficChart
            series={traffic}
            metric={metric}
            onMetricChange={setMetric}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-5">
          <TopPagesTable
            pages={pages}
            loading={loading}
            showAll={showAllPages}
            onShowAll={() => setShowAllPages(true)}
          />
        </div>
      </div>
    </>
  );
}
