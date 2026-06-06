/* eslint-disable prettier/prettier */
// Notification admin & paiement en ligne.
// Si adminConfig.apiBaseUrl est configuré, on appelle le backend Express.
// Sinon, on garde tout en local (la réservation est créée côté admin et
// l'admin verra le détail dans son espace /admin/reservations).

import { adminConfig } from "@/config/admin";
import { bookingConfig } from "@/config/booking";
import type { Booking } from "@/lib/admin/store";

const base = () => adminConfig.apiBaseUrl.replace(/\/$/, "");

/** Notifie l'admin par e-mail qu'une nouvelle réservation est arrivée. */
export async function notifyAdminNewBooking(booking: Booking): Promise<boolean> {
  if (!adminConfig.apiBaseUrl) return false;
  try {
    const res = await fetch(`${base()}${bookingConfig.payOnline.notifyAdminPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: bookingConfig.adminNotificationEmail,
        booking,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Crée une session Stripe Checkout via le backend Express et retourne l'URL. */
export async function createCheckoutSession(booking: Booking): Promise<string | null> {
  if (!adminConfig.apiBaseUrl) return null;
  try {
    const res = await fetch(`${base()}${bookingConfig.payOnline.createSessionPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking,
        successUrl: `${window.location.origin}${bookingConfig.payOnline.successUrl}`,
        cancelUrl: `${window.location.origin}${bookingConfig.payOnline.cancelUrl}`,
        currency: "usd",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}
