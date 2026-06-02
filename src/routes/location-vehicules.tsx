import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import vehiculesImg from "@/assets/portal-vehicules.jpg";

export const Route = createFileRoute("/location-vehicules")({
  head: () => ({
    meta: [
      { title: "Location de Véhicules — YOLO Le Concierge" },
      { name: "description", content: "Réservez un véhicule en ligne : économique, SUV, luxe, minibus, utilitaire. Avec ou sans chauffeur." },
      { property: "og:title", content: "Location de Véhicules — YOLO" },
      { property: "og:description", content: "Réservation en ligne, calcul automatique du prix, suivi en temps réel." },
    ],
  }),
  component: LocationVehicules,
});

type Vehicle = {
  id: string;
  name: string;
  category: string;
  seats: number;
  pricePerDay: number;
  features: string[];
};

const vehicles: Vehicle[] = [
  { id: "eco", name: "Hyundai i10", category: "Économique", seats: 4, pricePerDay: 25000, features: ["Climatisation", "Boîte manuelle", "Faible consommation"] },
  { id: "berline", name: "Toyota Corolla", category: "Berline", seats: 5, pricePerDay: 40000, features: ["Climatisation", "Boîte automatique", "Bluetooth"] },
  { id: "suv", name: "Toyota RAV4", category: "SUV", seats: 5, pricePerDay: 65000, features: ["4x4", "GPS", "Cuir"] },
  { id: "luxe", name: "Mercedes Classe E", category: "Luxe", seats: 4, pricePerDay: 120000, features: ["Cuir premium", "Toit ouvrant", "Chauffeur disponible"] },
  { id: "minibus", name: "Toyota Hiace", category: "Minibus", seats: 14, pricePerDay: 85000, features: ["Climatisation", "Sièges confort", "Grand coffre"] },
  { id: "utilitaire", name: "Renault Master", category: "Utilitaire", seats: 3, pricePerDay: 55000, features: ["12m³ de volume", "Hayon", "Idéal pro"] },
];

const STEPS = ["Trajet", "Véhicule", "Options", "Vos infos", "Confirmation"] as const;

function LocationVehicules() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    pickupCity: "",
    dropoffCity: "",
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    withDriver: false,
    vehicleId: "",
    options: { gps: false, childSeat: false, additionalDriver: false, insurance: true },
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[440px] overflow-hidden">
        <SiteHeader />
        <img src={vehiculesImg} alt="Location de véhicules" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-16 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Portail 01</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-3xl">Location de Véhicules</h1>
          <p className="mt-4 max-w-xl text-white/80">Du citadin à la berline de prestige. Avec ou sans chauffeur.</p>
        </div>
      </section>

      {/* Stepper */}
      <section className="mx-auto max-w-5xl px-6 -mt-12 relative z-20">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8">
          {/* Steps indicator */}
          <ol className="flex items-center justify-between mb-8 overflow-x-auto gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-3 flex-shrink-0">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${i <= step ? "bg-gold text-gold-foreground border-gold" : "bg-background text-muted-foreground border-border"}`}>
                  {i + 1}
                </span>
                <span className={`text-xs uppercase tracking-wider hidden sm:inline ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                {i < STEPS.length - 1 && <span className="w-6 h-px bg-border hidden md:inline-block" />}
              </li>
            ))}
          </ol>

          {/* Step content */}
          {step === 0 && (
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Ville de prise en charge">
                <input value={form.pickupCity} onChange={(e) => setForm({ ...form, pickupCity: e.target.value })} placeholder="Ex. Dakar Aéroport" className="input" />
              </Field>
              <Field label="Ville de restitution">
                <input value={form.dropoffCity} onChange={(e) => setForm({ ...form, dropoffCity: e.target.value })} placeholder="Ex. Dakar Centre" className="input" />
              </Field>
              <Field label="Date de départ">
                <input type="date" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} className="input" />
              </Field>
              <Field label="Heure">
                <input type="time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} className="input" />
              </Field>
              <Field label="Date de retour">
                <input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} className="input" />
              </Field>
              <Field label="Heure">
                <input type="time" value={form.returnTime} onChange={(e) => setForm({ ...form, returnTime: e.target.value })} className="input" />
              </Field>
              <label className="md:col-span-2 flex items-center gap-3 p-4 rounded-lg border border-border bg-secondary/50 cursor-pointer">
                <input type="checkbox" checked={form.withDriver} onChange={(e) => setForm({ ...form, withDriver: e.target.checked })} />
                <span className="text-sm">Avec chauffeur privé <span className="text-muted-foreground">(+20 000 FCFA / jour)</span></span>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setForm({ ...form, vehicleId: v.id })}
                  className={`text-left rounded-xl border-2 p-5 transition ${form.vehicleId === v.id ? "border-gold bg-gold/5" : "border-border hover:border-foreground/30"}`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-gold">{v.category}</p>
                  <h3 className="font-display text-xl mt-1">{v.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{v.seats} places</p>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {v.features.map((f) => <li key={f}>· {f}</li>)}
                  </ul>
                  <p className="mt-4 font-display text-lg">{v.pricePerDay.toLocaleString()} <span className="text-xs text-muted-foreground">FCFA/jour</span></p>
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
                <label key={o.k} className="flex items-center justify-between p-4 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={(form.options as any)[o.k]} onChange={(e) => setForm({ ...form, options: { ...form.options, [o.k]: e.target.checked } })} />
                    <span className="text-sm">{o.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{o.price}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Prénom"><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" /></Field>
              <Field label="Nom"><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
              <Field label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></Field>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gold flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold-foreground"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-display text-3xl mb-2">Réservation confirmée</h3>
              <p className="text-muted-foreground">Un email récapitulatif a été envoyé à {form.email}.</p>
              <p className="text-muted-foreground text-sm mt-1">Notre équipe vous contactera sous 1h.</p>
            </div>
          )}

          {/* Summary + navigation */}
          {step < 4 && (
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-border pt-6">
              <div className="text-sm">
                {selectedVehicle ? (
                  <>
                    <p className="text-muted-foreground">{selectedVehicle.name} · {days} jour{days > 1 ? "s" : ""}</p>
                    <p className="font-display text-2xl text-foreground">{total.toLocaleString()} FCFA</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Sélectionnez un véhicule pour voir le tarif</p>
                )}
              </div>
              <div className="flex gap-3">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-md border border-border text-sm hover:bg-secondary">Retour</button>
                )}
                <button
                  disabled={!canNext()}
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 3 ? "Confirmer la réservation" : "Continuer"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 mb-16">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
        </div>
      </section>

      <style>{`
        .input { width: 100%; background: var(--background); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: var(--gold); }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{label}</span>
      {children}
    </label>
  );
}
