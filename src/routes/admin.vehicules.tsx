/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RotateCcw, X, Upload, ArrowLeft, ArrowRight, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

const RECOMMENDED_ANGLES = [
  "Devant (Principal)",
  "Profil Côté",
  "Vue Arrière",
  "Angle 3/4",
  "Tableau de bord",
  "Sièges Intérieurs",
];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max_size = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

function VehicleForm({
  value, onChange, onClose, onSave,
}: { value: Vehicle; onChange: (v: Vehicle) => void; onClose: () => void; onSave: () => void }) {
  const v = value;
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingUrlIndex, setEditingUrlIndex] = useState<number | null>(null);

  const set = (patch: Partial<Vehicle>) => onChange({ ...v, ...patch });
  const setGallery = (i: number, url: string) => {
    const g = [...v.gallery]; g[i] = url; onChange({ ...v, gallery: g });
  };
  const addPhoto = () => {
    onChange({ ...v, gallery: [...v.gallery, ""] });
  };

  const handleFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} n'est pas une image.`);
        continue;
      }
      try {
        const compressed = await compressImage(file);
        newUrls.push(compressed);
      } catch (err) {
        toast.error(`Échec de la compression de ${file.name}`);
        console.error(err);
      }
    }

    if (newUrls.length > 0) {
      const currentGallery = [...v.gallery];
      let injectedCount = 0;

      // Try to fill empty slots
      for (let i = 0; i < currentGallery.length && injectedCount < newUrls.length; i++) {
        if (!currentGallery[i]) {
          currentGallery[i] = newUrls[injectedCount];
          injectedCount++;
        }
      }

      // Append remaining
      const remaining = newUrls.slice(injectedCount);
      const updatedGallery = [...currentGallery, ...remaining];
      
      // Ensure we always have at least 6 items
      while (updatedGallery.length < 6) {
        updatedGallery.push("");
      }

      onChange({ ...v, gallery: updatedGallery });
      toast.success(`${newUrls.length} image(s) ajoutée(s) !`);
    }
    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDropUpload = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files);
    }
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= v.gallery.length) return;
    const g = [...v.gallery];
    const [item] = g.splice(from, 1);
    g.splice(to, 0, item);
    onChange({ ...v, gallery: g });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    moveItem(draggedIndex, index);
    setDraggedIndex(null);
  };

  const clearOrRemovePhoto = (index: number) => {
    const g = [...v.gallery];
    if (index < 6) {
      g[index] = ""; // Keep the slot, just empty the URL so the placeholder remains!
    } else {
      g.splice(index, 1); // Delete the extra slot completely
    }
    // Make sure we have at least 6 slots
    while (g.length < 6) {
      g.push("");
    }
    onChange({ ...v, gallery: g });
    toast.info("Photo retirée.");
  };

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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Galerie photos ({v.gallery.filter(Boolean).length} / {v.gallery.length})</p>
                <p className="text-xs text-muted-foreground mt-0.5">Minimum 6 photos recommandées. Glissez-déposez pour réorganiser l'ordre.</p>
              </div>
              <button type="button" onClick={addPhoto} className="text-xs text-primary hover:underline font-medium">+ Ajouter un emplacement</button>
            </div>

            {/* Zone de Glisser-Déposer Globale */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDropUpload}
              onClick={() => document.getElementById("gallery-file-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/20 hover:border-primary/50 bg-muted/10 hover:bg-muted/20"
              }`}
            >
              <input
                id="gallery-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium">Traitement et compression des images...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Glissez-déposez vos photos ici ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supporte plusieurs images simultanément. Compression locale active.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Grille des photos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {v.gallery.map((url, i) => {
                const isRecommended = i < 6;
                const angleName = isRecommended ? RECOMMENDED_ANGLES[i] : `Autre photo ${i - 5}`;
                const hasImage = !!url;

                return (
                  <div
                    key={i}
                    draggable={hasImage}
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(i, e)}
                    onDrop={() => handleDrop(i)}
                    className={`relative rounded-xl border overflow-hidden flex flex-col group transition bg-muted/20 ${
                      draggedIndex === i ? "opacity-40" : ""
                    } ${
                      hasImage
                        ? "border-border hover:border-primary cursor-grab active:cursor-grabbing"
                        : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
                    }`}
                  >
                    {/* Header: drag handle & index & angle title */}
                    <div className="bg-muted/40 px-3 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground select-none font-medium border-b border-border/10">
                      <span className="flex items-center gap-1 min-w-0">
                        {hasImage && <GripVertical className="h-3 w-3 flex-shrink-0" />}
                        <span className="truncate">{angleName}</span>
                      </span>
                      <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">
                        {i + 1}
                      </span>
                    </div>

                    {/* Preview / Upload Placeholder */}
                    <div className="relative aspect-4/3 flex items-center justify-center bg-black/10 overflow-hidden">
                      {hasImage ? (
                        <>
                          <img
                            src={url}
                            alt={angleName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          {/* Hover Actions Controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveItem(i, i - 1);
                              }}
                              disabled={i === 0}
                              className="p-1.5 rounded bg-background/90 text-foreground hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                              title="Déplacer à gauche"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveItem(i, i + 1);
                              }}
                              disabled={i === v.gallery.length - 1}
                              className="p-1.5 rounded bg-background/90 text-foreground hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                              title="Déplacer à droite"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingUrlIndex(editingUrlIndex === i ? null : i);
                              }}
                              className="p-1.5 rounded bg-background/90 text-foreground hover:bg-background transition cursor-pointer"
                              title="Modifier l'URL"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearOrRemovePhoto(i);
                              }}
                              className="p-1.5 rounded bg-destructive/90 text-destructive-foreground hover:bg-destructive transition cursor-pointer"
                              title="Retirer la photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("gallery-file-input")?.click();
                          }}
                          className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 hover:text-primary transition cursor-pointer p-4"
                        >
                          <ImageIcon className="h-6 w-6 mb-1.5" />
                          <span className="text-[10px] text-center font-medium">Ajouter la photo</span>
                        </div>
                      )}
                    </div>

                    {/* Inline URL edit block */}
                    {(editingUrlIndex === i || (!hasImage && editingUrlIndex === i)) && (
                      <div className="p-2 bg-muted/30 border-t border-border/10" onClick={(e) => e.stopPropagation()}>
                        <input
                          className="w-full text-xs px-2 py-1 rounded border border-input bg-background"
                          placeholder="Coller l'URL (https://...)"
                          value={url}
                          onChange={(e) => setGallery(i, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
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
