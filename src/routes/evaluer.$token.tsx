/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Star, CheckCircle } from "lucide-react";
import { publicApi } from "@/lib/api/client";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { YoloLogo } from "@/components/YoloLogo";

export const Route = createFileRoute("/evaluer/$token")({
  head: () => ({
    meta: [
      { title: "Noter votre course — YOLO Le Concierge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EvaluerPage,
});

type RatingForm = {
  alreadySubmitted: boolean;
  clientName: string;
  driverName: string;
  vehicleName: string;
};

const IMPROVEMENT_TYPES = [
  { id: "retard", label: "Retard" },
  { id: "proprete", label: "Propreté du véhicule" },
  { id: "accueil", label: "Accueil" },
  { id: "conduite", label: "Conduite" },
  { id: "communication", label: "Communication" },
  { id: "vehicule", label: "État du véhicule" },
  { id: "autre", label: "Autre" },
] as const;

type ImprovementTypeId = (typeof IMPROVEMENT_TYPES)[number]["id"];

function EvaluerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-charbon flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">{children}</div>
      <SiteFooter variant="dark" />
    </div>
  );
}

const choiceBtnCls = (active: boolean) =>
  `py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
    active
      ? "border-or-vif/60 bg-or-vif/10 text-or-vif"
      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
  }`;

const yesNoBtnCls = (active: boolean, tone: "no" | "yes") =>
  `py-3 rounded-xl border text-sm font-medium transition ${
    active
      ? tone === "no"
        ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
        : "border-or-vif/60 bg-or-vif/10 text-or-vif"
      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
  }`;

function buildImprovementValue(
  hasImprovement: boolean | null,
  improvementType: ImprovementTypeId | "",
  improvementOther: string,
): string {
  if (hasImprovement !== true) return "";
  if (improvementType === "autre") {
    return `Autre : ${improvementOther.trim()}`;
  }
  const match = IMPROVEMENT_TYPES.find((t) => t.id === improvementType);
  return match?.label || "";
}

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-white mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-8 w-8 ${
                n <= value ? "fill-amber-400 text-amber-400" : "text-white/20"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function EvaluerPage() {
  const { token } = Route.useParams();
  const [info, setInfo] = useState<RatingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceScore, setServiceScore] = useState(0);
  const [driverScore, setDriverScore] = useState(0);
  const [hasImprovement, setHasImprovement] = useState<boolean | null>(null);
  const [improvementType, setImprovementType] = useState<ImprovementTypeId | "">("");
  const [improvementOther, setImprovementOther] = useState("");

  useEffect(() => {
    publicApi
      .get<RatingForm>(`/ratings/token/${token}`)
      .then((data) => {
        setInfo(data);
        if (data.alreadySubmitted) setDone(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Lien invalide"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceScore < 1 || driverScore < 1) {
      toast.error("Veuillez noter le service et le chauffeur.");
      return;
    }
    if (hasImprovement === null) {
      toast.error("Indiquez s'il y a quelque chose à améliorer.");
      return;
    }
    if (hasImprovement && !improvementType) {
      toast.error("Sélectionnez ce qui pourrait être amélioré.");
      return;
    }
    if (hasImprovement && improvementType === "autre" && !improvementOther.trim()) {
      toast.error("Précisez votre suggestion dans le champ « Autre ».");
      return;
    }
    setSaving(true);
    try {
      const improvement = buildImprovementValue(hasImprovement, improvementType, improvementOther);
      await publicApi.post(`/ratings/submit/${token}`, {
        serviceScore,
        driverScore,
        comment: improvement,
      });
      setDone(true);
      toast.success("Merci pour votre avis !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EvaluerShell>
        <p className="text-white/50">Chargement...</p>
      </EvaluerShell>
    );
  }

  if (error) {
    return (
      <EvaluerShell>
        <div className="max-w-md w-full text-center rounded-2xl border border-white/10 bg-charbon p-8">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </EvaluerShell>
    );
  }

  if (done) {
    return (
      <EvaluerShell>
        <div className="max-w-md w-full text-center rounded-2xl border border-white/10 bg-charbon p-10">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white mb-2">Merci !</h1>
          <p className="text-white/50 text-sm">
            Votre avis a bien été enregistré. L'équipe YOLO Le Concierge vous remercie pour votre confiance.
          </p>
        </div>
      </EvaluerShell>
    );
  }

  return (
    <EvaluerShell>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-or-vif/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <YoloLogo variant="yellow" size="lg" centered className="mx-auto" />
          <p className="text-sm text-white/50 mt-2">Comment s'est passée votre course ?</p>
        </div>

        <div className="bg-charbon/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
          {info?.clientName && (
            <p className="text-white/70 text-sm mb-1">
              Bonjour <strong className="text-white">{info.clientName}</strong>,
            </p>
          )}
          <p className="text-white/50 text-sm mb-6">
            Aidez-nous à améliorer notre service en notant votre expérience
            {info?.driverName ? ` avec ${info.driverName}` : ""}.
            {info?.vehicleName ? ` (${info.vehicleName})` : ""}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <StarPicker
              value={serviceScore}
              onChange={setServiceScore}
              label="Qualité du service YOLO"
            />
            <StarPicker
              value={driverScore}
              onChange={setDriverScore}
              label="Comportement du chauffeur"
            />

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Y a-t-il quelque chose à améliorer ?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setHasImprovement(false);
                    setImprovementType("");
                    setImprovementOther("");
                  }}
                  className={yesNoBtnCls(hasImprovement === false, "no")}
                >
                  Non
                </button>
                <button
                  type="button"
                  onClick={() => setHasImprovement(true)}
                  className={yesNoBtnCls(hasImprovement === true, "yes")}
                >
                  Oui
                </button>
              </div>
            </div>

            {hasImprovement === true && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  À améliorer
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {IMPROVEMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setImprovementType(type.id);
                        if (type.id !== "autre") setImprovementOther("");
                      }}
                      className={choiceBtnCls(improvementType === type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {improvementType === "autre" && (
                  <textarea
                    rows={3}
                    value={improvementOther}
                    onChange={(e) => setImprovementOther(e.target.value)}
                    placeholder="Décrivez ce que nous pourrions améliorer..."
                    className="w-full mt-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-or-vif"
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
            >
              {saving ? "Envoi..." : "Envoyer mon avis"}
            </button>
          </form>
        </div>
      </div>
    </EvaluerShell>
  );
}
