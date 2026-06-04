/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listMissions, upsertMission, deleteMission, listBookings, listUsers,
  newId, type Mission, type MissionStatus,
} from "@/lib/admin/store";

export const Route = createFileRoute("/admin/missions")({ component: MissionsPage });

const statusLabels: Record<MissionStatus, string> = {
  a_affecter: "À affecter", en_cours: "En cours", terminee: "Terminée",
};
const statusColors: Record<MissionStatus, string> = {
  a_affecter: "bg-amber-500/15 text-amber-700",
  en_cours: "bg-blue-500/15 text-blue-700",
  terminee: "bg-emerald-500/15 text-emerald-700",
};
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const empty = (): Mission => ({
  id: newId("m"), bookingId: "", assigneeId: "", assigneeName: "",
  type: "livraison", scheduledAt: new Date().toISOString(), status: "a_affecter", notes: "",
});

function MissionsPage() {
  const [items, setItems] = useState<Mission[]>([]);
  const [editing, setEditing] = useState<Mission | null>(null);
  const bookings = listBookings();
  const users = listUsers();
  const refresh = () => setItems(listMissions());
  useEffect(refresh, []);

  return (
    <>
      <PageHeader
        title="Missions & Prestations" subtitle={`${items.length} mission(s) — affectation et suivi terrain`}
        action={
          <button onClick={() => setEditing(empty())}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nouvelle mission
          </button>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => {
          const booking = bookings.find((b) => b.id === m.bookingId);
          return (
            <div key={m.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.type}</p>
                  <p className="font-display text-base font-semibold mt-1">{booking?.vehicleName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{booking?.clientName ?? "Réservation inconnue"}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p><strong className="text-foreground">Assigné à :</strong> {m.assigneeName || "Non affecté"}</p>
                <p><strong className="text-foreground">Planifié :</strong> {new Date(m.scheduledAt).toLocaleString("fr-FR")}</p>
                {m.notes && <p className="italic">{m.notes}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEditing(m)} className="flex-1 text-xs rounded-md border border-input px-3 py-1.5 hover:bg-muted">Modifier</button>
                <button onClick={() => { if (confirm("Supprimer ?")) { deleteMission(m.id); refresh(); } }}
                  className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Aucune mission.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Mission</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-3">
              <select className={inputCls} value={editing.bookingId} onChange={(e) => setEditing({ ...editing, bookingId: e.target.value })}>
                <option value="">— Réservation associée —</option>
                {bookings.map((b) => <option key={b.id} value={b.id}>{b.clientName} · {b.vehicleName}</option>)}
              </select>
              <select className={inputCls} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as Mission["type"] })}>
                <option value="livraison">Livraison</option>
                <option value="chauffeur">Service chauffeur</option>
                <option value="recuperation">Récupération</option>
              </select>
              <select
                className={inputCls}
                value={editing.assigneeId}
                onChange={(e) => {
                  const u = users.find((x) => x.id === e.target.value);
                  setEditing({ ...editing, assigneeId: e.target.value, assigneeName: u?.name ?? "" });
                }}
              >
                <option value="">— Affecter à —</option>
                {users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
              <input type="datetime-local" className={inputCls}
                value={editing.scheduledAt.slice(0, 16)}
                onChange={(e) => setEditing({ ...editing, scheduledAt: new Date(e.target.value).toISOString() })} />
              <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as MissionStatus })}>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <textarea className={inputCls} placeholder="Notes" rows={3} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted">Annuler</button>
              <button onClick={() => { upsertMission(editing); setEditing(null); refresh(); }}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
