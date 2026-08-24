/* eslint-disable prettier/prettier */
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { startAnalyticsHeartbeat, stopAnalyticsHeartbeat, trackPageView } from "@/lib/analytics/tracker";

export function AnalyticsTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackPageView(pathname, document.title);
    startAnalyticsHeartbeat(pathname);
    return () => stopAnalyticsHeartbeat();
  }, [pathname]);

  return null;
}
