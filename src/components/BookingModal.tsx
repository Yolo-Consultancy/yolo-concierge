import { useMemo, useState } from "react";
import { vehicles as defaultVehicles, formatPrice, type Vehicle } from "@/lib/vehicles";

export function BookingModal({
  onClose,
  initialVehicle = "",
  vehicles = defaultVehicles,
}: {
  onClose: () => void;
  initialVehicle?: string;
  vehicles?: Vehicle[];
}) {
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
          <h3 className="font-display text-2xl text-white">Réservation</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">×</button>
        </div>

        {selectedVehicle && (
          <div className="flex items-center gap-4 px-6 py-4 bg-[#7dd3fc]/5 border-b border-[#7dd3fc]/20">
            <img src={selectedVehicle.image} alt={selectedVehicle.name} className="w-16 h-12 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[#7dd3fc]">Véhicule sélectionné</p>
              <p className="font-display text-lg text-white truncate">{selectedVehicle.brand} {selectedVehicle.name}</p>
            </div>
            <p className="text-sm text-white/70 hidden sm:block">{formatPrice(selectedVehicle.pricePerDay)} FCFA/jour</p>
          </div>
        )}


        <div className="p-6 md:p-8 text-white">
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
                    <p className="text-xs text-white/60 mt-1">{formatPrice(v.pricePerDay)} FCFA/jour</p>
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
                    <p className="font-display text-2xl">{formatPrice(total)} FCFA</p>
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
