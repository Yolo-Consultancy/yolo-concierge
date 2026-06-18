/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2, TrendingUp, TrendingDown, Minus, Mail, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listBookings, updateBookingStatus, deleteBooking, assignBookingDriver,
  listDrivers, listVehicles, upsertBooking,
  type Booking, type BookingStatus, type Driver,
} from "@/lib/admin/store";
import { formatPrice, type Vehicle } from "@/lib/vehicles";
import { bookingConfig } from "@/config/booking";
import { buildAdminEmailHtml } from "@/lib/admin/notify";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { toast } from "sonner";
import { requestAdminBadgesRefresh } from "@/lib/admin/badges";

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

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

type ManualBookingForm = {
  vehicleId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  withChauffeur: boolean;
  driverId: string;
  status: BookingStatus;
};

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

const emptyManualBooking = (): ManualBookingForm => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return {
    vehicleId: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    startDate: today,
    endDate: tomorrow,
    pickupLocation: "Kinshasa",
    dropoffLocation: "",
    withChauffeur: false,
    driverId: "",
    status: "confirmee",
  };
};

function computeNewTotal(b: Booking, newDriverId: string): number {
  const dayRate = bookingConfig.chauffeur.pricePerDay;
  const estimatedVehicleTotal = b.withChauffeur
    ? b.totalPrice - b.days * dayRate
    : b.totalPrice;
  const chauffeurCost = newDriverId ? b.days * dayRate : 0;
  return estimatedVehicleTotal + chauffeurCost;
}

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
  const { ask, dialog } = useConfirmDialog();
  const [items, setItems] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingDriver, setPendingDriver] = useState<Record<string, string>>({});
  const [emailPreview, setEmailPreview] = useState<Booking | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualBookingForm>(emptyManualBooking);
  const [savingManual, setSavingManual] = useState(false);

  const refresh = () => {
    listBookings().then(setItems);
    listDrivers().then(setDrivers);
    listVehicles().then(setVehicles);
  };
  useEffect(refresh, []);

  const C = bookingConfig.currencySymbol;

  const manualEstimate = useMemo(() => {
    const vehicle = vehicles.find((v) => v.id === manualForm.vehicleId);
    if (!vehicle || !manualForm.startDate || !manualForm.endDate) return null;
    const days = daysBetween(manualForm.startDate, manualForm.endDate);
    const chauffeur = manualForm.withChauffeur && manualForm.driverId
      ? days * bookingConfig.chauffeur.pricePerDay
      : 0;
    return { days, total: days * vehicle.pricePerDay + chauffeur };
  }, [manualForm, vehicles]);

  const handleDriverChange = async (bookingId: string, newDriverId: string) => {
    setPendingDriver((prev) => ({ ...prev, [bookingId]: newDriverId }));
    await assignBookingDriver(bookingId, newDriverId);
    refresh();
  };

  const handleStatusChangeRequest = (booking: Booking, newStatus: BookingStatus) => {
    if (newStatus === booking.status) return;

    const emailHint = booking.clientEmail
      ? ` Un e-mail sera envoyé à ${booking.clientEmail}.`
      : " Le client n'a pas d'e-mail — aucune notification ne sera envoyée.";

    ask({
      title: "Confirmer le changement de statut ?",
      description: `Réservation de ${booking.clientName} (${booking.vehicleName}) : « ${statusLabels[booking.status]} » → « ${statusLabels[newStatus]} ».${emailHint}`,
      confirmLabel: "Confirmer",
      cancelLabel: "Annuler",
      onConfirm: async () => {
        try {
          const saved = await updateBookingStatus(booking.id, newStatus);
          const result = saved as Booking & { clientEmailSent?: boolean; clientEmailReason?: string };
          if (result.clientEmailSent) {
            toast.success(`Statut mis à jour. E-mail envoyé à ${booking.clientEmail}.`);
          } else if (result.clientEmailReason === "no_client_email") {
            toast.warning("Statut mis à jour. Le client n'a pas d'e-mail enregistré.");
          } else {
            toast.success("Statut mis à jour.");
          }
          refresh();
          requestAdminBadgesRefresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Impossible de changer le statut.");
        }
      },
    });
  };

  const handleSaveManual = async () => {
    const vehicle = vehicles.find((v) => v.id === manualForm.vehicleId);
    if (!vehicle) {
      toast.error("Sélectionnez un véhicule.");
      return;
    }
    if (!manualForm.clientName.trim() || !manualForm.clientPhone.trim()) {
      toast.error("Nom et téléphone du client sont requis.");
      return;
    }
    if (!manualForm.startDate || !manualForm.endDate || manualForm.endDate < manualForm.startDate) {
      toast.error("Vérifiez les dates de réservation.");
      return;
    }
    if (!manualForm.pickupLocation.trim()) {
      toast.error("Indiquez le lieu de prise en charge.");
      return;
    }

    const days = daysBetween(manualForm.startDate, manualForm.endDate);
    const driver = drivers.find((d) => d.id === manualForm.driverId);
    const withChauffeur = manualForm.withChauffeur && !!manualForm.driverId;
    const chauffeurCost = withChauffeur ? days * bookingConfig.chauffeur.pricePerDay : 0;
    const totalPrice = days * vehicle.pricePerDay + chauffeurCost;

    setSavingManual(true);
    try {
      const saved = await upsertBooking({
        id: "",
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.name}`.trim(),
        clientName: manualForm.clientName.trim(),
        clientPhone: manualForm.clientPhone.trim(),
        clientEmail: manualForm.clientEmail.trim().toLowerCase() || undefined,
        startDate: manualForm.startDate,
        endDate: manualForm.endDate,
        days,
        pickupLocation: manualForm.pickupLocation.trim(),
        dropoffLocation: manualForm.dropoffLocation.trim() || manualForm.pickupLocation.trim(),
        totalPrice,
        withChauffeur,
        driverId: manualForm.driverId,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : "",
        status: manualForm.status,
        createdAt: new Date().toISOString(),
      });

      const notified = (saved as { adminEmailSent?: boolean }).adminEmailSent;
      toast.success(
        notified
          ? "Réservation créée. L'admin a été notifié par e-mail."
          : "Réservation créée avec succès.",
      );
      setManualOpen(false);
      setManualForm(emptyManualBooking());
      refresh();
      requestAdminBadgesRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de créer la réservation.");
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Réservations & Paiements"
        subtitle={`${items.length} réservation(s)`}
        action={
          <button
            onClick={() => { setManualForm(emptyManualBooking()); setManualOpen(true); }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nouvelle réservation
          </button>
        }
      />

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

      {manualOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-card">
              <h2 className="font-display text-lg font-semibold">Nouvelle réservation manuelle</h2>
              <button onClick={() => setManualOpen(false)} className="p-2 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <select
                className={inputCls}
                value={manualForm.vehicleId}
                onChange={(e) => setManualForm({ ...manualForm, vehicleId: e.target.value })}
              >
                <option value="">— Véhicule —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.name} · {C}{formatPrice(v.pricePerDay)}/j
                  </option>
                ))}
              </select>
              <input
                className={inputCls}
                placeholder="Nom du client *"
                value={manualForm.clientName}
                onChange={(e) => setManualForm({ ...manualForm, clientName: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Téléphone *"
                value={manualForm.clientPhone}
                onChange={(e) => setManualForm({ ...manualForm, clientPhone: e.target.value })}
              />
              <input
                className={inputCls}
                type="email"
                placeholder="E-mail client (notifications de statut)"
                value={manualForm.clientEmail}
                onChange={(e) => setManualForm({ ...manualForm, clientEmail: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground">Début *</span>
                  <input
                    type="date"
                    className={`${inputCls} mt-1`}
                    value={manualForm.startDate}
                    onChange={(e) => setManualForm({ ...manualForm, startDate: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground">Fin *</span>
                  <input
                    type="date"
                    className={`${inputCls} mt-1`}
                    value={manualForm.endDate}
                    onChange={(e) => setManualForm({ ...manualForm, endDate: e.target.value })}
                  />
                </label>
              </div>
              <input
                className={inputCls}
                placeholder="Lieu de prise en charge *"
                value={manualForm.pickupLocation}
                onChange={(e) => setManualForm({ ...manualForm, pickupLocation: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Lieu de restitution (optionnel)"
                value={manualForm.dropoffLocation}
                onChange={(e) => setManualForm({ ...manualForm, dropoffLocation: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={manualForm.withChauffeur}
                  onChange={(e) => setManualForm({
                    ...manualForm,
                    withChauffeur: e.target.checked,
                    driverId: e.target.checked ? manualForm.driverId : "",
                  })}
                />
                Avec chauffeur
              </label>
              {manualForm.withChauffeur && (
                <select
                  className={inputCls}
                  value={manualForm.driverId}
                  onChange={(e) => setManualForm({ ...manualForm, driverId: e.target.value })}
                >
                  <option value="">— Chauffeur —</option>
                  {drivers.filter((d) => d.active).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              )}
              <select
                className={inputCls}
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as BookingStatus })}
              >
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {manualEstimate && (
                <p className="text-sm text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                  Estimation : <strong>{manualEstimate.days} jour(s)</strong>
                  {" · "}
                  <strong>{C}{formatPrice(manualEstimate.total)}</strong>
                  {" "}(montant recalculé par le serveur)
                </p>
              )}
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-card">
              <button
                onClick={() => setManualOpen(false)}
                className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleSaveManual()}
                disabled={savingManual}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {savingManual ? "Création..." : "Créer la réservation"}
              </button>
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
                      {b.clientEmail && <p className="text-xs text-muted-foreground">{b.clientEmail}</p>}
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
                        onChange={(e) => handleStatusChangeRequest(b, e.target.value as BookingStatus)}
                        className={`text-xs px-2 py-1 rounded-md border-0 font-medium ${statusColors[b.status]}`}
                      >
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
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
                        onClick={() => ask({
                          title: "Supprimer cette réservation ?",
                          description: `La réservation de ${b.clientName} (${b.vehicleName}) sera définitivement supprimée.`,
                          confirmLabel: "Supprimer",
                          onConfirm: () => deleteBooking(b.id).then(refresh),
                        })}
                        className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">Aucune réservation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {dialog}
    </>
  );
}
