/* eslint-disable prettier/prettier */
import { adminConfig } from "@/config/admin";
import type { AnalyticsOverview, AnalyticsPages, AnalyticsPreset, AnalyticsTraffic, TrafficMetric } from "./types";

const API = `${adminConfig.apiBaseUrl}/api/v1/analytics`;

function buildQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) q.set(key, value);
  });
  return q.toString();
}

async function adminGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Erreur analytics");
  }
  return json.data as T;
}

export function fetchAnalyticsOverview(
  token: string,
  preset: AnalyticsPreset,
  from?: string,
  to?: string,
) {
  const qs = buildQuery({ preset: preset === "custom" ? undefined : preset, from, to });
  return adminGet<AnalyticsOverview>(`/overview?${qs}`, token);
}

export function fetchAnalyticsTraffic(
  token: string,
  preset: AnalyticsPreset,
  metric: TrafficMetric,
  from?: string,
  to?: string,
) {
  const qs = buildQuery({
    preset: preset === "custom" ? undefined : preset,
    metric,
    from,
    to,
  });
  return adminGet<AnalyticsTraffic>(`/traffic?${qs}`, token);
}

export function fetchAnalyticsPages(
  token: string,
  preset: AnalyticsPreset,
  from?: string,
  to?: string,
  limit = 10,
) {
  const qs = buildQuery({
    preset: preset === "custom" ? undefined : preset,
    from,
    to,
    limit: String(limit),
  });
  return adminGet<AnalyticsPages>(`/pages?${qs}`, token);
}
