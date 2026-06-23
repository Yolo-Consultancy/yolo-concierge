/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalHeader } from "@/components/PortalHeader";
import { PortalHomeLink } from "@/components/PortalHomeLink";
import { DemenagementDevisModal } from "@/components/DemenagementDevisModal";
import demenagementHero from "@/assets/demenagement/service-van.png";
import serviceVan from "@/assets/demenagement/service-van.png";
import serviceInterieur from "@/assets/demenagement/service-interieur.png";
import serviceEmballage from "@/assets/demenagement/service-emballage.png";
import serviceEquipe from "@/assets/demenagement/service-equipe.png";

export const Route = createFileRoute("/demenagement")({
  head: () => ({
    meta: [
      { title: "Déménagement Assisté — YOLO Le Concierge" },
      { name: "description", content: "Solution complète de déménagement à Kinshasa : emballage, transport, installation. Demandez votre devis en ligne." },
      { property: "og:title", content: "Déménagement Assisté — YOLO" },
      { property: "og:description", content: "Un déménagement clé en main, en toute sérénité." },
    ],
  }),
  component: Demenagement,
});

const serviceShowcase = [
  {
    title: "Transport & camion",
    description: "Équipe professionnelle, chargement sécurisé et livraison dans toute Kinshasa.",
    image: serviceVan,
  },
  {
    title: "Manutention intérieure",
    description: "Démontage, portage et installation de vos meubles en toute sécurité.",
    image: serviceInterieur,
  },
  {
    title: "Emballage & protection",
    description: "Cartons, films bulles et couvertures pour protéger vos biens fragiles.",
    image: serviceEmballage,
  },
  {
    title: "Équipe dédiée",
    description: "Déménageurs formés, ponctuels et à l'écoute de vos contraintes.",
    image: serviceEquipe,
  },
];

const services = [
  { title: "Préparation", items: ["Fourniture de cartons", "Emballage des biens", "Protection des objets fragiles"] },
  { title: "Transport", items: ["Camions de différentes capacités", "Chargement & déchargement", "Assurance des biens"] },
  { title: "Installation", items: ["Montage des meubles", "Installation des équipements", "Mise en place des objets"] },
  { title: "Nettoyage", items: ["Nettoyage avant départ", "Nettoyage après déménagement", "Finition impeccable"] },
  { title: "Organisation", items: ["Rangement", "Aménagement des espaces", "Décoration de base"] },
];

function Demenagement() {
  const [devisOpen, setDevisOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background font-sans">
      <DemenagementDevisModal open={devisOpen} onClose={() => setDevisOpen(false)} />

      {/* Hero */}
      <section className="relative h-[65vh] min-h-120 overflow-hidden">
        <PortalHeader portalId="demenagement" />
        <img src={demenagementHero} alt="Déménagement YOLO Kinshasa" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-16 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-or-vif mb-4">Portail 02 · Kinshasa</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-3xl">Déménagement Assisté</h1>
          <p className="mt-4 max-w-xl text-white/80">
            De la première caisse au dernier meuble installé — dans les 24 communes de Kinshasa.
          </p>
          <button
            type="button"
            onClick={() => setDevisOpen(true)}
            className="mt-8 inline-flex w-fit items-center gap-2 bg-or-vif text-charbon px-8 py-4 rounded-full text-sm font-semibold hover:bg-white transition"
          >
            Demande de devis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      {/* Galerie services */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.4em] text-or-vif mb-3 text-center">Notre équipe</p>
        <h2 className="font-display text-3xl md:text-4xl text-center mb-10">Un service complet, partout à Kinshasa</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {serviceShowcase.map((s) => (
            <article key={s.title} className="group rounded-2xl overflow-hidden border border-border bg-card">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-7">
              <h3 className="font-display text-2xl mb-4">{s.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-or-vif">—</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div id="processus" className="mt-16 rounded-2xl bg-charbon text-white p-10 md:p-14 text-center border border-white/10">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Obtenez votre devis personnalisé</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Commune, quartier, étage, ascenseur, nombre de pièces — décrivez votre déménagement en quelques minutes.
            Réponse sous 24h par notre équipe logistique.
          </p>
          <button
            type="button"
            onClick={() => setDevisOpen(true)}
            className="inline-flex items-center gap-2 bg-or-vif text-charbon px-8 py-4 rounded-full text-sm font-semibold hover:bg-white transition"
          >
            Demande de devis gratuit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>

        <PortalHomeLink variant="footer" className="mt-12 inline-flex text-muted-foreground hover:text-foreground" />
      </section>
    </main>
  );
}
