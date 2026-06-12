/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { listUsers, upsertUser, deleteUser, newId, type TeamUser, type UserRole } from "@/lib/admin/store";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export const Route = createFileRoute("/admin/utilisateurs")({ component: UsersPage });

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const roleLabels: Record<UserRole, string> = { admin: "Administrateur", agent: "Agent", chauffeur: "Chauffeur" };
const empty = (): TeamUser => ({ id: newId("u"), name: "", email: "", role: "agent", active: true, createdAt: new Date().toISOString().slice(0, 10) });

function UsersPage() {
  const { ask, dialog } = useConfirmDialog();
  const [items, setItems] = useState<TeamUser[]>([]);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const refresh = () => { listUsers().then(setItems); };
  useEffect(refresh, []);

  return (
    <>
      <PageHeader
        title="Équipe YOLO" subtitle={`${items.length} utilisateur(s) interne(s)`}
        action={
          <button onClick={() => setEditing(empty())}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left p-3">Nom</th><th className="text-left p-3">Email</th><th className="text-left p-3">Rôle</th><th className="text-left p-3">Statut</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-xs">{u.email}</td>
                <td className="p-3"><span className="text-xs px-2 py-1 rounded bg-muted">{roleLabels[u.role]}</span></td>
                <td className="p-3">
                  <button onClick={() => { void upsertUser({ ...u, active: !u.active }).then(refresh); }}
                    className={`text-xs px-2 py-1 rounded ${u.active ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {u.active ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(u)} className="text-xs text-primary hover:underline mr-2">Modifier</button>
                  <button
                    onClick={() => ask({
                      title: "Supprimer cet utilisateur ?",
                      description: `${u.name} sera définitivement retiré de l'équipe YOLO.`,
                      confirmLabel: "Supprimer",
                      onConfirm: () => deleteUser(u.id).then(refresh),
                    })}
                    className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                  ><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Utilisateur</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input className={inputCls} placeholder="Nom complet" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <input className={inputCls} placeholder="Email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              <select className={inputCls} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })}>
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted">Annuler</button>
              <button onClick={() => { void upsertUser(editing).then(() => { setEditing(null); refresh(); }); }}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
      {dialog}
    </>
  );
}
