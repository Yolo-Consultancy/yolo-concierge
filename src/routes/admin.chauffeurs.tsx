/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X, Power, PowerOff, Search, SlidersHorizontal, Upload, ImageIcon } from "lucide-react";
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

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const empty = (): Driver => ({
  id: newId("d"),
  firstName: "", lastName: "", phone: "", photo: "",
  pricePerDay: bookingConfig.chauffeur.pricePerDay,
  availability: "disponible", active: true,
  experienceYears: 0, languages: "", city: "", notes: "",
  createdAt: new Date().toISOString().slice(0, 10),
});

/* ── Photo Uploader ─────────────────────────────────────────── */
function DriverPhotoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format invalide. Utilisez JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Fichier trop lourd. Maximum 5 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="sm:col-span-2 space-y-2">
      <label className="block text-xs font-medium mb-1.5">Photo du chauffeur</label>
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="h-24 w-24 rounded-xl bg-muted overflow-hidden flex items-center justify-center text-muted-foreground shrink-0 border border-dashed border-border">
          {value ? (
            <img src={value} alt="Aperçu" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-7 w-7 opacity-40" />
          )}
        </div>

        {/* Drop zone */}
        <div
          className={`flex-1 rounded-xl border-2 border-dashed transition-colors p-4 flex flex-col items-center justify-center gap-2 cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            Glissez une image ici ou <span className="text-primary underline">parcourir</span>
          </p>
          <p className="text-[10px] text-muted-foreground">JPEG, PNG, WebP · max 5 Mo</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-destructive hover:underline"
        >
          Supprimer la photo
        </button>
      )}
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────── */
function ChauffeursPage() {
  const [items, setItems] = useState<Driver[]>([]);
  const [editing, setEditing] = useState<Driver | null>(null);

  // ── Filtres
  const [search, setSearch]         = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [filterAvail, setFilterAvail] = useState<"" | DriverAvailability>("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const refresh = () => setItems(listDrivers());
  useEffect(refresh, []);

  const C = bookingConfig.currencySymbol;

  // Valeurs uniques pour les dropdowns
  const cities = [...new Set(items.map((d) => d.city).filter(Boolean))].sort();
  const langs  = [...new Set(
    items.flatMap((d) => d.languages.split(",").map((l) => l.trim())).filter(Boolean)
  )].sort();

  const filtered = items.filter((d) => {
    const q = search.toLowerCase();
    if (q && !`${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(q)) return false;
    if (filterCity && d.city !== filterCity) return false;
    if (filterLang && !d.languages.toLowerCase().includes(filterLang.toLowerCase())) return false;
    if (filterAvail && d.availability !== filterAvail) return false;
    if (filterMaxPrice && d.pricePerDay > Number(filterMaxPrice)) return false;
    return true;
  });

  const hasFilters = filterCity || filterLang || filterAvail || filterMaxPrice;
  const resetFilters = () => {
    setFilterCity(""); setFilterLang(""); setFilterAvail(""); setFilterMaxPrice("");
  };

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

      {/* ── Barre de recherche + filtres */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Rechercher par nom ou téléphone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
              showFilters || hasFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {hasFilters && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
                {[filterCity, filterLang, filterAvail, filterMaxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground px-2">
              Réinitialiser
            </button>
          )}
        </div>

        {showFilters && (
          <div className="rounded-xl border border-border bg-card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Ville</label>
              <select className={inputCls} value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                <option value="">Toutes</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Langue</label>
              <select className={inputCls} value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
                <option value="">Toutes</option>
                {langs.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Disponibilité</label>
              <select className={inputCls} value={filterAvail} onChange={(e) => setFilterAvail(e.target.value as "" | DriverAvailability)}>
                <option value="">Toutes</option>
                {Object.entries(availabilityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Prix max / jour ({C})</label>
              <input
                type="number" min={0} className={inputCls}
                placeholder="Ex. 100"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
              />
            </div>
          </div>
        )}

        {filtered.length !== items.length && (
          <p className="text-xs text-muted-foreground">{filtered.length} résultat(s) sur {items.length}</p>
        )}
      </div>

      {/* ── Grille */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
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
              {d.city && <p className="text-xs text-muted-foreground">📍 {d.city}</p>}

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Tarif / jour</p>
                  <p className="font-semibold text-foreground">{C}{formatPrice(d.pricePerDay)}</p>
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
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full">
            {items.length === 0
              ? "Aucun chauffeur. Cliquez sur « Nouveau chauffeur »."
              : "Aucun résultat pour ces filtres."}
          </p>
        )}
      </div>

      {/* ── Modal édition */}
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
              {/* Photo uploader */}
              <DriverPhotoUploader
                value={editing.photo}
                onChange={(v) => setEditing({ ...editing, photo: v })}
              />

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
                <label className="block text-xs font-medium mb-1.5">Ville d'activité</label>
                <input className={inputCls} placeholder="Kinshasa, Lubumbashi…" value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
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
