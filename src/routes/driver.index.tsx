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

const INCIDENT_TYPES = [
  { id: "panne", label: "Panne" },
  { id: "accident", label: "Accident" },
  { id: "arrestation", label: "Arrestation" },
  { id: "perte", label: "Perte" },
  { id: "retard", label: "Retard" },
  { id: "autre", label: "Autre" },
] as const;

type IncidentTypeId = (typeof INCIDENT_TYPES)[number]["id"];

type ReportForm = {
  hasIncident: boolean | null;
  incidentType: IncidentTypeId | "";
  incidentOther: string;
};

const emptyReportForm = (): ReportForm => ({
  hasIncident: null,
  incidentType: "",
  incidentOther: "",
});

function buildIncidentsValue(form: ReportForm): string | undefined {
  if (form.hasIncident !== true) return undefined;
  if (form.incidentType === "autre") {
    return `Autre : ${form.incidentOther.trim()}`;
  }
  const match = INCIDENT_TYPES.find((t) => t.id === form.incidentType);
  return match?.label;
}

function DriverDashboard() {
  const { account } = useDriverAccount();
  const [missions, setMissions] = useState<DriverMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("en_cours");
  const [reporting, setReporting] = useState<DriverMission | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReportForm>(emptyReportForm);

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
    setForm(emptyReportForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporting) return;
    if (form.hasIncident === null) {
      toast.error("Indiquez s'il y a eu un incident.");
      return;
    }
    if (form.hasIncident && !form.incidentType) {
      toast.error("Sélectionnez le type d'incident.");
      return;
    }
    if (form.hasIncident && form.incidentType === "autre" && !form.incidentOther.trim()) {
      toast.error("Précisez l'incident dans le champ « Autre ».");
      return;
    }
    setSaving(true);
    try {
      const incidents = buildIncidentsValue(form);
      const result = await submitTripReport({
        missionId: reporting.id,
        notes: incidents ? `Incident signalé : ${incidents}` : "Course terminée sans incident.",
        incidents,
      });
      toast.success("Rapport envoyé à l'administration.", {
        description: result.clientEmailSent
          ? "Le client a reçu immédiatement son e-mail de notation."
          : result.clientEmailReason === "no_client_email"
            ? "Le client n'a pas d'e-mail — aucune notification envoyée."
            : "L'e-mail client sera réessayé automatiquement.",
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
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Y a-t-il eu un incident ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        hasIncident: false,
                        incidentType: "",
                        incidentOther: "",
                      })
                    }
                    className={`py-3 rounded-xl border text-sm font-medium transition ${
                      form.hasIncident === false
                        ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    Non
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasIncident: true })}
                    className={`py-3 rounded-xl border text-sm font-medium transition ${
                      form.hasIncident === true
                        ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    Oui
                  </button>
                </div>
              </div>

              {form.hasIncident === true && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                    Type d'incident
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INCIDENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            incidentType: type.id,
                            incidentOther: type.id === "autre" ? form.incidentOther : "",
                          })
                        }
                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                          form.incidentType === type.id
                            ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                            : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {form.incidentType === "autre" && (
                    <textarea
                      rows={3}
                      value={form.incidentOther}
                      onChange={(e) => setForm({ ...form, incidentOther: e.target.value })}
                      placeholder="Décrivez brièvement l'incident..."
                      className={`${inputCls} mt-3`}
                    />
                  )}
                </div>
              )}

              <p className="text-xs text-white/35 leading-relaxed">
                Après envoi, l'administration sera notifiée et le client recevra immédiatement un e-mail
                pour noter le service et votre prestation.
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
