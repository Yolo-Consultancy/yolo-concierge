/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { listClients, type Client } from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";

export const Route = createFileRoute("/admin-sur-mesure/clients")({
  component: SurMesureClientsPage,
});

function SurMesureClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  useEffect(() => {
    listClients().then(setItems);
  }, []);

  return (
    <>
      <PageHeader title="Clients" subtitle={`${items.length} client(s) — CRM partagé`} />
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-right p-3">Réservations</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium">{c.firstName} {c.lastName}</td>
                <td className="p-3 text-xs">{c.email}<br />{c.phone}</td>
                <td className="p-3 text-right">{c.totalBookings} · {formatPrice(c.totalSpent)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
