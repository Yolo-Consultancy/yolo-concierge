/* eslint-disable prettier/prettier */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { SectionLabel } from "@/components/portal-ui/SectionLabel";
import { PortalButton } from "@/components/portal-ui/PortalButton";
import { useState } from "react";
import { getVehicleById } from "@/lib/admin/store";
import { formatPrice, type Vehicle } from "@/lib/vehicles";
import { BookingModal } from "@/components/BookingModal";

export const Route = createFileRoute("/location-vehicules_/$vehicleId")({
  loader: async ({ params }): Promise<{ vehicle: Vehicle }> => {
    const vehicle = await getVehicleById(params.vehicleId);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  head: ({ loaderData }) => {
    const v = loaderData?.vehicle;
    return {
      meta: v
        ? [
            { title: `${v.brand} ${v.name} — YOLO Le Concierge` },
            { name: "description", content: v.description || `Location ${v.brand} ${v.name} — YOLO Le Concierge` },
            { property: "og:title", content: `${v.brand} ${v.name}` },
            { property: "og:description", content: v.description || `Location ${v.brand} ${v.name} — YOLO Le Concierge` },
            { property: "og:image", content: v.image },
            { property: "twitter:image", content: v.image },
          ]
        : [{ title: "Véhicule introuvable" }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-(--yolo-cream) text-charbon">
      <div className="text-center">
        <p className="font-display text-3xl font-bold mb-4">Véhicule introuvable</p>
        <Link to="/location-vehicules" className="text-or-bronze hover:text-charbon">
          ← Retour à la flotte
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen flex items-center justify-center bg-(--yolo-cream) text-charbon">
      <div className="text-center">
        <p className="font-display text-3xl font-bold mb-4">Une erreur est survenue</p>
        <button type="button" onClick={() => reset()} className="text-or-bronze hover:text-charbon">
          Réessayer
        </button>
      </div>
    </div>
  ),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { vehicle } = Route.useLoaderData();
  const [activeImg, setActiveImg] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <main className="min-h-screen font-sans antialiased" data-yolo-portal data-yolo-portal-vehicules>
      <PortalHeader portalId="vehicules" />
      <section className="relative bg-charbon text-white pb-8 pt-28">
        <div className="mx-auto max-w-6xl px-6">
          <Link
            to="/location-vehicules"
            className="inline-flex items-center gap-2 text-white/65 hover:text-white text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la flotte
          </Link>
          <ScrollReveal className="yolo-hero-content">
            <SectionLabel>{vehicle.category} · {vehicle.year}</SectionLabel>
            <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-tight">
              {vehicle.brand} {vehicle.name}
            </h1>
            <p className="mt-2 text-sm text-white/65 flex items-center justify-center gap-1.5">
              <MapPin className="h-4 w-4 text-or-vif" />
              {vehicle.location}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="yolo-section-light py-10 md:py-14 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-10">
            <ScrollReveal>
              <div className="relative aspect-16/10 overflow-hidden bg-charbon/5 mb-4 border border-black/8">
                <img
                  src={vehicle.gallery[activeImg]}
                  alt={`${vehicle.brand} ${vehicle.name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i - 1 + vehicle.gallery.length) % vehicle.gallery.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-charbon/75 flex items-center justify-center hover:bg-charbon text-white"
                  aria-label="Précédent"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i + 1) % vehicle.gallery.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-charbon/75 flex items-center justify-center hover:bg-charbon text-white"
                  aria-label="Suivant"
                >
                  ›
                </button>
                <div className="absolute top-4 left-4 bg-charbon/75 px-3 py-1 text-xs text-white">
                  {activeImg + 1} / {vehicle.gallery.length}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {vehicle.gallery.map((src: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`aspect-4/3 overflow-hidden border-2 ${
                      i === activeImg ? "border-or-vif" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={100}>
              <aside className="yolo-portal-card bg-white border border-black/8 p-6 h-fit sticky top-6">
                <p className="font-display text-4xl font-bold text-charbon">
                  $ {formatPrice(vehicle.pricePerDay)}
                  <span className="text-base text-(--yolo-muted) font-sans font-normal"> / jour</span>
                </p>
                <p className="text-xs text-(--yolo-muted) mt-1">À partir de</p>

                <div className="mt-5 flex items-center justify-between text-sm border-b border-black/8 pb-5">
                  <span className="text-(--yolo-muted)">Catégorie</span>
                  <span className="bg-(--yolo-cream) px-3 py-1 text-xs font-medium text-charbon border border-black/6">
                    {vehicle.category}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 py-2">
                  <SpecMini label="Passagers" value={String(vehicle.specs.seats)} />
                  <SpecMini label="Carburant" value="Exclu" />
                  <SpecMini label="Chauffeur" value="Inclus" />
                </div>

                <PortalButton variant="primary" onClick={() => setBookingOpen(true)} className="mt-6 w-full">
                  Réserver maintenant
                </PortalButton>
              </aside>
            </ScrollReveal>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <h2 className="font-display text-2xl font-bold text-charbon mb-4">Description</h2>
              <p className="text-(--yolo-muted) leading-relaxed text-[17px]">
                {vehicle.description || "Aucune description disponible pour ce véhicule."}
              </p>
            </ScrollReveal>
            {vehicle.conditions.deposit?.trim() && (
              <ScrollReveal delayMs={80}>
                <h2 className="font-display text-2xl font-bold text-charbon mb-4">Conditions de location</h2>
                <ConditionRow label="Caution" value={vehicle.conditions.deposit} />
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      <SiteFooter portalId="vehicules" />

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} initialVehicle={vehicle.id} />}
    </main>
  );
}

function SpecMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-widest text-(--yolo-muted)">{label}</p>
      <p className="text-sm mt-1 font-medium text-charbon">{value}</p>
    </div>
  );
}

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="yolo-portal-card bg-white border border-black/8 p-4 max-w-xs">
      <dt className="text-[10px] uppercase tracking-widest text-(--yolo-muted) mb-1">{label}</dt>
      <dd className="font-display text-lg font-semibold text-charbon">{value}</dd>
    </div>
  );
}

export type { Vehicle };
