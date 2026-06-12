/* eslint-disable prettier/prettier */
import { getCurrentClient, logoutClient, type ClientAccount } from "@/lib/client/auth";
import { isAuthenticated, logout as logoutAdmin } from "@/lib/admin/auth";

export function getClientSession(): ClientAccount | null {
  return getCurrentClient();
}

export function getAdminSession(): boolean {
  return isAuthenticated();
}

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("yolo-auth-change"));
  }
}

export function logoutSession(role: "client" | "admin" | "all") {
  if (role === "client" || role === "all") logoutClient();
  if (role === "admin" || role === "all") logoutAdmin();
  notifyAuthChange();
}

export function subscribeAuth(listener: () => void) {
  const handler = () => listener();
  window.addEventListener("yolo-auth-change", handler);
  return () => {
    window.removeEventListener("yolo-auth-change", handler);
  };
}
