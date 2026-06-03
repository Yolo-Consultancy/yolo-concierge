/* eslint-disable prettier/prettier */
import { useMemo, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { vehicles as defaultVehicles, formatPrice, type Vehicle } from "@/lib/vehicles";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { bookingConfig } from "@/config/booking";

const WHATSAPP_NUMBER = bookingConfig.whatsappNumber;
const SELECT_OPTION_CLS = "bg-[#0f0f0f] text-white";
const KINSHASA_LOCATION_SUGGESTIONS = [
  "Showroom YOLO - Gombe",
  "Gombe",
  "Boulevard du 30 Juin",
  "Gare Centrale de Kinshasa",
  "Aéroport International de N'djili",
  "Aéroport de N'Dolo",
  "Fleuve Congo Hotel - Gombe",
  "Pullman Kinshasa Grand Hotel - Gombe",
  "Hotel Memling - Gombe",
  "Hilton Kinshasa - Gombe",
  "Rotana Kin Plaza Arjaan - Gombe",
  "Beatrice Hotel - Gombe",
  "Palais de la Nation - Gombe",
  "Cité de l'Union Africaine - Ngaliema",
  "Ma Campagne - Ngaliema",
  "Macampagne",
  "Binza",
  "Binza Ozone",
  "Binza Pigeon",
  "Météo - Ngaliema",
  "UPN - Ngaliema",
  "Kintambo",
  "Kintambo Magasin",
  "Bandalungwa",
  "Bandal Molart",
  "Bandal Bisengo",
  "Lemba",
  "Lemba Terminus",
  "Université de Kinshasa - UNIKIN",
  "Mont-Amba",
  "Limete",
  "Limete 7e Rue",
  "Limete Industriel",
  "Kingabwa",
  "Matete",
  "Marché de Matete",
  "Ngaba",
  "Kalamu",
  "Yolo Nord",
  "Yolo Sud",
  "Kasa-Vubu",
  "Lingwala",
  "Barumbu",
  "Kinshasa commune",
  "Bumbu",
  "Makala",
  "Selembao",
  "Ngiri-Ngiri",
  "Masina",
  "Masina Sans Fil",
  "N'djili",
  "N'djili Sainte-Thérèse",
  "Kimbanseke",
  "Kingasani",
  "Mikondo",
  "Mont-Ngafula",
  "Cité Verte",
  "Kisenso",
  "Ndjili Brasserie",
  "Pompage - Ngaliema",
  "GB - Ngaliema",
  "Socimat - Gombe",
  "Texaf Bilembo - Ngaliema",
  "Marché Central de Kinshasa",
  "Marché de la Liberté",
  "Stade des Martyrs",
  "Stade Tata Raphaël",
  "Place Victoire",
  "Rond-point Huileries",
  "Rond-point Ngaba",
  "Rond-point Socimat",
  "Rond-point Moulaert",
  "Avenue Kasa-Vubu",
  "Avenue Colonel Mondjiba",
  "Avenue de la Justice",
  "Avenue des Huileries",
  "Avenue Lumumba",
  "Avenue By-Pass",
  "Route de Matadi",
  "Route de l'Université",
  "Centre Wallonie-Bruxelles - Gombe",
  "Institut Français de Kinshasa - Halle de la Gombe",
  "Congo Trade Center - Gombe",
  "Kin Marché Gombe",
  "City Market Gombe",
] as const;

const STEPS = [
  "Sélectionner les Dates",
  "Choisir le Lieu",
  "Vos Coordonnées",
  "Vérifier et Envoyer",
] as const;

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputCls: string;
}

function LocationAutocomplete({ value, onChange, placeholder, inputCls }: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = KINSHASA_LOCATION_SUGGESTIONS.filter((location) =>
      location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered.length > 0 ? filtered : Array.from(KINSHASA_LOCATION_SUGGESTIONS));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder || "Commencez à taper..."}
        className={`${inputCls} pl-11`}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f0f] border border-white/15 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => {
                onChange(location);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 transition"
            >
              {location}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookingModal({
  onClose,
  initialVehicle = "",
  vehicles = defaultVehicles,
}: {
  onClose: () => void;
  initialVehicle?: string;
  vehicles?: Vehicle[];
}) {
  const [step, setStep] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [form, setForm] = useState({
    vehicleId: initialVehicle,
    dateRange: "",
    pickupTime: "12:00",
    returnTime: "12:00",
    pickupLocation: "",
    dropoffLocation: "",
    sameDropoff: true,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
  });

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const inputCls =
    "w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc]";
  const selectCls = `${inputCls} bg-[#0f0f0f] text-white [color-scheme:dark]`;

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return "";
    const from = format(range.from, "dd/MM/yyyy");
    if (!range.to) return from;
    return `${from} – ${format(range.to, "dd/MM/yyyy")}`;
  };

  const handleDateRangeSelect = (range?: DateRange) => {
    setSelectedDateRange(range);
    setForm({ ...form, dateRange: formatDateRange(range) });
  };

  const canNext = () => {
    if (step === 0) return !!selectedDateRange?.from && !!selectedDateRange?.to;
    if (step === 1) return !!form.pickupLocation && (form.sameDropoff || !!form.dropoffLocation);
    if (step === 2) return !!form.firstName && !!form.lastName && !!form.email;
    return true;
  };

  const summary = useMemo(() => {
    const dropoff = form.sameDropoff ? form.pickupLocation : form.dropoffLocation;
    const lines = [
      `Bonjour, je souhaite réserver le véhicule suivant :`,
      ``,
      selectedVehicle ? `• Véhicule : ${selectedVehicle.brand} ${selectedVehicle.name} (${selectedVehicle.year})` : "",
      selectedVehicle ? `• Tarif : ${formatPrice(selectedVehicle.pricePerDay)} FCFA/jour` : "",
      `• Dates : ${form.dateRange}`,
      `• Prise en charge : ${form.pickupTime} – ${form.pickupLocation}`,
      `• Retour : ${form.returnTime} – ${dropoff}`,
      ``,
      `Mes coordonnées :`,
      `• Nom : ${form.firstName} ${form.lastName}`,
      `• Email : ${form.email}`,
      form.phone ? `• Téléphone : ${form.countryCode} ${form.phone}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [form, selectedVehicle]);

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
    window.open(url, "_blank");
  };

  const handlePayOnline = () => {
    alert(bookingConfig.payOnline.unavailableMessage);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="font-display text-2xl text-white">Réservation</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between gap-2">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={label} className="flex-1 flex flex-col items-center text-center relative">
                  {i < STEPS.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-px ${i < step ? "bg-[#7dd3fc]" : "bg-white/10"}`} />
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      done || active ? "bg-[#7dd3fc] text-black" : "bg-white/10 text-white/50"
                    } ${active ? "ring-4 ring-[#7dd3fc]/20" : ""}`}
                  >
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] leading-tight ${active ? "text-[#7dd3fc] font-medium" : "text-white/50"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Body */}
        <div className="p-6 text-white">
          {selectedVehicle && (
            <div className="flex items-center gap-4 p-3 mb-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-20 h-14 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg leading-tight">
                  {selectedVehicle.brand} {selectedVehicle.name}
                </p>
                <p className="text-xs text-white/50">
                  {selectedVehicle.brand} {selectedVehicle.name} ({selectedVehicle.year})
                </p>
                <p className="text-sm text-[#7dd3fc] mt-0.5">{formatPrice(selectedVehicle.pricePerDay)} FCFA/jour</p>
              </div>
            </div>
          )}

          {/* Step 1 — Dates */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Sélectionnez vos dates de location *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className={`${inputCls} pl-11 text-left relative`}>
                      <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <span className={form.dateRange ? "text-white" : "text-white/30"}>
                        {form.dateRange || "Sélectionner la Plage de Dates"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto border-white/10 bg-[#0f0f0f] p-0 text-white shadow-2xl"
                  >
                    <Calendar
                      mode="range"
                      selected={selectedDateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={1}
                      locale={fr}
                      disabled={{ before: new Date() }}
                      className="bg-[#0f0f0f] text-white"
                      classNames={{
                        caption_label: "text-white",
                        day: "text-white",
                        weekday: "text-white/50",
                        outside: "text-white/25",
                        disabled: "text-white/20",
                        today: "bg-white/10 text-white",
                        range_start: "bg-[#7dd3fc] text-black rounded-l-md",
                        range_middle: "bg-[#7dd3fc]/20 text-white rounded-none",
                        range_end: "bg-[#7dd3fc] text-black rounded-r-md",
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-white/40 mt-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                  </svg>
                  ex. 15/06/2026 – 20/06/2026
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Heure de Prise en Charge</label>
                  <select
                    value={form.pickupTime}
                    onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                    className={selectCls}
                  >
                    {timeOptions()}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Heure de Retour</label>
                  <select
                    value={form.returnTime}
                    onChange={(e) => setForm({ ...form, returnTime: e.target.value })}
                    className={selectCls}
                  >
                    {timeOptions()}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Lieu */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Lieu de Prise en Charge</label>
                <LocationAutocomplete
                  value={form.pickupLocation}
                  onChange={(value) => setForm({ ...form, pickupLocation: value })}
                  placeholder="Commencez à taper une adresse ou sélectionnez le showroom"
                  inputCls={inputCls}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.sameDropoff}
                  onChange={(e) => setForm({ ...form, sameDropoff: e.target.checked })}
                  className="w-4 h-4 accent-[#7dd3fc]"
                />
                <span className="text-sm">Retour au même endroit</span>
              </label>

              {!form.sameDropoff && (
                <div>
                  <label className="block text-sm font-medium mb-2">Lieu de Retour</label>
                  <LocationAutocomplete
                    value={form.dropoffLocation}
                    onChange={(value) => setForm({ ...form, dropoffLocation: value })}
                    placeholder="Adresse de retour"
                    inputCls={inputCls}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Coordonnées */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Prénom"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Nom"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adresse E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone (optionnel)</label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    className={`${selectCls} w-32`}
                  >
                    <option className={SELECT_OPTION_CLS} value="+243">🇨🇩 +243</option>
                    <option className={SELECT_OPTION_CLS} value="+221">🇸🇳 +221</option>
                    <option className={SELECT_OPTION_CLS} value="+225">🇨🇮 +225</option>
                    <option className={SELECT_OPTION_CLS} value="+33">🇫🇷 +33</option>
                    <option className={SELECT_OPTION_CLS} value="+32">🇧🇪 +32</option>
                    <option className={SELECT_OPTION_CLS} value="+1">🇺🇸 +1</option>
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{9,10}"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm({ ...form, phone: onlyDigits });
                    }}
                    placeholder="9 à 10 chiffres"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Vérification */}
          {step === 3 && (
            <div className="space-y-4">
              <SummaryCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                }
                title="Sélectionner les Dates"
                onEdit={() => setStep(0)}
              >
                <p className="text-sm text-white/70">{form.dateRange}</p>
                <p className="text-sm text-white/70">
                  Heure de Prise en Charge: <span className="text-white">{form.pickupTime}</span> · Heure de Retour:{" "}
                  <span className="text-white">{form.returnTime}</span>
                </p>
              </SummaryCard>

              <SummaryCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                }
                title="Choisir le Lieu"
                onEdit={() => setStep(1)}
              >
                <p className="text-sm text-white/70">
                  Lieu de Prise en Charge: <span className="text-white">{form.pickupLocation}</span>
                </p>
                <p className="text-sm text-white/70">
                  Lieu de Retour:{" "}
                  <span className="text-white">{form.sameDropoff ? form.pickupLocation : form.dropoffLocation}</span>
                </p>
              </SummaryCard>

              <SummaryCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                }
                title="Vos Coordonnées"
                onEdit={() => setStep(2)}
              >
                <p className="text-sm text-white">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-sm text-white/60">{form.email}</p>
                {form.phone && <p className="text-sm text-white/60">{form.countryCode} {form.phone}</p>}
              </SummaryCard>

              {selectedVehicle && (
                <div className="rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#7dd3fc] text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    Montant estimé
                  </div>
                  <p className="font-display text-xl text-[#7dd3fc]">{formatPrice(selectedVehicle.pricePerDay)} FCFA/jour</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-white/10 p-6 flex gap-3">
          {step === 0 ? (
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 text-white"
            >
              Annuler
            </button>
          ) : (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 text-white flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3.5 rounded-xl bg-[#7dd3fc] text-black text-sm font-medium hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Suivant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleWhatsApp}
                className="py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe57] transition flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                </svg>
                {bookingConfig.whatsapp.label}
              </button>
              <button
                onClick={handlePayOnline}
                className="py-3.5 rounded-xl bg-[#7dd3fc] text-black text-sm font-medium hover:bg-white transition flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                </svg>
                {bookingConfig.payOnline.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function timeOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ["00", "30"]) {
      const v = `${String(h).padStart(2, "0")}:${m}`;
      opts.push(<option className={SELECT_OPTION_CLS} key={v} value={v}>{v}</option>);
    }
  }
  return opts;
}

function SummaryCard({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#7dd3fc] text-sm font-medium">
          {icon}
          {title}
        </div>
        <button onClick={onEdit} className="text-xs text-white/60 hover:text-white flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Modifier
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
