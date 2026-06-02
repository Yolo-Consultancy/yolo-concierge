import { createFileRoute, Link } from "@tanstack/react-router";
import vehiculesImg from "@/assets/portal-vehicules.jpg";
import demenagementImg from "@/assets/portal-demenagement.jpg";
import servicesImg from "@/assets/portal-services.jpg";

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

const portals = [
  {
    to: "/location-vehicules" as const,
    eyebrow: "01 — Mobilité",
    title: "Location de Véhicules",
    description: "Voitures, SUV, véhicules de luxe, minibus, chauffeur privé et navette aéroport.",
    image: vehiculesImg,
    cta: "Réserver un véhicule",
  },
  {
    to: "/demenagement" as const,
    eyebrow: "02 — Logistique",
    title: "Déménagement Assisté",
    description: "Emballage, transport, installation, nettoyage. Un déménagement clé en main.",
    image: demenagementImg,
    cta: "Demander un devis",
  },
  {
    to: "/services-sur-mesure" as const,
    eyebrow: "03 — Conciergerie",
    title: "Services Sur Mesure",
    description: "Événementiel, voyage, assistance professionnelle. Un concierge dédié à vos besoins.",
    image: servicesImg,
    cta: "Composer ma demande",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top brand strip */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold tracking-tight">
              YOLO<span className="text-gold">.</span>
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Le Concierge
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Conciergerie disponible 24/7
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Choisissez votre portail</p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[0.95] max-w-4xl">
          Une seule plateforme,<br />
          <span className="italic text-muted-foreground">tous vos services.</span>
        </h1>
      </section>

      {/* Portal blocks */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border aspect-[3/4] flex flex-col justify-end p-7 transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={p.image}
                alt={p.title}
                width={1280}
                height={896}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
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
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} YOLO Le Concierge — Tous droits réservés.</p>
          <p className="uppercase tracking-widest">Premium · Sécurisé · Personnalisé</p>
        </div>
      </footer>
    </main>
  );
}
