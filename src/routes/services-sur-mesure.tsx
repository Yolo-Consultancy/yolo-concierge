import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import servicesImg from "@/assets/portal-services.jpg";

export const Route = createFileRoute("/services-sur-mesure")({
  head: () => ({
    meta: [
      { title: "Services Sur Mesure — YOLO Le Concierge" },
      { name: "description", content: "Événementiel, voyages, assistance professionnelle. Un concierge dédié à vos besoins spécifiques." },
      { property: "og:title", content: "Services Sur Mesure — YOLO" },
      { property: "og:description", content: "Composez votre demande, un concierge s'en occupe." },
    ],
  }),
  component: SurMesure,
});

const categories = [
  { title: "Assistance professionnelle", items: ["Organisation de réunions", "Réservation de salles", "Gestion logistique"] },
  { title: "Événementiel", items: ["Mariages", "Anniversaires", "Séminaires", "Réceptions"] },
  { title: "Voyage & Tourisme", items: ["Réservation d'hôtels", "Billets d'avion", "Organisation de séjours"] },
];

function SurMesure() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <SiteHeader />
        <img src={servicesImg} alt="Conciergerie" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-16 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Portail 03</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-3xl">Services Sur Mesure</h1>
          <p className="mt-4 max-w-xl text-white/80">Un concierge dédié à toutes vos demandes, du quotidien à l'exceptionnel.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl mb-8">Nos univers de service</h2>
          <div className="space-y-5">
            {categories.map((c) => (
              <div key={c.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-xl mb-3">{c.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {c.items.map((i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{i}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 self-start sticky top-6">
          <h2 className="font-display text-3xl mb-2">Formulaire personnalisé</h2>
          <p className="text-primary-foreground/70 text-sm mb-6">Décrivez votre besoin, nous revenons vers vous sous 2h.</p>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-gold flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold-foreground"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-display text-xl">Demande envoyée !</p>
              <p className="text-sm text-primary-foreground/70 mt-2">Votre concierge dédié vous contactera très vite.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <input required placeholder="Votre nom" className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold" />
              <input required type="email" placeholder="Email" className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold" />
              <input required placeholder="Téléphone" className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold" />
              <select required className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-gold">
                <option value="" className="bg-primary">Type de service</option>
                {categories.map((c) => <option key={c.title} value={c.title} className="bg-primary">{c.title}</option>)}
              </select>
              <textarea required rows={4} placeholder="Décrivez votre besoin..." className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold" />
              <button type="submit" className="w-full bg-gold text-gold-foreground py-3 rounded-md font-medium hover:opacity-90 transition">Envoyer la demande</button>
            </form>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-12">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
      </div>
    </main>
  );
}
