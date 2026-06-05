/* eslint-disable prettier/prettier */
import { adminConfig } from "@/config/admin";

const SESSION_KEY = "yolo.admin.session";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) === "1";
}

export function login(email: string, password: string): boolean {
  if (
    email.trim().toLowerCase() === adminConfig.username.toLowerCase() &&
    password === adminConfig.password
  ) {
    window.localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
