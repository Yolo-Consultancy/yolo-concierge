/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/paiement/succes")({
  head: () => ({
    meta: [
      { title: "Paiement confirmé — YOLO" },
      { name: "description", content: "Votre paiement a été confirmé." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    booking: typeof s.booking === "string" ? s.booking : "",
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { booking } = useSearch({ from: "/paiement/succes" });
  return (
    <main className="min-h-screen bg-charbon text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#111] border border-white/10 rounded-2xl p-10 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-3xl">
          ✓
        </div>
        <h1 className="text-3xl font-bold mb-3">Paiement confirmé</h1>
        <p className="text-white/60 mb-2">
          Merci ! Votre réservation a bien été enregistrée et l'administrateur a
          été notifié.
        </p>
        {booking && (
          <p className="text-xs text-white/40 mb-1">
            Réservation : <span className="text-sky-300">#{booking.toUpperCase()}</span>
          </p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90"
          >
            Retour à l'accueil
          </Link>
          <Link
            to="/location-vehicules"
            className="px-5 py-2.5 rounded-lg border border-white/15 text-sm font-semibold hover:bg-white/5"
          >
            Voir d'autres véhicules
          </Link>
        </div>
      </div>
    </main>
  );
}
