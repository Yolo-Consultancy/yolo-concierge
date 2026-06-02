import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import carHero from "@/assets/car-hero.jpg";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import destDakar from "@/assets/dest-dakar.jpg";
import destAbidjan from "@/assets/dest-abidjan.jpg";
import destSaly from "@/assets/dest-saly.jpg";

export const Route = createFileRoute("/location-vehicules")({
  head: () => ({
    meta: [
      { title: "Location de Véhicules de Luxe — YOLO Le Concierge" },
      { name: "description", content: "Ferrari, Lamborghini, Porsche, Mercedes et plus. Livrés à votre porte partout en Afrique de l'Ouest." },
      { property: "og:title", content: "Location de Véhicules — YOLO Le Concierge" },
      { property: "og:description", content: "Supercars et véhicules premium, avec ou sans chauffeur, livrés où vous êtes." },
    ],
  }),
  component: LocationVehicules,
});

type Vehicle = {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerDay: number;
  image: string;
  specs: { hp: number; seats: number; transmission: string };
};

const vehicles: Vehicle[] = [
  { id: "ferrari", name: "488 GTB", brand: "Ferrari", category: "Supercar", pricePerDay: 450000, image: car1, specs: { hp: 660, seats: 2, transmission: "Auto" } },
  { id: "lambo", name: "Huracán EVO", brand: "Lamborghini", category: "Supercar", pricePerDay: 520000, image: car2, specs: { hp: 640, seats: 2, transmission: "Auto" } },
  { id: "porsche", name: "911 GT3", brand: "Porsche", category: "Sport", pricePerDay: 380000, image: car3, specs: { hp: 510, seats: 2, transmission: "Auto" } },
];

const destinations = [
  { name: "Dakar", image: destDakar },
  { name: "Abidjan", image: destAbidjan },
  { name: "Saly", image: destSaly },
];

const reasons = [
  { title: "Prix 100% Transparents", desc: "Pas de frais cachés. Le prix affiché est celui que vous payez." },
  { title: "Livraison à Domicile", desc: "Aéroport, hôtel, villa — nous livrons où vous êtes." },
  { title: "Carburant Premium Inclus", desc: "Chaque location inclut un plein de carburant premium." },
  { title: "Support 24/7", desc: "Une équipe disponible jour et nuit, en français et en anglais." },
  { title: "Assurance Complète", desc: "Couverture tous risques incluse. Conduisez sereinement." },
  { title: "Note 5 Étoiles", desc: "Une réputation construite sur des centaines d'avis vérifiés." },
];

function LocationVehicules() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [prefilledVehicle, setPrefilledVehicle] = useState<string>("");

  const openBooking = (vehicleId?: string) => {
    setPrefilledVehicle(vehicleId ?? "");
    setBookingOpen(true);
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-6">
          <Link to="/" className="font-display text-2xl tracking-tight">
            YOLO<span className="text-[#7dd3fc]">.</span>
            <span className="ml-2 text-[10px] uppercase tracking-[0.35em] text-white/60 hidden sm:inline">Le Concierge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em] text-white/80">
            <Link to="/" className="hover:text-white">Accueil</Link>
            <a href="#flotte" className="hover:text-white">Flotte</a>
            <a href="#destinations" className="hover:text-white">Destinations</a>
            <a href="#pourquoi" className="hover:text-white">À propos</a>
            <button onClick={() => openBooking()} className="hover:text-white">Contact</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img src={carHero} alt="Supercar de luxe" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-white/70 mb-8">YOLO Line</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-normal leading-[1.05]">
            Location de Supercars<br />
            <span className="italic">en Afrique de l'Ouest</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            Ferrari, Lamborghini, Porsche, Mercedes et plus, livrées à votre porte
            partout au Sénégal, en Côte d'Ivoire et au-delà.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#flotte" className="inline-flex items-center gap-2 bg-[#7dd3fc] text-black px-8 py-4 rounded-full text-sm font-medium hover:bg-white transition">
              Découvrir notre flotte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <button onClick={() => openBooking()} className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-white/10 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Parler au concierge
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs uppercase tracking-widest animate-pulse">↓ Défiler</div>
      </section>

      {/* Featured fleet */}
      <section id="flotte" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-[#7dd3fc] mb-4">Sélection</p>
            <h2 className="font-display text-4xl md:text-6xl">Supercars en Vedette</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <article key={v.id} className="group bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-[#7dd3fc]/40 transition">
                <div className="aspect-[4/3] overflow-hidden bg-black">
                  <img src={v.image} alt={`${v.brand} ${v.name}`} width={1280} height={896} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#7dd3fc]">{v.category}</p>
                  <h3 className="font-display text-2xl mt-2">{v.brand} <span className="text-white/70">{v.name}</span></h3>
                  <div className="mt-4 flex gap-4 text-xs text-white/60">
                    <span>{v.specs.hp} HP</span>
                    <span>·</span>
                    <span>{v.specs.seats} places</span>
                    <span>·</span>
                    <span>{v.specs.transmission}</span>
                  </div>
                  <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">À partir de</p>
                      <p className="font-display text-2xl">{v.pricePerDay.toLocaleString()} <span className="text-xs text-white/60">FCFA/jour</span></p>
                    </div>
                    <button onClick={() => openBooking(v.id)} className="text-xs uppercase tracking-widest text-[#7dd3fc] hover:text-white">Réserver →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={() => openBooking()} className="inline-flex items-center gap-2 border border-white/30 px-7 py-3 rounded-full text-sm hover:bg-white/10 transition">
              Voir toutes les voitures
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="py-24 px-6 bg-black">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-[#7dd3fc] mb-4">Où Conduire</p>
            <h2 className="font-display text-4xl md:text-6xl">Destinations Populaires</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((d) => (
              <button key={d.name} onClick={() => openBooking()} className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
                <img src={d.image} alt={d.name} width={960} height={1280} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-7 text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#7dd3fc] mb-2">Location Premium</p>
                  <p className="font-display text-3xl">{d.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
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
              <div key={r.title} className="bg-[#0a0a0a] p-8">
                <div className="w-10 h-10 rounded-full bg-[#7dd3fc]/10 flex items-center justify-center mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="font-display text-xl mb-2">{r.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6 bg-black">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[#7dd3fc] mb-6 text-5xl font-display">"</div>
          <blockquote className="font-display text-2xl md:text-4xl leading-relaxed italic">
            YOLO a livré une Mercedes Classe S directement à mon hôtel à Dakar.
            La meilleure expérience de location — prix transparents, voiture
            impeccable, service exceptionnel.
          </blockquote>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/50">— Avis client vérifié</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6">Prêt à Conduire Votre Voiture de Rêve ?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Explorez notre collection ou parlez avec notre concierge pour trouver la supercar parfaite.
          </p>
          <button onClick={() => openBooking()} className="inline-flex items-center gap-2 bg-[#7dd3fc] text-black px-10 py-4 rounded-full text-sm font-medium hover:bg-white transition">
            Réserver maintenant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-white/40 uppercase tracking-widest">
        © {new Date().getFullYear()} YOLO Le Concierge · <Link to="/" className="hover:text-white">Retour à l'accueil</Link>
      </footer>

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} initialVehicle={prefilledVehicle} vehicles={vehicles} />}
    </div>
  );
}

/* ───────────────── Booking modal ───────────────── */

function BookingModal({ onClose, initialVehicle, vehicles }: { onClose: () => void; initialVehicle: string; vehicles: Vehicle[] }) {
  const STEPS = ["Trajet", "Véhicule", "Options", "Vos infos", "Confirmation"] as const;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    pickupCity: "", dropoffCity: "", pickupDate: "", pickupTime: "10:00",
    returnDate: "", returnTime: "10:00", withDriver: false,
    vehicleId: initialVehicle,
    options: { gps: false, childSeat: false, additionalDriver: false, insurance: true },
    firstName: "", lastName: "", email: "", phone: "",
  });

  const days = useMemo(() => {
    if (!form.pickupDate || !form.returnDate) return 1;
    const d = (new Date(form.returnDate).getTime() - new Date(form.pickupDate).getTime()) / 86400000;
    return Math.max(1, Math.ceil(d));
  }, [form.pickupDate, form.returnDate]);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const optionsCost = useMemo(() => {
    let c = 0;
    if (form.options.gps) c += 3000 * days;
    if (form.options.childSeat) c += 2500 * days;
    if (form.options.additionalDriver) c += 5000;
    if (form.options.insurance) c += 8000 * days;
    if (form.withDriver) c += 20000 * days;
    return c;
  }, [form.options, form.withDriver, days]);
  const total = (selectedVehicle?.pricePerDay ?? 0) * days + optionsCost;

  const canNext = () => {
    if (step === 0) return form.pickupCity && form.dropoffCity && form.pickupDate && form.returnDate;
    if (step === 1) return !!form.vehicleId;
    if (step === 2) return true;
    if (step === 3) return form.firstName && form.lastName && form.email && form.phone;
    return false;
  };

  const inputCls = "w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc]";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-3xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="font-display text-2xl">Réservation</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 md:p-8">
          {/* Steps */}
          <ol className="flex items-center justify-between mb-8 overflow-x-auto gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i <= step ? "bg-[#7dd3fc] text-black" : "bg-white/10 text-white/50"}`}>{i + 1}</span>
                <span className={`text-[10px] uppercase tracking-wider hidden md:inline ${i === step ? "text-white" : "text-white/40"}`}>{label}</span>
                {i < STEPS.length - 1 && <span className="w-4 h-px bg-white/10 hidden md:inline-block" />}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Ville de prise en charge"><input value={form.pickupCity} onChange={(e) => setForm({ ...form, pickupCity: e.target.value })} placeholder="Dakar Aéroport" className={inputCls} /></Field>
              <Field label="Ville de restitution"><input value={form.dropoffCity} onChange={(e) => setForm({ ...form, dropoffCity: e.target.value })} placeholder="Dakar Centre" className={inputCls} /></Field>
              <Field label="Date de départ"><input type="date" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} className={inputCls} /></Field>
              <Field label="Heure"><input type="time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} className={inputCls} /></Field>
              <Field label="Date de retour"><input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} className={inputCls} /></Field>
              <Field label="Heure"><input type="time" value={form.returnTime} onChange={(e) => setForm({ ...form, returnTime: e.target.value })} className={inputCls} /></Field>
              <label className="md:col-span-2 flex items-center gap-3 p-4 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5">
                <input type="checkbox" checked={form.withDriver} onChange={(e) => setForm({ ...form, withDriver: e.target.checked })} />
                <span className="text-sm">Avec chauffeur privé <span className="text-white/50">(+20 000 FCFA / jour)</span></span>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <button key={v.id} type="button" onClick={() => setForm({ ...form, vehicleId: v.id })}
                  className={`text-left rounded-xl border-2 p-4 transition flex gap-4 ${form.vehicleId === v.id ? "border-[#7dd3fc] bg-[#7dd3fc]/5" : "border-white/10 hover:border-white/30"}`}>
                  <img src={v.image} alt={v.name} className="w-24 h-20 object-cover rounded-lg" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#7dd3fc]">{v.category}</p>
                    <p className="font-display text-lg">{v.brand} {v.name}</p>
                    <p className="text-xs text-white/60 mt-1">{v.pricePerDay.toLocaleString()} FCFA/jour</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {[
                { k: "gps", label: "GPS de navigation", price: "3 000 FCFA/jour" },
                { k: "childSeat", label: "Siège enfant", price: "2 500 FCFA/jour" },
                { k: "additionalDriver", label: "Conducteur additionnel", price: "5 000 FCFA" },
                { k: "insurance", label: "Assurance tous risques", price: "8 000 FCFA/jour" },
              ].map((o) => (
                <label key={o.k} className="flex items-center justify-between p-4 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={(form.options as any)[o.k]} onChange={(e) => setForm({ ...form, options: { ...form.options, [o.k]: e.target.checked } })} />
                    <span className="text-sm">{o.label}</span>
                  </div>
                  <span className="text-xs text-white/50">{o.price}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Prénom"><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} /></Field>
              <Field label="Nom"><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field>
              <Field label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#7dd3fc] flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-display text-2xl mb-2">Réservation confirmée</h3>
              <p className="text-white/60 text-sm">Un récapitulatif a été envoyé à {form.email}.</p>
            </div>
          )}

          {step < 4 && (
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-white/10 pt-6">
              <div className="text-sm">
                {selectedVehicle ? (
                  <>
                    <p className="text-white/50">{selectedVehicle.brand} {selectedVehicle.name} · {days}j</p>
                    <p className="font-display text-2xl">{total.toLocaleString()} FCFA</p>
                  </>
                ) : <p className="text-white/50">Sélectionnez un véhicule pour voir le tarif</p>}
              </div>
              <div className="flex gap-3">
                {step > 0 && <button onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-full border border-white/20 text-sm hover:bg-white/5">Retour</button>}
                <button disabled={!canNext()} onClick={() => setStep(step + 1)} className="px-6 py-3 rounded-full bg-[#7dd3fc] text-black text-sm font-medium hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  {step === 3 ? "Confirmer" : "Continuer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">{label}</span>
      {children}
    </label>
  );
}
