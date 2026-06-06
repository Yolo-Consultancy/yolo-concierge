/* eslint-disable prettier/prettier */
// Notification admin & paiement en ligne.
// Si adminConfig.apiBaseUrl est configuré, on appelle le backend Express.
// Sinon, on garde tout en local (la réservation est créée côté admin et
// l'admin verra le détail dans son espace /admin/reservations).

import { adminConfig } from "@/config/admin";
import { bookingConfig } from "@/config/booking";
import type { Booking } from "@/lib/admin/store";

const base = () => adminConfig.apiBaseUrl.replace(/\/$/, "");

/** Génère le corps HTML du mail admin pour une nouvelle réservation. */
export function buildAdminEmailHtml(booking: Booking): string {
  const C = bookingConfig.currencySymbol;
  const formatPrice = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 0 });
  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nouvelle Réservation YOLO</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 100%);padding:36px 40px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:28px;font-weight:700;letter-spacing:-0.5px;color:#fff;">
                      YOLO<span style="color:#7dd3fc;">.</span>
                    </span>
                    <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.4);">Le Concierge</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:rgba(125,211,252,0.15);border:1px solid rgba(125,211,252,0.3);color:#7dd3fc;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;border-radius:20px;">
                      🔔 Nouvelle Réservation
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking ID banner -->
          <tr>
            <td style="background:rgba(125,211,252,0.06);padding:14px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
                Réservation <strong style="color:#7dd3fc;">#${booking.id.toUpperCase()}</strong>
                &nbsp;·&nbsp;
                Reçue le <strong style="color:rgba(255,255,255,0.7);">${new Date(booking.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.7);">
                Bonjour,<br/><br/>
                Une nouvelle réservation vient d'être soumise sur <strong style="color:#fff;">YOLO Le Concierge</strong>.
                Voici le récapitulatif complet :
              </p>

              <!-- Section: Véhicule -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                <tr>
                  <td style="background:rgba(255,255,255,0.03);padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7dd3fc;font-weight:600;">🚗 Véhicule</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:22px;font-weight:700;color:#fff;padding-bottom:4px;" colspan="2">${booking.vehicleName}</td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:rgba(255,255,255,0.4);">ID Véhicule: ${booking.vehicleId}</td>
                        <td align="right"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: Dates & Durée -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                <tr>
                  <td style="background:rgba(255,255,255,0.03);padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7dd3fc;font-weight:600;">📅 Dates &amp; Durée</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);width:45%;">Date de début</td>
                        <td style="font-size:13px;font-weight:600;color:#fff;">${formatDate(booking.startDate)}</td>
                      </tr>
                      <tr style="border-top:1px solid rgba(255,255,255,0.04);">
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);">Date de fin</td>
                        <td style="font-size:13px;font-weight:600;color:#fff;">${formatDate(booking.endDate)}</td>
                      </tr>
                      <tr style="border-top:1px solid rgba(255,255,255,0.04);">
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);">Durée totale</td>
                        <td style="font-size:13px;font-weight:600;color:#7dd3fc;">${booking.days} jour${booking.days > 1 ? "s" : ""}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: Lieu -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                <tr>
                  <td style="background:rgba(255,255,255,0.03);padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7dd3fc;font-weight:600;">📍 Lieu</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);width:45%;">Prise en charge</td>
                        <td style="font-size:13px;font-weight:600;color:#fff;">${booking.pickupLocation || "—"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: Chauffeur -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                <tr>
                  <td style="background:rgba(255,255,255,0.03);padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7dd3fc;font-weight:600;">👤 Chauffeur</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);width:45%;">Avec chauffeur</td>
                        <td style="font-size:13px;font-weight:600;color:${booking.withChauffeur ? "#4ade80" : "rgba(255,255,255,0.5)"};">
                          ${booking.withChauffeur ? "✅ Oui — à affecter" : "❌ Non (client conduit)"}
                        </td>
                      </tr>
                      ${booking.driverName ? `
                      <tr style="border-top:1px solid rgba(255,255,255,0.04);">
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);">Chauffeur affecté</td>
                        <td style="font-size:13px;font-weight:600;color:#fff;">${booking.driverName}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section: Client -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                <tr>
                  <td style="background:rgba(255,255,255,0.03);padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7dd3fc;font-weight:600;">👤 Client</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);width:45%;">Nom</td>
                        <td style="font-size:13px;font-weight:600;color:#fff;">${booking.clientName}</td>
                      </tr>
                      <tr style="border-top:1px solid rgba(255,255,255,0.04);">
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);">Téléphone</td>
                        <td style="font-size:13px;font-weight:600;color:#fff;">${booking.clientPhone || "—"}</td>
                      </tr>
                      ${(booking as Booking & { clientEmail?: string }).clientEmail ? `
                      <tr style="border-top:1px solid rgba(255,255,255,0.04);">
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);">E-mail</td>
                        <td style="font-size:13px;font-weight:600;color:#7dd3fc;"><a href="mailto:${(booking as Booking & { clientEmail?: string }).clientEmail}" style="color:#7dd3fc;">${(booking as Booking & { clientEmail?: string }).clientEmail}</a></td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;border:1px solid rgba(125,211,252,0.25);background:rgba(125,211,252,0.05);overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.5);">Montant estimé</td>
                        <td align="right" style="font-size:28px;font-weight:700;color:#7dd3fc;">${C}${formatPrice(booking.totalPrice)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="font-size:11px;color:rgba(255,255,255,0.3);padding-top:2px;">
                          Statut : <strong style="color:rgba(255,255,255,0.6);">${booking.status === "en_attente" ? "En attente de confirmation" : booking.status}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="${typeof window !== "undefined" ? window.location.origin : ""}/admin/reservations"
                style="display:inline-block;margin-top:8px;background:#7dd3fc;color:#000;font-weight:700;font-size:13px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                Voir dans l'espace Admin →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
                YOLO Le Concierge · Kinshasa, RDC · contact@yolo.cd<br/>
                Cet e-mail a été généré automatiquement. Ne pas répondre directement.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Notifie l'admin par e-mail qu'une nouvelle réservation est arrivée. */
export async function notifyAdminNewBooking(booking: Booking): Promise<boolean> {
  if (!adminConfig.apiBaseUrl) return false;
  try {
    const res = await fetch(`${base()}${bookingConfig.payOnline.notifyAdminPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: bookingConfig.adminNotificationEmail,
        subject: `[YOLO] Nouvelle réservation — ${booking.vehicleName} · ${booking.clientName}`,
        html: buildAdminEmailHtml(booking),
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
