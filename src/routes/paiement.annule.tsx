/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/paiement/annule")({
  head: () => ({
    meta: [
      { title: "Paiement annulé — YOLO" },
      { name: "description", content: "Le paiement a été annulé." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CancelPage,
});

function CancelPage() {
  return (
    <main className="min-h-screen bg-charbon text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#111] border border-white/10 rounded-2xl p-10 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center text-3xl">
          ✕
        </div>
        <h1 className="text-3xl font-bold mb-3">Paiement annulé</h1>
        <p className="text-white/60 mb-6">
          Votre paiement n'a pas été finalisé. Vous pouvez réessayer ou choisir
          un autre véhicule. Aucun montant ne vous a été débité.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/location-vehicules"
            className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90"
          >
            Réessayer
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg border border-white/15 text-sm font-semibold hover:bg-white/5"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
