/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  listMovers,
  upsertMover,
  deleteMover,
  newId,
  type Mover,
} from "@/lib/demenagement/store";
import { formatPrice } from "@/lib/vehicles";
import { bookingConfig } from "@/config/booking";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export const Route = createFileRoute("/admin-demenagement/demenageurs")({
  component: DemenageursPage,
});

const inputCls =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const empty = (): Mover => ({
  id: newId("m"),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  hiredAt: new Date().toISOString().slice(0, 10),
  salary: 0,
  active: true,
  notes: "",
  createdAt: new Date().toISOString().slice(0, 10),
});

function DemenageursPage() {
  const { ask, dialog } = useConfirmDialog();
  const [items, setItems] = useState<Mover[]>([]);
  const [editing, setEditing] = useState<Mover | null>(null);
  const [search, setSearch] = useState("");

  const refresh = () => {
    listMovers().then(setItems);
  };
  useEffect(refresh, []);

  const C = bookingConfig.currencySymbol;

  const filtered = items.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return `${d.firstName} ${d.lastName} ${d.email} ${d.phone}`.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Déménageurs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {items.length} déménageur(s) — équipe terrain déménagement
          </p>
        </div>
        <button
          onClick={() => setEditing(empty())}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nouveau déménageur
        </button>
      </div>

      <div className="mb-4">
        <input
          className={inputCls}
          placeholder="Rechercher par nom, e-mail ou téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Identité</th>
                <th className="text-left p-3">E-mail</th>
                <th className="text-left p-3">Téléphone</th>
                <th className="text-left p-3">Date de recrutement</th>
                <th className="text-right p-3">Salaire mensuel</th>
                <th className="text-left p-3">Statut</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="p-3 font-medium">
                    {d.firstName} {d.lastName}
                  </td>
                  <td className="p-3 text-muted-foreground">{d.email || "—"}</td>
                  <td className="p-3 text-muted-foreground">{d.phone || "—"}</td>
                  <td className="p-3">{d.hiredAt}</td>
                  <td className="p-3 text-right font-medium">
                    {C}{formatPrice(d.salary)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        d.active
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditing(d)}
                        className="p-1.5 rounded hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          ask({
                            title: "Supprimer ce déménageur ?",
                            description: `${d.firstName} ${d.lastName} sera retiré de l'équipe (désactivé).`,
                            confirmLabel: "Supprimer",
                            onConfirm: () => deleteMover(d.id).then(refresh),
                          })
                        }
                        className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                    {items.length === 0
                      ? "Aucun déménageur. Cliquez sur « Nouveau déménageur »."
                      : "Aucun résultat pour cette recherche."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-lg bg-card rounded-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {items.some((x) => x.id === editing.id)
                  ? "Modifier le déménageur"
                  : "Nouveau déménageur"}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>Prénom</label>
                <input
                  className={inputCls}
                  value={editing.firstName}
                  onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>Nom</label>
                <input
                  className={inputCls}
                  value={editing.lastName}
                  onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">E-mail</label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="demenageur@yolo.cd"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Téléphone</label>
                <input
                  className={inputCls}
                  placeholder="+243 ..."
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>Date de recrutement</label>
                <input
                  type="date"
                  className={inputCls}
                  value={editing.hiredAt}
                  onChange={(e) => setEditing({ ...editing, hiredAt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>Salaire mensuel ({C})</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={editing.salary}
                  onChange={(e) => setEditing({ ...editing, salary: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Notes internes</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Déménageur actif
              </label>
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!editing.firstName || !editing.lastName || !editing.hiredAt) {
                    alert("Prénom, nom et date de recrutement sont requis.");
                    return;
                  }
                  void upsertMover(editing).then(() => {
                    setEditing(null);
                    refresh();
                  });
                }}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      {dialog}
    </>
  );
}
