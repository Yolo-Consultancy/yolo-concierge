/* eslint-disable prettier/prettier */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { PortalHomeLink } from "@/components/PortalHomeLink";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { SectionLabel } from "@/components/portal-ui/SectionLabel";
import { PortalButton } from "@/components/portal-ui/PortalButton";
import { useState } from "react";
import { getVehicleById } from "@/lib/admin/store";
import { formatPrice, type Vehicle } from "@/lib/vehicles";
import { BookingModal } from "@/components/BookingModal";
import { ContactModal } from "@/components/ContactModal";

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
            { name: "description", content: v.description },
            { property: "og:title", content: `${v.brand} ${v.name}` },
            { property: "og:description", content: v.description },
            { property: "og:image", content: v.image },
            { property: "twitter:image", content: v.image },
          ]
        : [{ title: "Véhicule introuvable" }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--yolo-cream)] text-charbon">
      <div className="text-center">
        <p className="font-display text-3xl font-bold mb-4">Véhicule introuvable</p>
        <Link to="/location-vehicules" className="text-or-bronze hover:text-charbon">
          ← Retour à la flotte
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--yolo-cream)] text-charbon">
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
  const [contactOpen, setContactOpen] = useState(false);
  const [tab, setTab] = useState<"performance" | "drivetrain" | "equipment">("performance");

  return (
    <main className="min-h-screen font-sans antialiased" data-yolo-portal data-yolo-portal-vehicules>
      <section className="relative bg-charbon text-white pb-8 pt-28">
        <PortalHeader portalId="vehicules" />
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
                  <span className="text-base text-[var(--yolo-muted)] font-sans font-normal"> / jour</span>
                </p>
                <p className="text-xs text-[var(--yolo-muted)] mt-1">À partir de</p>

                <div className="mt-5 flex items-center justify-between text-sm border-b border-black/8 pb-5">
                  <span className="text-[var(--yolo-muted)]">Catégorie</span>
                  <span className="bg-[var(--yolo-cream)] px-3 py-1 text-xs font-medium text-charbon border border-black/6">
                    {vehicle.category}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 py-2">
                  <SpecMini label="Passagers" value={String(vehicle.specs.seats)} />
                  <SpecMini label="Carburant" value={vehicle.specs.fuel} />
                  <SpecMini label="Boîte" value={vehicle.specs.transmission} />
                </div>

                <PortalButton variant="primary" onClick={() => setBookingOpen(true)} className="mt-6 w-full">
                  Réserver maintenant
                </PortalButton>
                <PortalButton variant="outline-dark" onClick={() => setContactOpen(true)} className="mt-3 w-full">
                  Envoyer une demande
                </PortalButton>
              </aside>
            </ScrollReveal>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <h2 className="font-display text-2xl font-bold text-charbon mb-4">Description</h2>
              <p className="text-[var(--yolo-muted)] leading-relaxed text-[17px]">{vehicle.description}</p>
            </ScrollReveal>
            <ScrollReveal delayMs={80}>
              <h2 className="font-display text-2xl font-bold text-charbon mb-4">Conditions de location</h2>
              <dl className="grid grid-cols-2 gap-4">
                <ConditionRow label="Caution" value={vehicle.conditions.deposit} />
                <ConditionRow label="Âge min. conducteur" value={vehicle.conditions.minAge} />
                <ConditionRow label="Ancienneté du permis" value={vehicle.conditions.licenseYears} />
                <ConditionRow label="Km quotidiens inclus" value={vehicle.conditions.dailyKm} />
              </dl>
            </ScrollReveal>
          </div>

          <ScrollReveal className="mt-20">
            <SectionLabel>Fiche technique</SectionLabel>
            <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-charbon mb-10">Spécifications</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <KeyStat label="Puissance" value={vehicle.keyStats.power} />
              <KeyStat label="0-100 km/h" value={vehicle.keyStats.zeroTo100} />
              <KeyStat label="Vitesse max." value={vehicle.keyStats.topSpeed} />
              <KeyStat label="Carburant" value={vehicle.keyStats.fuel} />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {([
                ["performance", "Performance"],
                ["drivetrain", "Moteur & transmission"],
                ["equipment", "Équipements"],
              ] as const).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`px-5 py-2.5 text-sm font-medium transition ${
                    tab === k
                      ? "bg-or-vif text-charbon"
                      : "border border-black/12 text-charbon hover:bg-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="yolo-portal-card bg-white border border-black/8 p-6 md:p-8">
              {tab === "performance" && (
                <dl className="grid sm:grid-cols-2 gap-6">
                  <SpecRow label="Chevaux" value={vehicle.performance.hp} />
                  <SpecRow label="Couple" value={vehicle.performance.torque} />
                  <SpecRow label="0-100 km/h" value={vehicle.performance.zeroTo100} />
                  <SpecRow label="Vitesse maximale" value={vehicle.performance.topSpeed} />
                </dl>
              )}
              {tab === "drivetrain" && (
                <dl className="grid sm:grid-cols-2 gap-6">
                  <SpecRow label="Type de carburant" value={vehicle.drivetrain.fuel} />
                  <SpecRow label="Transmission" value={vehicle.drivetrain.transmission} />
                  <SpecRow label="Boîte de vitesses" value={vehicle.drivetrain.gearbox} />
                </dl>
              )}
              {tab === "equipment" && (
                <dl className="grid sm:grid-cols-2 gap-6">
                  <SpecRow label="Nombre de places" value={vehicle.equipment.seats} />
                  <SpecRow label="Roues" value={vehicle.equipment.wheels} />
                  <SpecRow label="Freins" value={vehicle.equipment.brakes} />
                  <SpecRow label="Suspension" value={vehicle.equipment.suspension} />
                  <SpecRow label="Équipements extérieurs" value={vehicle.equipment.exterior} />
                  <SpecRow label="Équipements intérieurs" value={vehicle.equipment.interior} />
                </dl>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-black/10 py-8 px-6 text-center text-xs text-[var(--yolo-muted)] uppercase tracking-widest bg-[var(--yolo-cream)]">
        © {new Date().getFullYear()} YOLO Le Concierge ·{" "}
        <PortalHomeLink variant="footer" className="inline-flex hover:text-charbon" />
      </footer>

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} initialVehicle={vehicle.id} />}
      {contactOpen && (
        <ContactModal
          onClose={() => setContactOpen(false)}
          prefilledVehicle={`${vehicle.brand} ${vehicle.name}`}
        />
      )}
    </main>
  );
}

function SpecMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-widest text-[var(--yolo-muted)]">{label}</p>
      <p className="text-sm mt-1 font-medium text-charbon">{value}</p>
    </div>
  );
}

function KeyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="yolo-portal-card bg-white border border-black/8 p-5 text-center">
      <p className="font-display text-2xl font-bold text-or-bronze">{value}</p>
      <p className="text-xs uppercase tracking-widest text-[var(--yolo-muted)] mt-2">{label}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-black/8 pb-4">
      <dt className="text-xs uppercase tracking-widest text-[var(--yolo-muted)] mb-1">{label}</dt>
      <dd className="text-sm text-charbon font-medium">{value}</dd>
    </div>
  );
}

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="yolo-portal-card bg-white border border-black/8 p-4">
      <dt className="text-[10px] uppercase tracking-widest text-[var(--yolo-muted)] mb-1">{label}</dt>
      <dd className="font-display text-lg font-semibold text-charbon">{value}</dd>
    </div>
  );
}

export type { Vehicle };
