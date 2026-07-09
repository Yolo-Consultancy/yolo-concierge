/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Phone } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DemenagementDevisModal } from "@/components/DemenagementDevisModal";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { contactSearch } from "@/lib/auth/redirect";
import demenagementHero from "@/assets/demenagement/service-van.png";
import serviceVan from "@/assets/demenagement/service-van.png";
import serviceInterieur from "@/assets/demenagement/service-interieur.png";
import serviceEmballage from "@/assets/demenagement/service-emballage.png";
import serviceEquipe from "@/assets/demenagement/service-equipe.png";

export const Route = createFileRoute("/demenagement")({
  head: () => ({
    meta: [
      { title: "Déménagement à Kinshasa — YOLO Le Concierge" },
      {
        name: "description",
        content:
          "Emballage, transport et installation dans les 24 communes de Kinshasa. Devis gratuit, équipe dédiée, réponse sous 24 h.",
      },
      { property: "og:title", content: "Déménagement à Kinshasa — YOLO" },
      {
        property: "og:description",
        content: "Un déménagement clé en main avec une équipe qui connaît chaque quartier de Kinshasa.",
      },
    ],
  }),
  component: Demenagement,
});

const realisations = [
  {
    title: "Chargement & livraison",
    description: "Camion adapté au volume, équipe sur place à l'heure convenue.",
    image: serviceVan,
  },
  {
    title: "Manutention soignée",
    description: "Meubles démontés, portés et remontés sans précipitation.",
    image: serviceInterieur,
  },
  {
    title: "Protection des biens",
    description: "Cartons, couvertures et film — surtout pour le fragile.",
    image: serviceEmballage,
  },
  {
    title: "Équipe de terrain",
    description: "Les mêmes visages du devis jusqu'au dernier carton.",
    image: serviceEquipe,
  },
];

const prestations = [
  {
    title: "Avant le jour J",
    items: ["Cartons fournis ou apportés par vos soins", "Emballage sur demande", "Inventaire des pièces fragiles"],
  },
  {
    title: "Le jour du déménagement",
    items: ["Chargement méthodique", "Transport intra-Kinshasa", "Gestion des étages et ascenseurs"],
  },
  {
    title: "À l'arrivée",
    items: ["Déchargement et placement", "Remontage des meubles", "Reprise des déchets d'emballage"],
  },
];

const etapes = [
  {
    num: "01",
    title: "Vous décrivez le déménagement",
    text: "Commune, quartier, étages, nombre de pièces — le formulaire prend quelques minutes.",
  },
  {
    num: "02",
    title: "On vous rappelle sous 24 h",
    text: "Un conseiller affine le devis et répond à vos questions pratiques.",
  },
  {
    num: "03",
    title: "Date confirmée, équipe assignée",
    text: "Vous savez qui vient, à quelle heure, avec quel matériel.",
  },
  {
    num: "04",
    title: "Installation chez vous",
    text: "Du camion jusqu'à la dernière armoire, on reste jusqu'au bout.",
  },
];

const engagements = [
  "Couverture des 24 communes de Kinshasa",
  "Devis détaillé avant engagement",
  "Matériel de protection inclus",
  "Interlocuteur unique du devis à la livraison",
];

function DmBtn({
  children,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline-light" | "dark";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-or-vif text-charbon hover:bg-charbon hover:text-white border border-or-vif hover:border-charbon",
    "outline-light":
      "border-2 border-white/90 text-white hover:bg-white hover:text-charbon",
    dark: "bg-charbon text-white hover:bg-or-vif hover:text-charbon border border-charbon hover:border-or-vif",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold tracking-wide transition-all duration-300 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-or-bronze mb-3">
      {children}
    </p>
  );
}

function Demenagement() {
  const [devisOpen, setDevisOpen] = useState(false);
  const openDevis = () => setDevisOpen(true);

  return (
    <main className="min-h-screen font-sans antialiased" data-yolo-portal data-demenagement-site>
      <DemenagementDevisModal open={devisOpen} onClose={() => setDevisOpen(false)} />
      <PortalHeader portalId="demenagement" onAction={(a) => a === "devis" && openDevis()} />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col overflow-hidden bg-charbon">
        <div className="absolute inset-0">
          <img
            src={demenagementHero}
            alt="Équipe YOLO en intervention déménagement à Kinshasa"
            className="dm-hero-image h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-charbon/92 via-charbon/55 to-charbon/20" />
        </div>

        <div className="relative z-10 mx-auto flex flex-1 w-full max-w-6xl flex-col items-center justify-end px-6 pb-16 pt-32 md:pb-24">
          <ScrollReveal className="yolo-hero-content">
            <SectionLabel>Kinshasa · Service sur mesure</SectionLabel>
            <h1 className="max-w-2xl text-[clamp(2.4rem,5vw,3.65rem)] font-bold leading-[1.08] text-white">
              Votre déménagement,
              <br />
              <span className="text-or-vif">sans mauvaise surprise.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/78">
              Emballage, transport et installation — avec une équipe qui connaît les rues, les étages
              sans ascenseur et les 24 communes de la ville.
            </p>
            <div className="yolo-hero-actions mt-9">
              <DmBtn onClick={openDevis}>
                Demander un devis
                <ArrowRight className="h-4 w-4" />
              </DmBtn>
              <a
                href="#realisations"
                className="inline-flex items-center gap-2 px-2 py-3.5 text-[15px] font-medium text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                Voir nos interventions
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bandeau confiance */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4 md:gap-8 md:py-12">
          {[
            { n: "24", u: "communes" },
            { n: "24 h", u: "premier retour" },
            { n: "4", u: "étapes claires" },
            { n: "1", u: "interlocuteur dédié" },
          ].map((s, i) => (
            <ScrollReveal key={s.u} delayMs={i * 80} className="text-center md:text-left">
              <p className="font-display text-3xl font-bold text-charbon md:text-4xl">{s.n}</p>
              <p className="mt-1 text-sm text-(--dm-muted)">{s.u}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Intro — À propos */}
      <section id="apropos" className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
          <ScrollReveal>
            <SectionLabel>Qui sommes-nous</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.5rem)] font-bold leading-tight text-charbon">
              Nous sommes une équipe de déménageurs professionnels à Kinshasa. 
            </h2>
            <p className="mt-5 text-[17px] leading-[1.75] text-(--dm-muted)">
              Notre mission : rendre votre déménagement aussi simple et fluide que possible. 
              Nous prenons soin de vos biens, respectons vos délais et vous offrons un service personnalisé du début à la fin. 
            </p>
            <ul className="mt-8 space-y-3">
              {engagements.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-charbon/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-or-vif" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delayMs={120}>
            <div className="relative aspect-4/5 overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]">
              <img
                src={serviceInterieur}
                alt="Déménageurs YOLO à l'intérieur d'un logement"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-charbon/80 to-transparent p-6 pt-16">
                <p className="text-sm font-medium text-white/90">
                  « Chaque déménagement a ses contraintes. On les note, on s'y prépare. »
                </p>
                <p className="mt-2 text-xs text-white/55">— Équipe logistique YOLO</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Réalisations / galerie */}
      <section id="realisations" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal className="mb-12 max-w-xl md:mb-16">
            <SectionLabel>Nos interventions</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.5rem)] font-bold text-charbon">
              Ce qu'on fait concrètement sur le terrain
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-(--dm-muted)">
              Pas de stock photos génériques : voici le type de prestation que nos équipes réalisent
              chaque semaine à Kinshasa.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {realisations.map((item, i) => (
              <ScrollReveal key={item.title} delayMs={i * 90}>
                <article className="dm-service-card group overflow-hidden bg-(--dm-cream)">
                  <div className="aspect-16/10 overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="border-t border-black/5 px-6 py-5">
                    <h3 className="font-display text-xl font-semibold text-charbon">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-(--dm-muted)">
                      {item.description}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Prestations */}
      <section id="services" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal className="mb-12 text-center md:mb-16">
            <SectionLabel>Prestations</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.5rem)] font-bold text-charbon">
              Du cartons vides au canapé en place
            </h2>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {prestations.map((block, i) => (
              <ScrollReveal key={block.title} delayMs={i * 100}>
                <div className="h-full border border-black/8 bg-white p-8 shadow-sm">
                  <h3 className="font-display text-lg font-bold text-charbon">{block.title}</h3>
                  <ul className="mt-5 space-y-3 border-t border-black/6 pt-5">
                    {block.items.map((line) => (
                      <li key={line} className="flex gap-2.5 text-[15px] text-(--dm-muted)">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-or-vif" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section id="processus" className="bg-charbon py-20 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal className="mb-14 md:mb-16">
            <SectionLabel>Comment ça se passe</SectionLabel>
            <h2 className="max-w-lg text-[clamp(1.85rem,3vw,2.5rem)] font-bold leading-tight">
              Quatre étapes. Pas de jargon.
            </h2>
          </ScrollReveal>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {etapes.map((step, i) => (
              <ScrollReveal key={step.num} delayMs={i * 90}>
                <div className="border-t-2 border-or-vif pt-5">
                  <p className="font-display text-4xl font-bold text-or-vif/35">{step.num}</p>
                  <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/62">{step.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative overflow-hidden bg-white px-8 py-14 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] md:px-16 md:py-16">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-or-vif/10" />
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.35rem)] font-bold text-charbon">
                Prêt à planifier votre déménagement ?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-(--dm-muted)">
                Le formulaire reprend vos adresses de départ et d'arrivée, les étages, le nombre de
                pièces. On revient vers vous rapidement.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <DmBtn onClick={openDevis} variant="dark">
                  Demande de devis gratuit
                  <ArrowRight className="h-4 w-4" />
                </DmBtn>
                <Link
                  to="/contact"
                  search={contactSearch("demenagement")}
                  className="inline-flex items-center gap-2 text-[15px] font-medium text-charbon/75 hover:text-charbon"
                >
                  <Phone className="h-4 w-4" />
                  Nous appeler
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter portalId="demenagement" />
    </main>
  );
}
