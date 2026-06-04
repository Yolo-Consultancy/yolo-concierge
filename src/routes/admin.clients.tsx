/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { listClients, upsertClient, deleteClient, newId, type Client } from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";

export const Route = createFileRoute("/admin/clients")({ component: ClientsPage });

const empty = (): Client => ({
  id: newId("c"), firstName: "", lastName: "", email: "", phone: "",
  totalBookings: 0, totalSpent: 0, notes: "", createdAt: new Date().toISOString().slice(0, 10),
});

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const refresh = () => setItems(listClients());
  useEffect(refresh, []);

  return (
    <>
      <PageHeader
        title="Clients" subtitle={`${items.length} client(s) — CRM léger`}
        action={
          <button onClick={() => setEditing(empty())}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nouveau client
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Nom</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-right p-3">Réservations</th>
                <th className="text-right p-3">Total dépensé</th>
                <th className="text-left p-3">Notes</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.firstName} {c.lastName}</td>
                  <td className="p-3 text-xs">
                    <p>{c.email}</p>
                    <p className="text-muted-foreground">{c.phone}</p>
                  </td>
                  <td className="p-3 text-right">{c.totalBookings}</td>
                  <td className="p-3 text-right font-medium">{formatPrice(c.totalSpent)} €</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{c.notes}</td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditing(c)} className="p-1.5 rounded hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm("Supprimer ?")) { deleteClient(c.id); refresh(); } }}
                        className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">Aucun client.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Fiche client</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Prénom" value={editing.firstName} onChange={(e) => setEditing({ ...editing, firstName: e.target.value })} />
              <input className={inputCls} placeholder="Nom" value={editing.lastName} onChange={(e) => setEditing({ ...editing, lastName: e.target.value })} />
              <input className={inputCls} placeholder="Email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              <input className={inputCls} placeholder="Téléphone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              <input type="number" className={inputCls} placeholder="Nb réservations" value={editing.totalBookings} onChange={(e) => setEditing({ ...editing, totalBookings: +e.target.value })} />
              <input type="number" className={inputCls} placeholder="Total dépensé" value={editing.totalSpent} onChange={(e) => setEditing({ ...editing, totalSpent: +e.target.value })} />
              <textarea className={`${inputCls} sm:col-span-2`} placeholder="Notes internes" rows={3} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted">Annuler</button>
              <button onClick={() => { upsertClient(editing); setEditing(null); refresh(); }}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
