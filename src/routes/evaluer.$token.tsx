/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import { publicApi } from "@/lib/api/client";
import { toast } from "sonner";

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
  const [comment, setComment] = useState("");

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
    setSaving(true);
    try {
      await publicApi.post(`/ratings/submit/${token}`, {
        serviceScore,
        driverScore,
        comment: comment.trim(),
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
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white/50">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center rounded-2xl border border-white/10 bg-[#0f0f11] p-8">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center rounded-2xl border border-white/10 bg-[#0f0f11] p-10">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white mb-2">Merci !</h1>
          <p className="text-white/50 text-sm">
            Votre avis a bien été enregistré. L'équipe YOLO Le Concierge vous remercie pour votre confiance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#7dd3fc]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <span className="font-display text-3xl font-bold text-white">
            YOLO<span className="text-[#7dd3fc]">.</span>
          </span>
          <p className="text-sm text-white/50 mt-2">Comment s'est passée votre course ?</p>
        </div>

        <div className="bg-[#0f0f11]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
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
                Commentaire (optionnel)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dites-nous ce qui vous a plu ou ce que nous pourrions améliorer..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc]"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-[#7dd3fc] text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
            >
              {saving ? "Envoi..." : "Envoyer mon avis"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
