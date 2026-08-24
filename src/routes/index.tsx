/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { YoloLogo } from "@/components/YoloLogo";
import vehiculesImg from "@/assets/portal-vehicules.jpg";
import comingSoonDemenagement from "@/assets/logos/coming.jpg";
import comingSoonSurMesure from "@/assets/logos/Coming_s.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YOLO Le Concierge — Conciergerie multiservices premium" },
      { name: "description", content: "Location de véhicules, déménagement assisté et services sur mesure. Une seule plateforme pour simplifier votre quotidien." },
      { property: "og:title", content: "YOLO Le Concierge" },
      { property: "og:description", content: "La conciergerie moderne en Afrique. Réservez vos services en quelques clics." },
    ],
  }),
  component: Index,
});

type ActivePortal = {
  kind: "active";
  to: "/location-vehicules";
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  cta: string;
};

type ComingSoonPortal = {
  kind: "coming-soon";
  id: string;
  image: string;
};

const comingSoonCardClass =
  "relative overflow-hidden rounded-2xl bg-black border border-border aspect-3/4 flex items-center justify-center";

function ComingSoonPortalCard({ portal }: { portal: ComingSoonPortal }) {
  return (
    <div className={comingSoonCardClass}>
      <img
        src={portal.image}
        alt=""
        width={1080}
        height={1080}
        loading="lazy"
        draggable={false}
        className="aspect-square w-full shrink-0 object-contain select-none"
      />
    </div>
  );
}

const portals: (ActivePortal | ComingSoonPortal)[] = [
  {
    kind: "active",
    to: "/location-vehicules",
    eyebrow: "01 — Mobilité",
    title: "Location de Véhicules",
    description: "Voitures, SUV, véhicules de luxe, minibus, chauffeur privé et navette aéroport.",
    image: vehiculesImg,
    cta: "Réserver un véhicule",
  },
  {
    kind: "coming-soon",
    id: "demenagement",
    image: comingSoonDemenagement,
  },
  {
    kind: "coming-soon",
    id: "sur-mesure",
    image: comingSoonSurMesure,
  },
];

const portalCardClass =
  "group relative overflow-hidden rounded-2xl bg-black border border-border aspect-3/4 flex flex-col justify-end";

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
          <YoloLogo
            variant="yellow"
            size="md"
            to="/"
          />
          <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Conciergerie disponible 24/7
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-24 md:pt-28 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Choisissez votre portail</p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[0.95] max-w-4xl mx-auto">
          Une seule plateforme,<br />
          <span className="italic text-muted-foreground">tous vos services.</span>
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((p) =>
            p.kind === "coming-soon" ? (
              <ComingSoonPortalCard key={p.id} portal={p} />
            ) : (
              <Link
                key={p.to}
                to={p.to}
                className={`${portalCardClass} p-7 transition-all hover:-translate-y-1 hover:shadow-2xl`}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  width={1280}
                  height={896}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />
                <div className="relative z-10 text-white">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold mb-3">{p.eyebrow}</p>
                  <h2 className="font-display text-3xl font-semibold mb-3">{p.title}</h2>
                  <p className="text-sm text-white/80 mb-6 leading-relaxed">{p.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium border-b border-gold/60 pb-1 group-hover:gap-3 transition-all">
                    {p.cta}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
