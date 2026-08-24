export type AnalyticsPreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "180d"
  | "year"
  | "custom";

export type AnalyticsOverview = {
  preset: string;
  from: string;
  to: string;
  visitorsToday: number;
  visitorsWeek: number;
  visitorsMonth: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgDurationSec: number;
  avgDurationLabel: string;
  comparison: {
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
  };
};

export type AnalyticsTraffic = {
  preset: string;
  from: string;
  to: string;
  metric: string;
  series: { date: string; value: number }[];
};

export type AnalyticsPageRow = {
  path: string;
  label: string;
  views: number;
  visitors: number;
};

export type AnalyticsPages = {
  preset: string;
  from: string;
  to: string;
  pages: AnalyticsPageRow[];
};

export type TrafficMetric = "visitors" | "uniqueVisitors" | "sessions" | "pageViews";
