/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RotateCcw, X } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listVehicles, upsertVehicle, deleteVehicle, resetVehicles, newId,
} from "@/lib/admin/store";
import { formatPrice, type Vehicle } from "@/lib/vehicles";

export const Route = createFileRoute("/admin/vehicules")({
  component: VehiculesAdmin,
});

const emptyVehicle = (): Vehicle => ({
  id: newId("vh"),
  name: "",
  brand: "",
  year: new Date().getFullYear(),
  category: "Supercar",
  location: "Kinshasa",
  pricePerDay: 0,
  image: "",
  gallery: ["", "", "", "", "", ""],
  specs: { hp: 0, seats: 2, transmission: "Automatique", fuel: "Essence super" },
  description: "",
  conditions: { deposit: "", minAge: "25+", licenseYears: "3 ans", dailyKm: "200 km" },
  keyStats: { power: "", zeroTo100: "", topSpeed: "", fuel: "Essence super" },
  performance: { hp: "", torque: "", zeroTo100: "", topSpeed: "" },
  drivetrain: { fuel: "Essence super", transmission: "", gearbox: "" },
  equipment: { seats: "", wheels: "", brakes: "", suspension: "", exterior: "", interior: "" },
});

function VehiculesAdmin() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const refresh = () => setItems(listVehicles());
  useEffect(refresh, []);

  const save = () => {
    if (!editing) return;
    upsertVehicle({ ...editing, image: editing.gallery[0] || editing.image });
    setEditing(null);
    refresh();
  };
  const remove = (id: string) => {
    if (confirm("Supprimer ce véhicule ?")) { deleteVehicle(id); refresh(); }
  };

  return (
    <>
      <PageHeader
        title="Véhicules"
        subtitle={`${items.length} véhicule(s) — modifie le catalogue affiché sur le site public`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => { if (confirm("Restaurer la liste par défaut ?")) { resetVehicles(); refresh(); } }}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </button>
            <button
              onClick={() => setEditing(emptyVehicle())}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Nouveau véhicule
            </button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((v) => (
          <div key={v.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="aspect-[4/3] bg-muted overflow-hidden">
              {v.image && <img src={v.image} alt={v.name} className="h-full w-full object-cover" />}
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{v.brand} · {v.category}</p>
              <p className="font-display text-lg font-semibold">{v.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatPrice(v.pricePerDay)} € / jour</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(v)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs hover:bg-muted">
                  <Pencil className="h-3 w-3" /> Modifier
                </button>
                <button onClick={() => remove(v.id)}
                  className="inline-flex items-center justify-center gap-1 rounded-md border border-destructive/30 text-destructive px-2 py-1.5 text-xs hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <VehicleForm value={editing} onChange={setEditing} onClose={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function VehicleForm({
  value, onChange, onClose, onSave,
}: { value: Vehicle; onChange: (v: Vehicle) => void; onClose: () => void; onSave: () => void }) {
  const v = value;
  const set = (patch: Partial<Vehicle>) => onChange({ ...v, ...patch });
  const setGallery = (i: number, url: string) => {
    const g = [...v.gallery]; g[i] = url; onChange({ ...v, gallery: g });
  };
  const addPhoto = () => onChange({ ...v, gallery: [...v.gallery, ""] });
  const removePhoto = (i: number) => onChange({ ...v, gallery: v.gallery.filter((_, j) => j !== i) });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end lg:items-center justify-center p-0 lg:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-card rounded-t-2xl lg:rounded-2xl border border-border my-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-display text-xl font-semibold">{v.name || "Nouveau véhicule"}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Marque"><input className={inputCls} value={v.brand} onChange={(e) => set({ brand: e.target.value })} /></Field>
            <Field label="Modèle / Nom"><input className={inputCls} value={v.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Catégorie">
              <select className={inputCls} value={v.category} onChange={(e) => set({ category: e.target.value })}>
                <option>Supercar</option><option>Sport</option><option>SUV de Luxe</option>
                <option>Grand Tourisme</option><option>Ultra Luxe</option><option>Berline</option>
              </select>
            </Field>
            <Field label="Année"><input type="number" className={inputCls} value={v.year} onChange={(e) => set({ year: +e.target.value })} /></Field>
            <Field label="Prix / jour (€)"><input type="number" className={inputCls} value={v.pricePerDay} onChange={(e) => set({ pricePerDay: +e.target.value })} /></Field>
            <Field label="Localisation"><input className={inputCls} value={v.location} onChange={(e) => set({ location: e.target.value })} /></Field>
          </div>

          <Field label="Description">
            <textarea rows={3} className={inputCls} value={v.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Galerie photos ({v.gallery.length})</p>
              <button onClick={addPhoto} className="text-xs text-primary hover:underline">+ Ajouter une photo</button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Minimum 6 photos recommandées : avant, côté, arrière, 3/4, intérieur tableau de bord, intérieur sièges.</p>
            <div className="space-y-2">
              {v.gallery.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                  <input className={inputCls} placeholder="https://..." value={url} onChange={(e) => setGallery(i, e.target.value)} />
                  {url && <img src={url} alt="" className="h-10 w-10 object-cover rounded border border-border" />}
                  <button onClick={() => removePhoto(i)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <details className="border border-border rounded-md">
            <summary className="px-4 py-2 text-sm font-medium cursor-pointer">Spécifications techniques</summary>
            <div className="p-4 grid sm:grid-cols-2 gap-3">
              <Field label="Puissance (HP)"><input type="number" className={inputCls} value={v.specs.hp} onChange={(e) => set({ specs: { ...v.specs, hp: +e.target.value } })} /></Field>
              <Field label="Sièges"><input type="number" className={inputCls} value={v.specs.seats} onChange={(e) => set({ specs: { ...v.specs, seats: +e.target.value } })} /></Field>
              <Field label="Transmission"><input className={inputCls} value={v.specs.transmission} onChange={(e) => set({ specs: { ...v.specs, transmission: e.target.value } })} /></Field>
              <Field label="Carburant"><input className={inputCls} value={v.specs.fuel} onChange={(e) => set({ specs: { ...v.specs, fuel: e.target.value } })} /></Field>
              <Field label="0 à 100 km/h"><input className={inputCls} value={v.keyStats.zeroTo100} onChange={(e) => set({ keyStats: { ...v.keyStats, zeroTo100: e.target.value }, performance: { ...v.performance, zeroTo100: e.target.value } })} /></Field>
              <Field label="Vitesse max"><input className={inputCls} value={v.keyStats.topSpeed} onChange={(e) => set({ keyStats: { ...v.keyStats, topSpeed: e.target.value }, performance: { ...v.performance, topSpeed: e.target.value } })} /></Field>
              <Field label="Caution"><input className={inputCls} value={v.conditions.deposit} onChange={(e) => set({ conditions: { ...v.conditions, deposit: e.target.value } })} /></Field>
              <Field label="Km/jour inclus"><input className={inputCls} value={v.conditions.dailyKm} onChange={(e) => set({ conditions: { ...v.conditions, dailyKm: e.target.value } })} /></Field>
            </div>
          </details>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted">Annuler</button>
          <button onClick={onSave} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
