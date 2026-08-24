/* eslint-disable prettier/prettier */
import { adminConfig } from "@/config/admin";

const VISITOR_KEY = "yolo.analytics.visitorId";
const SESSION_KEY = "yolo.analytics.sessionId";
const SESSION_TS_KEY = "yolo.analytics.sessionStartedAt";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type CollectPayload = {
  sessionId: string;
  visitorId: string;
  eventType: "page_view" | "heartbeat";
  path: string;
  title?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
  isNewVisitor: boolean;
};

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

function getOrCreateVisitorId() {
  const store = getStorage();
  if (!store) return uuid();
  let id = store.getItem(VISITOR_KEY);
  let isNew = false;
  if (!id) {
    id = uuid();
    store.setItem(VISITOR_KEY, id);
    isNew = true;
  }
  return { id, isNew };
}

function getOrCreateSessionId() {
  const store = getStorage();
  if (!store) return { id: uuid(), isNewSession: true };
  const now = Date.now();
  const started = Number(store.getItem(SESSION_TS_KEY) || 0);
  let id = store.getItem(SESSION_KEY);
  let isNewSession = false;
  if (!id || !started || now - started > SESSION_TIMEOUT_MS) {
    id = uuid();
    store.setItem(SESSION_KEY, id);
    store.setItem(SESSION_TS_KEY, String(now));
    isNewSession = true;
  }
  return { id, isNewSession };
}

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function parseBrowser(ua: string) {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Autres";
}

function parseOs(ua: string) {
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Autres";
}

function getUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
  };
}

export function shouldTrackPath(pathname: string) {
  return !(
    pathname.startsWith("/admin") ||
    pathname.startsWith("/chauffeur") ||
    pathname.startsWith("/client")
  );
}

async function sendCollect(payload: CollectPayload) {
  try {
    await fetch(`${adminConfig.apiBaseUrl}/api/v1/analytics/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* silent — analytics ne doit pas bloquer l'UX */
  }
}

export function trackPageView(pathname: string, title?: string) {
  if (typeof window === "undefined" || !shouldTrackPath(pathname)) return;

  const visitor = getOrCreateVisitorId();
  const session = getOrCreateSessionId();
  const ua = navigator.userAgent;
  const utm = getUtm();

  void sendCollect({
    sessionId: session.id,
    visitorId: visitor.id,
    eventType: "page_view",
    path: pathname,
    title: title || document.title,
    referrer: document.referrer || "direct",
    ...utm,
    deviceType: getDeviceType(),
    browser: parseBrowser(ua),
    os: parseOs(ua),
    isNewVisitor: visitor.isNew,
  });
}

let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

export function startAnalyticsHeartbeat(pathname: string) {
  if (typeof window === "undefined" || !shouldTrackPath(pathname)) return;
  if (heartbeatTimer) clearInterval(heartbeatTimer);

  heartbeatTimer = setInterval(() => {
    const visitor = getOrCreateVisitorId();
    const session = getOrCreateSessionId();
    const ua = navigator.userAgent;
    void sendCollect({
      sessionId: session.id,
      visitorId: visitor.id,
      eventType: "heartbeat",
      path: pathname,
      deviceType: getDeviceType(),
      browser: parseBrowser(ua),
      os: parseOs(ua),
      isNewVisitor: false,
    });
  }, 60_000);
}

export function stopAnalyticsHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = undefined;
  }
}
