/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ContactModal } from "@/components/ContactModal";
import demenagementImg from "@/assets/portal-demenagement.jpg";

export const Route = createFileRoute("/demenagement")({
  head: () => ({
    meta: [
      { title: "Déménagement Assisté — YOLO Le Concierge" },
      { name: "description", content: "Solution complète de déménagement : emballage, transport, installation, nettoyage et organisation de votre nouveau logement." },
      { property: "og:title", content: "Déménagement Assisté — YOLO" },
      { property: "og:description", content: "Un déménagement clé en main, en toute sérénité." },
    ],
  }),
  component: Demenagement,
});

const services = [
  { title: "Préparation", items: ["Fourniture de cartons", "Emballage des biens", "Protection des objets fragiles"] },
  { title: "Transport", items: ["Camions de différentes capacités", "Chargement & déchargement", "Assurance des biens"] },
  { title: "Installation", items: ["Montage des meubles", "Installation des équipements", "Mise en place des objets"] },
  { title: "Nettoyage", items: ["Nettoyage avant départ", "Nettoyage après déménagement", "Finition impeccable"] },
  { title: "Organisation", items: ["Rangement", "Aménagement des espaces", "Décoration de base"] },
];

function Demenagement() {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-120 overflow-hidden">
        <SiteHeader />
        <img src={demenagementImg} alt="Déménagement" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-16 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Portail 02</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-3xl">Déménagement Assisté</h1>
          <p className="mt-4 max-w-xl text-white/80">De la première caisse au dernier meuble installé, on s'occupe de tout.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-7">
              <h3 className="font-display text-2xl mb-4">{s.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-gold">—</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-primary text-primary-foreground p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Demandez votre devis personnalisé</h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">
            Évaluation du volume, réservation des équipes et suivi de l'intervention.
          </p>
          <button
            onClick={() => setContactOpen(true)}
            className="inline-flex items-center gap-2 bg-gold text-gold-foreground px-7 py-3 rounded-md font-medium hover:opacity-90 transition cursor-pointer"
          >
            Obtenir un devis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>

        <Link to="/" className="mt-12 inline-flex text-sm text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
      </section>

      {contactOpen && (
        <ContactModal
          onClose={() => setContactOpen(false)}
          initialSubject="Devis Déménagement"
        />
      )}
    </main>
  );
}
