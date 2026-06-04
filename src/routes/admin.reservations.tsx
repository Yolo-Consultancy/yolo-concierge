/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { listBookings, updateBookingStatus, deleteBooking, type Booking, type BookingStatus } from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";

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

function Reservations() {
  const [items, setItems] = useState<Booking[]>([]);
  const refresh = () => setItems(listBookings());
  useEffect(refresh, []);

  return (
    <>
      <PageHeader title="Réservations & Paiements" subtitle={`${items.length} réservation(s)`} />
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Véhicule</th>
                <th className="text-left p-3">Dates</th>
                <th className="text-left p-3">Lieu</th>
                <th className="text-right p-3">Montant</th>
                <th className="text-left p-3">Statut</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3">
                    <p className="font-medium">{b.clientName}</p>
                    <p className="text-xs text-muted-foreground">{b.clientPhone}</p>
                  </td>
                  <td className="p-3">{b.vehicleName}</td>
                  <td className="p-3 text-xs">{b.startDate} → {b.endDate}</td>
                  <td className="p-3 text-xs">{b.pickupLocation}</td>
                  <td className="p-3 text-right font-medium">{formatPrice(b.totalPrice)} €</td>
                  <td className="p-3">
                    <select
                      value={b.status}
                      onChange={(e) => { updateBookingStatus(b.id, e.target.value as BookingStatus); refresh(); }}
                      className={`text-xs px-2 py-1 rounded-md border-0 font-medium ${statusColors[b.status]}`}
                    >
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => { if (confirm("Supprimer ?")) { deleteBooking(b.id); refresh(); } }}
                      className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">Aucune réservation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
