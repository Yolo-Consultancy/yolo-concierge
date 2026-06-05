/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, Power, PowerOff, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listDrivers, upsertDriver, deleteDriver, toggleDriverActive,
  newId, type Driver, type DriverAvailability,
} from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";
import { bookingConfig } from "@/config/booking";

export const Route = createFileRoute("/admin/chauffeurs")({ component: ChauffeursPage });

const availabilityLabels: Record<DriverAvailability, string> = {
  disponible: "Disponible",
  occupe: "Occupé",
  indisponible: "Indisponible",
};
const availabilityColors: Record<DriverAvailability, string> = {
  disponible: "bg-emerald-500/15 text-emerald-700",
  occupe: "bg-amber-500/15 text-amber-700",
  indisponible: "bg-muted text-muted-foreground",
};

const inputCls =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const empty = (): Driver => ({
  id: newId("d"),
  firstName: "", lastName: "", phone: "", photo: "",
  pricePerDay: bookingConfig.chauffeur.pricePerDay,
  availability: "disponible", active: true,
  experienceYears: 0, languages: "", notes: "",
  createdAt: new Date().toISOString().slice(0, 10),
});

function ChauffeursPage() {
  const [items, setItems] = useState<Driver[]>([]);
  const [editing, setEditing] = useState<Driver | null>(null);
  const refresh = () => setItems(listDrivers());
  useEffect(refresh, []);

  const C = bookingConfig.currencySymbol;

  return (
    <>
      <PageHeader
        title="Chauffeurs"
        subtitle={`${items.length} chauffeur(s) — ${items.filter((d) => d.active).length} actif(s)`}
        action={
          <button
            onClick={() => setEditing(empty())}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nouveau chauffeur
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <div
            key={d.id}
            className={`bg-card rounded-xl border border-border overflow-hidden flex flex-col ${
              !d.active ? "opacity-60" : ""
            }`}
          >
            <div className="relative h-44 bg-muted">
              {d.photo ? (
                <img src={d.photo} alt={`${d.firstName} ${d.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <span
                className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${availabilityColors[d.availability]}`}
              >
                {availabilityLabels[d.availability]}
              </span>
              {!d.active && (
                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                  Désactivé
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <p className="font-display text-base font-semibold">
                {d.firstName} {d.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{d.phone || "—"}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Tarif / jour</p>
                  <p className="font-semibold text-foreground">
                    {C}{formatPrice(d.pricePerDay)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expérience</p>
                  <p className="font-semibold text-foreground">{d.experienceYears} an(s)</p>
                </div>
              </div>

              {d.languages && (
                <p className="mt-3 text-[11px] text-muted-foreground">🌐 {d.languages}</p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing(d)}
                  className="flex-1 text-xs rounded-md border border-input px-3 py-1.5 hover:bg-muted"
                >
                  Modifier
                </button>
                <button
                  onClick={() => { toggleDriverActive(d.id); refresh(); }}
                  title={d.active ? "Désactiver" : "Activer"}
                  className={`p-1.5 rounded ${
                    d.active ? "text-muted-foreground hover:bg-muted" : "text-emerald-600 hover:bg-emerald-500/10"
                  }`}
                >
                  {d.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { if (confirm("Supprimer définitivement ce chauffeur ?")) { deleteDriver(d.id); refresh(); } }}
                  className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full">Aucun chauffeur. Cliquez sur « Nouveau chauffeur ».</p>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-2xl bg-card rounded-2xl border border-border my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {items.some((x) => x.id === editing.id) ? "Modifier le chauffeur" : "Nouveau chauffeur"}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Photo (URL)</label>
                <div className="flex gap-3 items-start">
                  <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-muted-foreground shrink-0">
                    {editing.photo ? (
                      <img src={editing.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6" />
                    )}
                  </div>
                  <input
                    className={inputCls}
                    placeholder="https://..."
                    value={editing.photo}
                    onChange={(e) => setEditing({ ...editing, photo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Prénom</label>
                <input className={inputCls} value={editing.firstName}
                  onChange={(e) => setEditing({ ...editing, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Nom</label>
                <input className={inputCls} value={editing.lastName}
                  onChange={(e) => setEditing({ ...editing, lastName: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Numéro de téléphone</label>
                <input className={inputCls} placeholder="+243 ..." value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Prix par jour ({C})</label>
                <input type="number" min={0} className={inputCls} value={editing.pricePerDay}
                  onChange={(e) => setEditing({ ...editing, pricePerDay: Number(e.target.value) || 0 })} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Disponibilité</label>
                <select className={inputCls} value={editing.availability}
                  onChange={(e) => setEditing({ ...editing, availability: e.target.value as DriverAvailability })}>
                  {Object.entries(availabilityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Années d'expérience</label>
                <input type="number" min={0} className={inputCls} value={editing.experienceYears}
                  onChange={(e) => setEditing({ ...editing, experienceYears: Number(e.target.value) || 0 })} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Langues parlées</label>
                <input className={inputCls} placeholder="Français, Lingala, Anglais" value={editing.languages}
                  onChange={(e) => setEditing({ ...editing, languages: e.target.value })} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Notes internes</label>
                <textarea className={inputCls} rows={3} value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </div>

              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                Actif (visible côté client)
              </label>
            </div>

            <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)}
                className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted">Annuler</button>
              <button
                onClick={() => {
                  if (!editing.firstName || !editing.lastName) {
                    alert("Prénom et nom requis.");
                    return;
                  }
                  upsertDriver(editing);
                  setEditing(null);
                  refresh();
                }}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
