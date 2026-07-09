/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import carHero from "@/assets/car-hero.jpg";
import destDakar from "@/assets/dest-dakar.jpg";
import destAbidjan from "@/assets/dest-abidjan.jpg";
import destSaly from "@/assets/dest-saly.jpg";
import { vehicles as seedVehicles, formatPrice, type Vehicle } from "@/lib/vehicles";
import { listVehicles } from "@/lib/admin/store";
import { BookingModal } from "@/components/BookingModal";
import { PortalHeader } from "@/components/PortalHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClientReviewsSection } from "@/components/ClientReviewsSection";
import { contactSearch } from "@/lib/auth/redirect";
import { SectionLabel } from "@/components/portal-ui/SectionLabel";
import { PortalButton } from "@/components/portal-ui/PortalButton";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/location-vehicules")({
  head: () => ({
    meta: [
      { title: "Location de Véhicules de Luxe — YOLO Le Concierge" },
      { name: "description", content: "Ferrari, Lamborghini, Porsche, Mercedes et plus. Livrés à votre porte partout à Kinshasa." },
      { property: "og:title", content: "Location de Véhicules — YOLO Le Concierge" },
      { property: "og:description", content: "Supercars et véhicules premium, avec ou sans chauffeur, livrés où vous êtes." },
    ],
  }),
  component: LocationVehicules,
});

const destinations = [
  { name: "Gombe", image: destDakar },
  { name: "Aéroport de N'djili", image: destAbidjan },
  { name: "Ngaliema / Ma Campagne", image: destSaly },
];

const reasons = [
  { title: "Prix 100% Transparents", desc: "Pas de frais cachés. Le prix affiché est celui que vous payez." },
  { title: "Livraison à Domicile", desc: "Aéroport, hôtel, villa — nous livrons où vous êtes." },
  { title: "Carburant Premium Inclus", desc: "Chaque location inclut un plein de carburant premium." },
  { title: "Support 24/7", desc: "Une équipe disponible jour et nuit, en français et en anglais." },
  { title: "Assurance Complète", desc: "Couverture tous risques incluse. Conduisez sereinement." },
  { title: "Note 5 Étoiles", desc: "Une réputation construite sur des centaines d'avis vérifiés." },
];

const DESKTOP_PAGE_SIZE = 6;
const MOBILE_PAGE_SIZE = 4;

function FleetPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination de la flotte"
      className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-white/45">
        Page {page} sur {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Page précédente"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/3 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-or-vif/40 hover:text-or-vif disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </button>
        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 min-w-9 rounded-full px-3 text-sm transition ${
                p === page
                  ? "bg-or-vif text-black font-medium"
                  : "border border-or-vif/25 bg-or-vif/15 text-white/85 hover:border-or-vif/50 hover:bg-or-vif/25 hover:text-or-vif"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Page suivante"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/3 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-or-vif/40 hover:text-or-vif disabled:pointer-events-none disabled:opacity-30"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

function LocationVehicules() {
  const isMobile = useIsMobile();
  const pageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [prefilledVehicle, setPrefilledVehicle] = useState<string>("");
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);

  useEffect(() => {
    listVehicles().then(setVehicles);
  }, []);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const paginatedVehicles = useMemo(
    () => vehicles.slice((page - 1) * pageSize, page * pageSize),
    [vehicles, page, pageSize],
  );

  const goToPage = (next: number) => {
    const clamped = Math.max(1, Math.min(next, totalPages));
    setPage(clamped);
    document.getElementById("flotte")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openBooking = (vehicleId?: string) => {
    setPrefilledVehicle(vehicleId ?? "");
    setBookingOpen(true);
  };

  return (
    <main className="min-h-screen font-sans antialiased" data-yolo-portal data-yolo-portal-vehicules>
      <PortalHeader portalId="vehicules" />
      <section className="relative min-h-[88vh] flex flex-col overflow-hidden bg-charbon text-white">
        <img
          src={carHero}
          alt="Supercar de luxe à Kinshasa"
          className="yolo-hero-image absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-linear-to-r from-charbon/92 via-charbon/50 to-charbon/25" />
        <div className="relative z-10 mx-auto flex flex-1 w-full max-w-6xl flex-col items-center justify-end px-6 pb-16 pt-28 md:pb-24">
          <ScrollReveal className="yolo-hero-content">
            <SectionLabel>Kinshasa · Location premium</SectionLabel>
            <h1 className="max-w-2xl text-[clamp(2.4rem,5vw,3.75rem)] font-bold leading-[1.08]">
              La voiture qu&apos;il vous faut,
              <br />
              <span className="text-or-vif">là où vous êtes.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/78">
              Ferrari, Porsche, Mercedes, Range Rover — avec ou sans chauffeur, livrée à Gombe,
              Ngaliema, à l&apos;aéroport ou à votre hôtel.
            </p>
            <div className="yolo-hero-actions mt-9">
              <a href="#flotte">
                <PortalButton variant="primary">
                  Voir la flotte
                  <ArrowRight className="h-4 w-4" />
                </PortalButton>
              </a>
              <Link to="/contact" search={contactSearch("vehicules")}>
                <PortalButton variant="outline-light">Parler au concierge</PortalButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4 md:py-12">
          {[
            { n: "24/7", u: "concierge disponible" },
            { n: "0", u: "frais cachés" },
            { n: "100%", u: "assurance incluse" },
            { n: "Gombe", u: "livraison partout" },
          ].map((s, i) => (
            <ScrollReveal key={s.u} delayMs={i * 70} className="text-center md:text-left">
              <p className="font-display text-3xl font-bold text-charbon md:text-4xl">{s.n}</p>
              <p className="mt-1 text-sm text-(--yolo-muted)">{s.u}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="flotte" className="yolo-section-light py-20 md:py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="mb-12 text-center md:mb-16">
            <SectionLabel>Notre flotte</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.75rem)] font-bold text-charbon">
              Supercars &amp; berlines en vedette
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedVehicles.map((v, idx) => (
              <ScrollReveal key={v.id} delayMs={idx * 70}>
                <article className="yolo-portal-card group overflow-hidden bg-white border border-black/8">
                  <Link to="/location-vehicules/$vehicleId" params={{ vehicleId: v.id }} className="block">
                    <div className="relative aspect-5/4 overflow-hidden bg-charbon/5">
                      <img
                        src={v.image}
                        alt={`${v.brand} ${v.name}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 flex gap-2">
                        <span className="rounded-sm bg-charbon/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-or-vif">
                          {v.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link to="/location-vehicules/$vehicleId" params={{ vehicleId: v.id }}>
                      <h3 className="font-display text-xl font-semibold text-charbon hover:text-or-bronze transition">
                        {v.brand} {v.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-(--yolo-muted)">
                      {v.specs.seats} places 
                    </p>
                    <p className="mt-3 font-display text-2xl font-bold text-charbon">
                      $ {formatPrice(v.pricePerDay)}
                      <span className="text-sm font-normal text-(--yolo-muted)"> / jour</span>
                    </p>
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openBooking(v.id)}
                        className="flex-1 bg-or-vif py-2.5 text-sm font-semibold text-charbon hover:bg-charbon hover:text-white transition"
                      >
                        Réserver
                      </button>
                      <Link
                        to="/location-vehicules/$vehicleId"
                        params={{ vehicleId: v.id }}
                        className="inline-flex items-center justify-center border border-charbon/15 px-4 py-2.5 text-sm font-medium text-charbon hover:bg-charbon hover:text-white transition"
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <FleetPagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>

      <section id="destinations" className="bg-charbon py-20 md:py-28 px-6 text-white">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="mb-12 text-center md:mb-16">
            <SectionLabel>Kinshasa</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.75rem)] font-bold">Destinations populaires</h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((d, i) => (
              <ScrollReveal key={d.name} delayMs={i * 80}>
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="relative aspect-3/4 w-full overflow-hidden group text-left"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charbon via-charbon/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-vif mb-2">
                      Location premium
                    </p>
                    <p className="font-display text-3xl font-semibold">{d.name}</p>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="apropos" className="yolo-section-light py-20 md:py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="mb-12 text-center max-w-2xl mx-auto md:mb-16">
            <SectionLabel>Pourquoi YOLO</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.75rem)] font-bold text-charbon mb-4">
              Une conciergerie automobile de confiance
            </h2>
            <p className="text-(--yolo-muted) text-[17px] leading-relaxed">
              Prix transparents, livraison à domicile et support multilingue 24/7.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((r, i) => (
              <ScrollReveal key={r.title} delayMs={i * 70}>
                <div className="yolo-portal-card bg-white border border-black/8 p-8 h-full">
                  <div className="w-10 h-10 bg-or-vif/15 flex items-center justify-center mb-5 text-or-bronze">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-charbon mb-2">{r.title}</h3>
                  <p className="text-sm text-(--yolo-muted) leading-relaxed">{r.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charbon py-20 md:py-28 px-6 text-white">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(1.85rem,3vw,2.75rem)] font-bold mb-4">
            Prêt à prendre le volant ?
          </h2>
          <p className="text-white/70 text-[17px] mb-10 max-w-xl mx-auto leading-relaxed">
            Explorez notre collection ou parlez avec notre concierge pour trouver la voiture idéale.
          </p>
          <PortalButton variant="primary" onClick={() => openBooking()}>
            Réserver maintenant
            <ArrowRight className="h-4 w-4" />
          </PortalButton>
        </ScrollReveal>
      </section>

      <ClientReviewsSection />

      <SiteFooter portalId="vehicules" />

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} initialVehicle={prefilledVehicle} />}
    </main>
  );
}
