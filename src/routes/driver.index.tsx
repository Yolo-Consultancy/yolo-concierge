/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, FileText, X, Star } from "lucide-react";
import { useDriverAccount } from "@/routes/driver";
import { listDriverMissions, submitTripReport, type DriverMission } from "@/lib/driver/store";
import { toast } from "sonner";

export const Route = createFileRoute("/driver/")({ component: DriverDashboard });

const statusLabels: Record<string, string> = {
  a_affecter: "À affecter",
  en_cours: "En cours",
  terminee: "Terminée",
};

const statusColors: Record<string, string> = {
  a_affecter: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  en_cours: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  terminee: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50";

function DriverDashboard() {
  const { account } = useDriverAccount();
  const [missions, setMissions] = useState<DriverMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState<DriverMission | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    notes: "",
    incidents: "",
    odometerEnd: "",
    fuelLevel: "",
  });

  const refresh = () => {
    setLoading(true);
    listDriverMissions()
      .then(setMissions)
      .catch(() => toast.error("Impossible de charger vos missions."))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const openReport = (mission: DriverMission) => {
    setReporting(mission);
    setForm({ notes: "", incidents: "", odometerEnd: "", fuelLevel: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporting) return;
    if (!form.notes.trim()) {
      toast.error("Le compte-rendu est obligatoire.");
      return;
    }
    setSaving(true);
    try {
      const result = await submitTripReport({
        missionId: reporting.id,
        notes: form.notes.trim(),
        incidents: form.incidents.trim() || undefined,
        odometerEnd: form.odometerEnd ? Number(form.odometerEnd) : undefined,
        fuelLevel: form.fuelLevel.trim() || undefined,
      });
      toast.success("Rapport envoyé à l'administration.", {
        description: result.adminEmailSent
          ? "Un e-mail de satisfaction sera envoyé au client dans 15 minutes."
          : "Le client recevra un e-mail de notation dans 15 minutes (si son e-mail est renseigné).",
      });
      setReporting(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSaving(false);
    }
  };

  const activeMissions = missions.filter((m) => m.status === "en_cours");
  const pastMissions = missions.filter((m) => m.status !== "en_cours");

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Bonjour, {account?.firstName}
        </h1>
        <p className="text-white/50 text-sm mt-2">
          Clôturez vos courses en cours en envoyant un rapport à l'équipe YOLO.
        </p>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Chargement...</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <ClipboardList className="h-5 w-5 text-amber-400" />
              Missions en cours
            </h2>
            {activeMissions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/40 text-sm">
                Aucune mission en cours pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {activeMissions.map((m) => (
                  <MissionCard key={m.id} mission={m} onReport={() => openReport(m)} />
                ))}
              </div>
            )}
          </section>

          {pastMissions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white/70 mb-4">Historique récent</h2>
              <div className="space-y-3">
                {pastMissions.slice(0, 10).map((m) => (
                  <MissionCard key={m.id} mission={m} compact />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {reporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  Rapport de fin de course
                </h3>
                <p className="text-xs text-white/40 mt-1">
                  {reporting.clientName} · {reporting.vehicleName}
                </p>
              </div>
              <button
                onClick={() => setReporting(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                  Compte-rendu *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Décrivez le déroulement de la course, remise du véhicule, état général..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                  Incidents éventuels
                </label>
                <textarea
                  rows={2}
                  value={form.incidents}
                  onChange={(e) => setForm({ ...form, incidents: e.target.value })}
                  placeholder="Retard, panne, comportement client, etc."
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                    Km fin
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.odometerEnd}
                    onChange={(e) => setForm({ ...form, odometerEnd: e.target.value })}
                    placeholder="Ex. 45230"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                    Carburant
                  </label>
                  <input
                    value={form.fuelLevel}
                    onChange={(e) => setForm({ ...form, fuelLevel: e.target.value })}
                    placeholder="Ex. Plein"
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="text-xs text-white/35 leading-relaxed">
                Après envoi, l'administration sera notifiée. Le client recevra automatiquement un e-mail
                15 minutes plus tard pour noter le service et votre prestation.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition disabled:opacity-50"
              >
                {saving ? "Envoi..." : "Envoyer le rapport"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MissionCard({
  mission,
  onReport,
  compact,
}: {
  mission: DriverMission;
  onReport?: () => void;
  compact?: boolean;
}) {
  const canReport = mission.status === "en_cours" && !mission.hasReport;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.02] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{mission.clientName || "Client"}</p>
          <p className="text-sm text-white/50">{mission.vehicleName || "Véhicule"}</p>
          {!compact && mission.pickupLocation && (
            <p className="text-xs text-white/35 mt-1">{mission.pickupLocation}</p>
          )}
          <p className="text-xs text-white/30 mt-1">
            {new Date(mission.scheduledAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            statusColors[mission.status] || "bg-white/5 text-white/50"
          }`}
        >
          {statusLabels[mission.status] || mission.status}
        </span>
      </div>

      {canReport && onReport && (
        <button
          onClick={onReport}
          className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition flex items-center justify-center gap-2"
        >
          <Star className="h-4 w-4" />
          Clôturer et envoyer le rapport
        </button>
      )}
      {mission.hasReport && mission.status === "terminee" && (
        <p className="mt-3 text-xs text-emerald-400/80">Rapport envoyé</p>
      )}
    </div>
  );
}
