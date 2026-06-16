/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  FileText,
  X,
  Star,
  History,
  MapPin,
  Calendar,
  Car,
} from "lucide-react";
import { useDriverAccount } from "@/routes/driver";
import { listDriverMissions, submitTripReport, type DriverMission } from "@/lib/driver/store";
import { toast } from "sonner";

export const Route = createFileRoute("/driver/")({ component: DriverDashboard });

type Tab = "en_cours" | "historique";

const statusLabels: Record<string, string> = {
  en_cours: "En cours",
  terminee: "Terminée",
};

const statusColors: Record<string, string> = {
  en_cours: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  terminee: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const typeLabels: Record<string, string> = {
  livraison: "Livraison véhicule",
  chauffeur: "Course chauffeur",
  recuperation: "Récupération",
};

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50";

function DriverDashboard() {
  const { account } = useDriverAccount();
  const [missions, setMissions] = useState<DriverMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("en_cours");
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

  const activeMissions = missions.filter((m) => m.status === "en_cours");
  const historyMissions = missions.filter((m) => m.status === "terminee");
  const displayed = tab === "en_cours" ? activeMissions : historyMissions;

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
      setTab("historique");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Bonjour, {account?.firstName}
        </h1>
        <p className="text-white/50 text-sm mt-2">
          Vos missions assignées par YOLO Le Concierge.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-blue-400/80">En cours</p>
          <p className="text-3xl font-bold text-white mt-1">{activeMissions.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-400/80">Terminées</p>
          <p className="text-3xl font-bold text-white mt-1">{historyMissions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => setTab("en_cours")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "en_cours"
              ? "bg-amber-400 text-black shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          En cours ({activeMissions.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("historique")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "historique"
              ? "bg-amber-400 text-black shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          Historique ({historyMissions.length})
        </button>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Chargement de vos missions...</p>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/2 p-10 text-center">
          <p className="text-white/40 text-sm">
            {tab === "en_cours"
              ? "Aucune mission en cours pour le moment."
              : "Aucune mission terminée dans votre historique."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              onReport={tab === "en_cours" ? () => openReport(m) : undefined}
            />
          ))}
        </div>
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
}: {
  mission: DriverMission;
  onReport?: () => void;
}) {
  const canReport = mission.status === "en_cours" && !mission.hasReport;
  const dateRange =
    mission.startDate && mission.endDate
      ? `${formatDate(mission.startDate)} → ${formatDate(mission.endDate)}`
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white text-lg">{mission.clientName || "Client"}</p>
          <p className="text-sm text-amber-400/90 mt-0.5">
            {typeLabels[mission.type] || mission.type}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${
            statusColors[mission.status] || "bg-white/5 text-white/50"
          }`}
        >
          {statusLabels[mission.status] || mission.status}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-white/55">
        <p className="flex items-center gap-2">
          <Car className="h-3.5 w-3.5 text-white/30 shrink-0" />
          {mission.vehicleName || "Véhicule non renseigné"}
        </p>
        {mission.pickupLocation && (
          <p className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
            <span>
              {mission.pickupLocation}
              {mission.dropoffLocation ? ` → ${mission.dropoffLocation}` : ""}
            </span>
          </p>
        )}
        {dateRange && (
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-white/30 shrink-0" />
            {dateRange}
          </p>
        )}
        <p className="text-xs text-white/35">
          Planifiée le {new Date(mission.scheduledAt).toLocaleString("fr-FR")}
        </p>
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
        <p className="mt-3 text-xs text-emerald-400/80 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Rapport envoyé à l'administration
        </p>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}
