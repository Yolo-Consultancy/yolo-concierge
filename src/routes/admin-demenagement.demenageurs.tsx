/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  listMovers,
  upsertMover,
  deleteMover,
  emptyMover,
  checkMoverContactDuplicates,
  MOVER_INPUT_CLS,
  type Mover,
  type MoverDuplicateConflict,
} from "@/lib/demenagement/store";
import { formatPrice } from "@/lib/vehicles";
import { bookingConfig } from "@/config/booking";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export const Route = createFileRoute("/admin-demenagement/demenageurs")({
  component: DemenageursPage,
});

function DemenageursPage() {
  const { ask, dialog } = useConfirmDialog();
  const [items, setItems] = useState<Mover[]>([]);
  const [formMover, setFormMover] = useState<Mover | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    listMovers().then(setItems);
  };
  useEffect(refresh, []);

  const C = bookingConfig.currencySymbol;
  const isNew = formMover ? !items.some((x) => x.id === formMover.id) : false;

  const filtered = items.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return `${d.firstName} ${d.lastName} ${d.email} ${d.phone}`.toLowerCase().includes(q);
  });

  const buildDuplicateDescription = (conflicts: MoverDuplicateConflict[]) => {
    const lines = conflicts.map((c) => {
      const fieldLabel = c.field === "email" ? "e-mail" : "téléphone";
      const value = c.field === "email" ? c.email : c.phone;
      return `• ${fieldLabel} déjà utilisé par ${c.name} (${c.typeLabel}) — ${value}`;
    });
    return `${lines.join(" ")} Voulez-vous quand même enregistrer ce déménageur ?`;
  };

  const performSave = async () => {
    if (!formMover) return;

    setSaving(true);
    try {
      await upsertMover(formMover);
      if (isNew) {
        toast.success(`${formMover.firstName} ${formMover.lastName} a été ajouté à l'équipe.`);
        setSearch("");
      } else {
        toast.success("Déménageur mis à jour.");
      }
      setFormMover(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer le déménageur.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMover) return;

    if (!formMover.firstName.trim() || !formMover.lastName.trim() || !formMover.hiredAt) {
      toast.error("Prénom, nom et date de recrutement sont requis.");
      return;
    }

    if (!formMover.email.trim() && !formMover.phone.trim()) {
      await performSave();
      return;
    }

    try {
      const conflicts = await checkMoverContactDuplicates(
        formMover.email,
        formMover.phone,
        isNew ? undefined : formMover.id,
      );

      if (conflicts.length > 0) {
        ask({
          title: "Doublon détecté",
          description: buildDuplicateDescription(conflicts),
          confirmLabel: isNew ? "Ajouter quand même" : "Enregistrer quand même",
          cancelLabel: "Modifier",
          variant: "warning",
          onConfirm: performSave,
        });
        return;
      }

      await performSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de vérifier les doublons.");
    }
  };

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
          type="button"
          onClick={() => setFormMover(emptyMover())}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nouveau déménageur
        </button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          className={MOVER_INPUT_CLS}
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
                        type="button"
                        onClick={() => setFormMover(d)}
                        className="p-1.5 rounded hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
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

      {formMover && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setFormMover(null)}
        >
          <form
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {isNew ? "Nouveau déménageur" : "Modifier le déménageur"}
              </h2>
              <button
                type="button"
                onClick={() => setFormMover(null)}
                className="p-2 rounded hover:bg-muted"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>
                  Prénom
                </label>
                <input
                  className={MOVER_INPUT_CLS}
                  value={formMover.firstName}
                  onChange={(e) => setFormMover({ ...formMover, firstName: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>
                  Nom
                </label>
                <input
                  className={MOVER_INPUT_CLS}
                  value={formMover.lastName}
                  onChange={(e) => setFormMover({ ...formMover, lastName: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">E-mail</label>
                <input
                  type="email"
                  className={MOVER_INPUT_CLS}
                  placeholder="demenageur@yolo.cd"
                  value={formMover.email}
                  onChange={(e) => setFormMover({ ...formMover, email: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Téléphone</label>
                <input
                  className={MOVER_INPUT_CLS}
                  placeholder="+243 ..."
                  value={formMover.phone}
                  onChange={(e) => setFormMover({ ...formMover, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>
                  Date de recrutement
                </label>
                <input
                  type="date"
                  className={MOVER_INPUT_CLS}
                  value={formMover.hiredAt}
                  onChange={(e) => setFormMover({ ...formMover, hiredAt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" data-required>
                  Salaire mensuel ({C})
                </label>
                <input
                  type="number"
                  min={0}
                  className={MOVER_INPUT_CLS}
                  value={formMover.salary}
                  onChange={(e) =>
                    setFormMover({ ...formMover, salary: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Notes internes</label>
                <textarea
                  className={MOVER_INPUT_CLS}
                  rows={3}
                  value={formMover.notes}
                  onChange={(e) => setFormMover({ ...formMover, notes: e.target.value })}
                />
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formMover.active}
                  onChange={(e) => setFormMover({ ...formMover, active: e.target.checked })}
                />
                Déménageur actif
              </label>
            </div>
            <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormMover(null)}
                className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : isNew ? "Ajouter le déménageur" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
      {dialog}
    </>
  );
}
