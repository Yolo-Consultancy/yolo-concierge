/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  listMovingMissions,
  upsertMovingMission,
  deleteMovingMission,
  listMovers,
  listBusyMoverIds,
  MOVING_MISSION_STATUS_LABELS,
  MOVING_MISSION_STATUS_COLORS,
  MOVING_MISSION_TYPE_LABELS,
  type MovingMission,
  type MovingMissionStatus,
  type MovingMissionType,
  type Mover,
} from "@/lib/demenagement/store";
import { listAdminServiceRequests, type ServiceRequest } from "@/lib/portals/service-requests";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-demenagement/missions")({
  component: DemenagementMissionsPage,
});

const inputCls =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const empty = (): MovingMission => ({
  id: "",
  contactMessageId: "",
  assigneeId: "",
  assigneeName: "",
  type: "complet",
  scheduledAt: new Date().toISOString(),
  status: "a_affecter",
  notes: "",
});

function DemenagementMissionsPage() {
  const { ask, dialog } = useConfirmDialog();
  const [items, setItems] = useState<MovingMission[]>([]);
  const [demandes, setDemandes] = useState<ServiceRequest[]>([]);
  const [movers, setMovers] = useState<Mover[]>([]);
  const [editing, setEditing] = useState<MovingMission | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyMoverIds, setBusyMoverIds] = useState<string[]>([]);
  const activeMovers = movers.filter((m) => m.active);
  const linkedContactIds = new Set(
    items.map((m) => m.contactMessageId).filter(Boolean),
  );
  const availableDemandes = demandes.filter(
    (d) =>
      !linkedContactIds.has(d.id) ||
      (editing?.contactMessageId && d.id === editing.contactMessageId),
  );

  const refresh = () => {
    listMovingMissions().then(setItems);
    listAdminServiceRequests("demenagement").then(setDemandes);
    listMovers().then(setMovers);
    listBusyMoverIds(editing?.id).then(setBusyMoverIds);
  };
  useEffect(refresh, []);

  useEffect(() => {
    if (editing) listBusyMoverIds(editing.id).then(setBusyMoverIds);
  }, [editing?.id]);

  const handleSave = async () => {
    if (!editing) return;

    if (editing.assigneeId && busyMoverIds.includes(editing.assigneeId)) {
      toast.error("Ce déménageur a déjà une mission en cours. Choisissez un autre déménageur.");
      return;
    }

    if (!editing.contactMessageId && editing.assigneeId) {
      toast.error("Associez une demande client avant d'affecter un déménageur.");
      return;
    }

    setSaving(true);
    try {
      await upsertMovingMission(editing);
      toast.success("Mission enregistrée.");
    } catch (err) {
      setSaving(false);
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer la mission.");
      return;
    }

    setSaving(false);
    setEditing(null);
    refresh();
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Missions déménagement</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {items.length} mission(s) — affectation et suivi terrain
          </p>
        </div>
        <button
          onClick={() => setEditing(empty())}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nouvelle mission
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => {
          const demande = demandes.find((d) => d.id === m.contactMessageId);
          return (
            <div key={m.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {MOVING_MISSION_TYPE_LABELS[m.type]}
                  </p>
                  <p className="font-display text-base font-semibold mt-1">
                    {demande?.subject ?? "Demande non liée"}
                  </p>
                  <p className="text-xs text-muted-foreground">{demande?.name ?? "Client inconnu"}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${MOVING_MISSION_STATUS_COLORS[m.status]}`}>
                  {MOVING_MISSION_STATUS_LABELS[m.status]}
                </span>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Assigné à :</strong>{" "}
                  {m.assigneeName || "Non affecté"}
                </p>
                <p>
                  <strong className="text-foreground">Planifié :</strong>{" "}
                  {new Date(m.scheduledAt).toLocaleString("fr-FR")}
                </p>
                {m.notes && <p className="italic">{m.notes}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing(m)}
                  className="flex-1 text-xs rounded-md border border-input px-3 py-1.5 hover:bg-muted"
                >
                  Modifier
                </button>
                <button
                  onClick={() =>
                    ask({
                      title: "Supprimer cette mission ?",
                      description: "Cette action est définitive.",
                      confirmLabel: "Supprimer",
                      onConfirm: () => deleteMovingMission(m.id).then(refresh),
                    })
                  }
                  className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucune mission déménagement.</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-card">
              <h2 className="font-display text-lg font-semibold">Mission déménagement</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <select
                className={inputCls}
                value={editing.contactMessageId}
                onChange={(e) => setEditing({ ...editing, contactMessageId: e.target.value })}
              >
                <option value="">— Demande client associée —</option>
                {availableDemandes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.subject}
                  </option>
                ))}
              </select>
              <select
                className={inputCls}
                value={editing.type}
                onChange={(e) =>
                  setEditing({ ...editing, type: e.target.value as MovingMissionType })
                }
              >
                {(Object.entries(MOVING_MISSION_TYPE_LABELS) as [MovingMissionType, string][]).map(
                  ([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ),
                )}
              </select>
              <select
                className={inputCls}
                value={editing.assigneeId}
                onChange={(e) => {
                  const mover = movers.find((m) => m.id === e.target.value);
                  const assigneeName = mover
                    ? `${mover.firstName} ${mover.lastName}`.trim()
                    : "";
                  setEditing({ ...editing, assigneeId: e.target.value, assigneeName });
                }}
              >
                <option value="">— Affecter à un déménageur —</option>
                {editing.assigneeId &&
                  !activeMovers.some((m) => m.id === editing.assigneeId) &&
                  (() => {
                    const current = movers.find((m) => m.id === editing.assigneeId);
                    return current ? (
                      <option key={current.id} value={current.id}>
                        {current.firstName} {current.lastName} (inactif)
                      </option>
                    ) : editing.assigneeName ? (
                      <option key={editing.assigneeId} value={editing.assigneeId}>
                        {editing.assigneeName} (ancienne affectation)
                      </option>
                    ) : null;
                  })()}
                {activeMovers.map((m) => {
                  const isBusy = busyMoverIds.includes(m.id);
                  const isCurrent = m.id === editing.assigneeId;
                  return (
                    <option key={m.id} value={m.id} disabled={isBusy && !isCurrent}>
                      {m.firstName} {m.lastName}
                      {isBusy && !isCurrent ? " (mission en cours)" : ""}
                      {m.phone ? ` · ${m.phone}` : ""}
                    </option>
                  );
                })}
              </select>
              {busyMoverIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Les déménageurs avec une mission <strong>en cours</strong> sont désactivés.
                </p>
              )}
              <input
                type="datetime-local"
                className={inputCls}
                value={editing.scheduledAt.slice(0, 16)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    scheduledAt: new Date(e.target.value).toISOString(),
                  })
                }
              />
              <select
                className={inputCls}
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as MovingMissionStatus })
                }
              >
                {(
                  Object.entries(MOVING_MISSION_STATUS_LABELS) as [MovingMissionStatus, string][]
                ).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <textarea
                className={inputCls}
                placeholder="Notes"
                rows={3}
                value={editing.notes}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-card">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
      {dialog}
    </>
  );
}
