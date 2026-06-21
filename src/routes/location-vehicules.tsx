/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import carHero from "@/assets/car-hero.jpg";
import destDakar from "@/assets/dest-dakar.jpg";
import destAbidjan from "@/assets/dest-abidjan.jpg";
import destSaly from "@/assets/dest-saly.jpg";
import { vehicles as seedVehicles, formatPrice, type Vehicle } from "@/lib/vehicles";
import { listVehicles } from "@/lib/admin/store";
import { BookingModal } from "@/components/BookingModal";
import { PortalHeader } from "@/components/PortalHeader";
import { PortalHomeLink } from "@/components/PortalHomeLink";
import { ClientReviewsSection } from "@/components/ClientReviewsSection";
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
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-or-vif/40 hover:text-or-vif disabled:pointer-events-none disabled:opacity-30"
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
                  : "border border-white/10 text-white/70 hover:border-or-vif/40 hover:text-or-vif"
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
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-or-vif/40 hover:text-or-vif disabled:pointer-events-none disabled:opacity-30"
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
    <div className="bg-charbon text-white min-h-screen font-sans">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <PortalHeader portalId="vehicules" />
        <img src={carHero} alt="Supercar de luxe" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-white/70 mb-8">YOLO Le Concierge</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-normal leading-[1.05]">
            Location de Supercars<br />
            <span className="italic">à Kinshasa</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            Ferrari, Lamborghini, Porsche, Mercedes et plus, livrées à votre porte
            partout à Kinshasa et dans ses quartiers premium.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#flotte" className="inline-flex items-center gap-2 bg-or-vif text-black px-8 py-4 rounded-full text-sm font-medium hover:bg-white transition">
              Découvrir notre flotte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <Link
              to="/contact"
              search={{ portal: "vehicules" }}
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-white/10 transition"
            >
              Parler au concierge
            </Link>
          </div>
        </div>
      </section>

      <section id="flotte" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-or-vif mb-4">Sélection</p>
            <h2 className="font-display text-4xl md:text-6xl">Supercars en Vedette</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedVehicles.map((v, idx) => (
              <article
                key={v.id}
                style={{ animationDelay: `${idx * 80}ms` }}
                className="group vehicle-card animate-vehicle-in rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#151515_0%,#090909_100%)] shadow-[0_22px_60px_-22px_rgba(237,179,43,0.28)] overflow-hidden hover:border-or-vif/60 hover:vehicle-card-hover"
              >
                <Link to="/location-vehicules/$vehicleId" params={{ vehicleId: v.id }} className="block p-3 pb-0">
                  <div className="relative aspect-5/4 overflow-hidden rounded-[26px] bg-black">
                    <img
                      src={v.image}
                      alt={`${v.brand} ${v.name}`}
                      width={1280}
                      height={896}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-1200 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/15 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 -left-1/2 h-full w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shine_1.1s_ease-out]" />
                    </div>
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="rounded-full bg-black/65 px-3 py-1 text-[10px] uppercase tracking-[0.30em] text-or-vif backdrop-blur">{v.category}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.30em] text-white/80 backdrop-blur">{v.year}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">À partir de</p>
                        <p className="font-display text-2xl text-white">$ {formatPrice(v.pricePerDay)} <span className="text-xs text-white/70">/jour</span></p>
                      </div>
                      <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-or-vif backdrop-blur">Disponible</span>
                    </div>
                  </div>
                </Link>
                <div className="p-6 pt-5">
                  <Link to="/location-vehicules/$vehicleId" params={{ vehicleId: v.id }} className="block">
                    <h3 className="font-display text-2xl leading-tight text-or-vif hover:text-white transition">
                      {v.brand} <span className="text-or-vif">{v.name}</span>
                    </h3>
                  </Link>
                  
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1">{v.specs.hp} HP</span>
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1">{v.specs.seats} places</span>
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1">{v.specs.transmission}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
                    <button
                      onClick={() => openBooking(v.id)}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-or-vif px-4 py-2.5 text-xs uppercase tracking-[0.25em] text-black transition hover:bg-white"
                    >
                      Réserver
                    </button>
                    <Link
                      to="/location-vehicules/$vehicleId"
                      params={{ vehicleId: v.id }}
                      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs uppercase tracking-[0.25em] text-or-vif transition hover:bg-white/10 hover:text-white"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <FleetPagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>

      <section id="destinations" className="py-24 px-6 bg-black">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-or-vif mb-4">Kinshasa</p>
            <h2 className="font-display text-4xl md:text-6xl">Destinations Populaires</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((d) => (
              <button key={d.name} onClick={() => openBooking()} className="relative aspect-3/4 rounded-2xl overflow-hidden group">
                <img src={d.image} alt={d.name} width={960} height={1280} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-7 text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-or-vif mb-2">Location Premium</p>
                  <p className="font-display text-3xl">{d.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="pourquoi" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl mb-6">Pourquoi Choisir YOLO ?</h2>
            <p className="text-white/70 text-lg">
              La conciergerie de luxe automobile avec des prix transparents,
              livraison à domicile et un support multilingue 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {reasons.map((r) => (
              <div key={r.title} className="bg-charbon p-8">
                <div className="w-10 h-10 rounded-full bg-or-vif/10 flex items-center justify-center mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="font-display text-xl mb-2">{r.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6">Prêt à Conduire Votre Voiture de Rêve ?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Explorez notre collection ou parlez avec notre concierge pour trouver la supercar parfaite.
          </p>
          <button onClick={() => openBooking()} className="inline-flex items-center gap-2 bg-or-vif text-black px-10 py-4 rounded-full text-sm font-medium hover:bg-white transition">
            Réserver maintenant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <ClientReviewsSection />

      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-white/40 uppercase tracking-widest">
        © {new Date().getFullYear()} YOLO Le Concierge ·{" "}
        <PortalHomeLink variant="footer" className="inline-flex hover:text-white" />
      </footer>

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} initialVehicle={prefilledVehicle} />}
    </div>
  );
}
