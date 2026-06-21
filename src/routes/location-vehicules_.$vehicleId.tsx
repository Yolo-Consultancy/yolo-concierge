/* eslint-disable prettier/prettier */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { getVehicleById } from "@/lib/admin/store";
import { formatPrice, type Vehicle } from "@/lib/vehicles";
import { BookingModal } from "@/components/BookingModal";
import { ContactModal } from "@/components/ContactModal";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <p className="font-display text-3xl mb-4">Véhicule introuvable</p>
        <Link to="/location-vehicules" className="text-[#7dd3fc] hover:text-white">← Retour à la flotte</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <p className="font-display text-3xl mb-4">Une erreur est survenue</p>
        <button onClick={() => reset()} className="text-[#7dd3fc] hover:text-white">Réessayer</button>
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
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-2xl tracking-tight">
            YOLO<span className="text-[#7dd3fc]">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em] text-white/80">
            <Link to="/" className="hover:text-white">Accueil</Link>
            <Link to="/location-vehicules" className="hover:text-white">Flotte</Link>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-[#0f0f0f] text-white">
              <SheetTitle className="font-display text-2xl text-white">
                YOLO<span className="text-[#7dd3fc]">.</span>
              </SheetTitle>
              <nav className="mt-10 flex flex-col gap-3">
                <SheetClose asChild>
                  <Link to="/" className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white">
                    Accueil
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/location-vehicules" className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white">
                    Flotte
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/location-vehicules" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Retour
        </Link>

        <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-6xl">{vehicle.brand} {vehicle.name}</h1>
            <p className="mt-3 text-sm text-white/60">
              {vehicle.brand} • {vehicle.name} • {vehicle.year}
            </p>
            <p className="mt-2 text-sm text-white/60 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {vehicle.location}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5" aria-label="Favori">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            </button>
            <button className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5" aria-label="Partager">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div>
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-black mb-4">
              <img src={vehicle.gallery[activeImg]} alt={`${vehicle.brand} ${vehicle.name}`} className="absolute inset-0 h-full w-full object-cover" />
              <button
                onClick={() => setActiveImg((i) => (i - 1 + vehicle.gallery.length) % vehicle.gallery.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black"
                aria-label="Précédent"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => setActiveImg((i) => (i + 1) % vehicle.gallery.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black"
                aria-label="Suivant"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs">
                {activeImg + 1} / {vehicle.gallery.length}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {vehicle.gallery.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-4/3 rounded-lg overflow-hidden border-2 ${i === activeImg ? "border-[#7dd3fc]" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <aside className="bg-[#111] border border-white/10 rounded-2xl p-6 h-fit">
            <p className="font-display text-4xl text-[#7dd3fc]">
              $ {formatPrice(vehicle.pricePerDay)} <span className="text-base text-white/70 font-sans">/jour</span>
            </p>
            <p className="text-xs text-white/50 mt-1">À partir de</p>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-white/60">Catégorie</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs">{vehicle.category}</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
              <SpecMini label="Passagers" value={String(vehicle.specs.seats)} />
              <SpecMini label="Carburant" value={vehicle.specs.fuel} />
              <SpecMini label="Boîte" value={vehicle.specs.transmission} />
            </div>

            <button
              onClick={() => setBookingOpen(true)}
              className="mt-6 w-full bg-[#7dd3fc] text-black py-3.5 rounded-xl font-medium text-sm hover:bg-white transition cursor-pointer"
            >
              Réserver Maintenant
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="mt-3 w-full border border-white/20 py-3.5 rounded-xl text-sm hover:bg-white/5 transition cursor-pointer"
            >
              Envoyer une Demande
            </button>
          </aside>
        </div>

        <section className="mt-16 grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl mb-4">Description</h2>
            <p className="text-white/70 leading-relaxed">{vehicle.description}</p>
          </div>
          <div>
            <h2 className="font-display text-2xl mb-4">Conditions de Location</h2>
            <dl className="grid grid-cols-2 gap-4">
              <ConditionRow label="Caution" value={vehicle.conditions.deposit} />
              <ConditionRow label="Âge Min. du Conducteur" value={vehicle.conditions.minAge} />
              <ConditionRow label="Ancienneté du Permis" value={vehicle.conditions.licenseYears} />
              <ConditionRow label="Km Quotidiens Inclus" value={vehicle.conditions.dailyKm} />
            </dl>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl md:text-4xl mb-10">Spécifications</h2>

          <h3 className="font-display text-xl mb-6 text-white/80">Statistiques Clés</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 mb-12">
            <KeyStat label="Puissance" value={vehicle.keyStats.power} />
            <KeyStat label="0-100 km/h" value={vehicle.keyStats.zeroTo100} />
            <KeyStat label="Vitesse Maximale" value={vehicle.keyStats.topSpeed} />
            <KeyStat label="Type de Carburant" value={vehicle.keyStats.fuel} />
          </div>

          <h3 className="font-display text-xl mb-6 text-white/80">Détails Techniques</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {([
              ["performance", "Performance"],
              ["drivetrain", "Moteur et Transmission"],
              ["equipment", "Équipements et Options"],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-5 py-2.5 rounded-full text-sm transition ${tab === k ? "bg-[#7dd3fc] text-black" : "border border-white/20 hover:bg-white/5"}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8">
            {tab === "performance" && (
              <dl className="grid sm:grid-cols-2 gap-6">
                <SpecRow label="Chevaux" value={vehicle.performance.hp} />
                <SpecRow label="Couple" value={vehicle.performance.torque} />
                <SpecRow label="0-100 km/h" value={vehicle.performance.zeroTo100} />
                <SpecRow label="Vitesse Maximale" value={vehicle.performance.topSpeed} />
              </dl>
            )}
            {tab === "drivetrain" && (
              <dl className="grid sm:grid-cols-2 gap-6">
                <SpecRow label="Type de Carburant" value={vehicle.drivetrain.fuel} />
                <SpecRow label="Transmission" value={vehicle.drivetrain.transmission} />
                <SpecRow label="Boîte de Vitesses" value={vehicle.drivetrain.gearbox} />
              </dl>
            )}
            {tab === "equipment" && (
              <dl className="grid sm:grid-cols-2 gap-6">
                <SpecRow label="Nombre de Places" value={vehicle.equipment.seats} />
                <SpecRow label="Roues" value={vehicle.equipment.wheels} />
                <SpecRow label="Freins" value={vehicle.equipment.brakes} />
                <SpecRow label="Suspension" value={vehicle.equipment.suspension} />
                <SpecRow label="Équipements Extérieurs" value={vehicle.equipment.exterior} />
                <SpecRow label="Équipements Intérieurs" value={vehicle.equipment.interior} />
              </dl>
            )}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 mt-20 py-8 px-6 text-center text-xs text-white/40 uppercase tracking-widest">
        © {new Date().getFullYear()} YOLO Le Concierge · <Link to="/" className="hover:text-white">Accueil</Link>
      </footer>

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} initialVehicle={vehicle.id} />}
      {contactOpen && (
        <ContactModal
          onClose={() => setContactOpen(false)}
          prefilledVehicle={`${vehicle.brand} ${vehicle.name}`}
        />
      )}
    </div>
  );
}

function SpecMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      <p className="text-sm mt-1 font-medium">{value}</p>
    </div>
  );
}

function KeyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0a0a0a] p-6 text-center">
      <p className="font-display text-2xl md:text-3xl text-[#7dd3fc]">{value}</p>
      <p className="text-xs uppercase tracking-widest text-white/50 mt-2">{label}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/5 pb-4">
      <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-4">
      <dt className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</dt>
      <dd className="font-display text-lg">{value}</dd>
    </div>
  );
}

export type { Vehicle };
