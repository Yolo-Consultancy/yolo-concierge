/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, TrendingUp, TrendingDown, Minus, Mail, X } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listBookings, updateBookingStatus, deleteBooking, assignBookingDriver,
  listDrivers,
  type Booking, type BookingStatus, type Driver,
} from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";
import { bookingConfig } from "@/config/booking";
import { buildAdminEmailHtml } from "@/lib/admin/notify";

export const Route = createFileRoute("/admin/reservations")({ component: Reservations });

const statusLabels: Record<BookingStatus, string> = {
  en_attente: "En attente", confirmee: "Confirmée", payee: "Payée", terminee: "Terminée", annulee: "Annulée",
};
const statusColors: Record<BookingStatus, string> = {
  en_attente: "bg-amber-500/15 text-amber-700",
  confirmee: "bg-blue-500/15 text-blue-700",
  payee: "bg-emerald-500/15 text-emerald-700",
  terminee: "bg-muted text-muted-foreground",
  annulee: "bg-destructive/15 text-destructive",
};

/* Calculates what the new total would be with a given driver */
function computeNewTotal(b: Booking, newDriverId: string): number {
  const dayRate = bookingConfig.chauffeur.pricePerDay;
  const estimatedVehicleTotal = b.withChauffeur
    ? b.totalPrice - b.days * dayRate
    : b.totalPrice;
  const chauffeurCost = newDriverId ? b.days * dayRate : 0;
  return estimatedVehicleTotal + chauffeurCost;
}

/* Badge shown when the price changes after driver swap */
function PriceDiffBadge({ current, next }: { current: number; next: number }) {
  if (next === current) return <Minus className="h-3.5 w-3.5 text-muted-foreground inline" />;
  const up = next > current;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
      up ? "text-amber-700 bg-amber-500/15" : "text-emerald-700 bg-emerald-500/15"
    }`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{formatPrice(next - current)}
    </span>
  );
}

const ACTIVE_STATUSES: BookingStatus[] = ["en_attente", "confirmee", "payee"];

function availableDriversForBooking(bookings: Booking[], drivers: Driver[], b: Booking): Driver[] {
  return drivers.filter(
    (d) =>
      d.active &&
      !bookings.some(
        (x) =>
          x.driverId === d.id &&
          x.id !== b.id &&
          ACTIVE_STATUSES.includes(x.status) &&
          x.startDate <= b.endDate &&
          x.endDate >= b.startDate,
      ),
  );
}

function Reservations() {
  const [items, setItems] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingDriver, setPendingDriver] = useState<Record<string, string>>({});
  const [emailPreview, setEmailPreview] = useState<Booking | null>(null);

  const refresh = () => {
    listBookings().then(setItems);
    listDrivers().then(setDrivers);
  };
  useEffect(refresh, []);

  const C = bookingConfig.currencySymbol;

  const handleDriverChange = async (bookingId: string, newDriverId: string) => {
    setPendingDriver((prev) => ({ ...prev, [bookingId]: newDriverId }));
    await assignBookingDriver(bookingId, newDriverId);
    refresh();
  };

  return (
    <>
      <PageHeader title="Réservations & Paiements" subtitle={`${items.length} réservation(s)`} />

      {/* ── Email Preview Modal ── */}
      {emailPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEmailPreview(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Aperçu de l'e-mail admin
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Destinataire : {bookingConfig.adminNotificationEmail}
                  &nbsp;·&nbsp;
                  Objet : [YOLO] Nouvelle réservation — {emailPreview.vehicleName} · {emailPreview.clientName}
                </p>
              </div>
              <button
                onClick={() => setEmailPreview(null)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <iframe
                title="Aperçu e-mail admin"
                srcDoc={buildAdminEmailHtml(emailPreview)}
                className="w-full h-full min-h-[600px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Véhicule</th>
                <th className="text-left p-3">Dates</th>
                <th className="text-left p-3">Lieu</th>
                <th className="text-left p-3">Chauffeur</th>
                <th className="text-right p-3">Montant</th>
                <th className="text-left p-3">Statut</th>
                <th className="p-3 text-center">E-mail</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const availableDrivers = availableDriversForBooking(items, drivers, b);
                const pendingId = pendingDriver[b.id] ?? b.driverId;
                const previewTotal = pendingId !== b.driverId
                  ? computeNewTotal(b, pendingId)
                  : b.totalPrice;

                return (
                  <tr key={b.id} className="border-t border-border align-top">
                    <td className="p-3">
                      <p className="font-medium">{b.clientName}</p>
                      <p className="text-xs text-muted-foreground">{b.clientPhone}</p>
                    </td>
                    <td className="p-3">{b.vehicleName}</td>
                    <td className="p-3 text-xs">
                      {b.startDate} → {b.endDate}
                      <span className="block text-muted-foreground">{b.days} jour{b.days > 1 ? "s" : ""}</span>
                    </td>
                    <td className="p-3 text-xs">{b.pickupLocation}</td>
                    <td className="p-3 text-xs">
                      <div className="space-y-1">
                        <select
                          value={b.driverId}
                          onChange={(e) => handleDriverChange(b.id, e.target.value)}
                          className="text-xs px-2 py-1.5 rounded-md border border-input bg-background w-full max-w-[180px]"
                        >
                          <option value="">— Aucun chauffeur —</option>
                          {/* Current driver always shown even if not available on those dates */}
                          {b.driverId && !availableDrivers.find((d) => d.id === b.driverId) && (() => {
                            const cur = drivers.find((d) => d.id === b.driverId);
                            return cur ? (
                              <option key={cur.id} value={cur.id}>
                                ⚠ {cur.firstName} {cur.lastName} (conflit)
                              </option>
                            ) : null;
                          })()}
                          {availableDrivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.firstName} {d.lastName} · {C}{formatPrice(bookingConfig.chauffeur.pricePerDay)}/j
                            </option>
                          ))}
                        </select>

                        {b.withChauffeur && !b.driverId && (
                          <span className="text-amber-600 text-[11px] block">Demandé par le client</span>
                        )}
                        {availableDrivers.length === 0 && (
                          <span className="text-muted-foreground text-[11px] block">Aucun disponible sur ces dates</span>
                        )}
                      </div>
                    </td>

                    {/* Montant avec badge de changement */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <p className="font-medium">{C}{formatPrice(b.totalPrice)}</p>
                      {pendingId !== b.driverId && (
                        <div className="mt-1 flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">→ {C}{formatPrice(previewTotal)}</span>
                          <PriceDiffBadge current={b.totalPrice} next={previewTotal} />
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <select
                        value={b.status}
                        onChange={(e) => { void updateBookingStatus(b.id, e.target.value as BookingStatus).then(refresh); }}
                        className={`text-xs px-2 py-1 rounded-md border-0 font-medium ${statusColors[b.status]}`}
                      >
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    {/* Bouton aperçu e-mail */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setEmailPreview(b)}
                        title="Voir l'e-mail envoyé à l'admin"
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 font-medium transition"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        E-mail
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => { if (confirm("Supprimer ?")) void deleteBooking(b.id).then(refresh); }}
                        className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">Aucune réservation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
