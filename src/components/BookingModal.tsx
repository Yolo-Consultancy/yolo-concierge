/* eslint-disable prettier/prettier */
import { useMemo, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { vehicles as defaultVehicles, formatPrice, type Vehicle } from "@/lib/vehicles";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { listAvailableDriversForDates, type Driver } from "@/lib/admin/store";

import { bookingConfig } from "@/config/booking";
import { upsertBooking, newId, type Booking } from "@/lib/admin/store";
import { notifyAdminNewBooking, createCheckoutSession } from "@/lib/admin/notify";
import { toast } from "sonner";

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
  "Dates & Durée",
  "Lieu",
  "Chauffeur",
  "Coordonnées",
  "Vérifier",
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
    withChauffeur: false,
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
    if (step === 2) return true; // chauffeur step (optionnel)
    if (step === 3) return !!form.firstName && !!form.lastName && !!form.email;
    return true;
  };

  const days = useMemo(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) return 0;
    const ms = selectedDateRange.to.getTime() - selectedDateRange.from.getTime();
    return Math.max(1, Math.round(ms / 86400000));
  }, [selectedDateRange]);

  const chauffeurTotal = form.withChauffeur ? days * bookingConfig.chauffeur.pricePerDay : 0;
  const vehicleTotal = selectedVehicle ? days * selectedVehicle.pricePerDay : 0;
  const grandTotal = vehicleTotal + chauffeurTotal;
  const C = bookingConfig.currencySymbol;

  const [submitting, setSubmitting] = useState(false);

  const buildBooking = (): Booking | null => {
    if (!selectedVehicle || !selectedDateRange?.from || !selectedDateRange?.to) return null;
    const startDate = selectedDateRange.from.toISOString().slice(0, 10);
    const endDate = selectedDateRange.to.toISOString().slice(0, 10);
    return {
      id: newId("b"),
      vehicleId: selectedVehicle.id,
      vehicleName: `${selectedVehicle.brand} ${selectedVehicle.name}`,
      clientName: `${form.firstName} ${form.lastName}`.trim(),
      clientPhone: form.phone ? `${form.countryCode} ${form.phone}` : "",
      startDate,
      endDate,
      days,
      pickupLocation: form.pickupLocation,
      totalPrice: grandTotal,
      withChauffeur: form.withChauffeur,
      driverId: "",
      driverName: "",
      status: "en_attente",
      createdAt: new Date().toISOString(),
    };
  };

  const handlePayOnline = async () => {
    const booking = buildBooking();
    if (!booking) {
      toast.error("Veuillez compléter les étapes précédentes.");
      return;
    }
    setSubmitting(true);
    // 1) Persiste la réservation côté admin
    upsertBooking(booking);
    // 2) Notifie l'admin par e-mail (si backend dispo)
    notifyAdminNewBooking(booking);
    // 3) Crée la session Stripe Checkout
    const url = await createCheckoutSession(booking);
    setSubmitting(false);
    if (url) {
      window.location.href = url;
      return;
    }
    toast.success(
      "Réservation enregistrée. L'administrateur en a été informé. Le paiement par carte sera disponible après activation du backend."
    );
    onClose();
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
            <div className="flex items-center gap-4 p-3 mb-6 rounded-xl border border-white/10 bg-white/2">
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
                <p className="text-sm text-[#7dd3fc] mt-0.5">${formatPrice(selectedVehicle.pricePerDay)} /jour</p>
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

          {/* Step 3 — Chauffeur (dédié) */}
          {step === 2 && (() => {
            const toISO = (d?: Date) => d ? d.toISOString().slice(0, 10) : "";
            const startISO = toISO(selectedDateRange?.from);
            const endISO   = toISO(selectedDateRange?.to ?? selectedDateRange?.from);
            const availableDrivers: Driver[] = startISO
              ? listAvailableDriversForDates(startISO, endISO)
              : [];
            const noDrivers = availableDrivers.length === 0;

            return (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-white">
                    Souhaitez-vous un chauffeur YOLO ?
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Choisissez « Avec chauffeur » si vous ne souhaitez pas conduire vous-même.
                  </p>
                </div>

                {noDrivers && startISO && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
                    <svg className="mt-0.5 shrink-0 text-amber-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-xs text-amber-300">
                      Aucun chauffeur disponible sur les dates sélectionnées ({form.dateRange}). Vous pouvez continuer sans chauffeur ou contacter YOLO via WhatsApp pour une solution personnalisée.
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, withChauffeur: false })}
                    className={`text-left rounded-xl border p-4 transition ${
                      !form.withChauffeur
                        ? "border-[#7dd3fc] bg-[#7dd3fc]/10 ring-2 ring-[#7dd3fc]/30"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <p className="font-medium text-white">Je conduis</p>
                    <p className="text-xs text-white/60 mt-1">
                      Vous récupérez le véhicule et conduisez vous-même.
                    </p>
                    <p className="text-xs text-white/40 mt-2">Aucun frais supplémentaire</p>
                  </button>

                  <button
                    type="button"
                    disabled={noDrivers}
                    onClick={() => !noDrivers && setForm({ ...form, withChauffeur: true })}
                    className={`text-left rounded-xl border p-4 transition ${
                      noDrivers
                        ? "border-white/10 opacity-40 cursor-not-allowed"
                        : form.withChauffeur
                        ? "border-[#7dd3fc] bg-[#7dd3fc]/10 ring-2 ring-[#7dd3fc]/30"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <p className="font-medium text-white">Avec chauffeur</p>
                    <p className="text-xs text-white/60 mt-1">
                      Un chauffeur professionnel YOLO assure vos trajets.
                    </p>
                    {noDrivers ? (
                      <p className="text-xs text-amber-400 mt-2">Non disponible sur ces dates</p>
                    ) : (
                      <p className="text-xs text-[#7dd3fc] mt-2">
                        À partir de {C}{formatPrice(Math.min(...availableDrivers.map(d => d.pricePerDay)))} /jour
                        {days > 0 && form.withChauffeur ? ` · Total chauffeur ${C}${formatPrice(chauffeurTotal)}` : ""}
                      </p>
                    )}
                  </button>
                </div>

                {/* Liste des chauffeurs disponibles */}
                {!noDrivers && availableDrivers.length > 0 && (
                  <div>
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                      {availableDrivers.length} chauffeur{availableDrivers.length > 1 ? "s" : ""} disponible{availableDrivers.length > 1 ? "s" : ""}
                    </p>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {availableDrivers.map((driver) => (
                        <div
                          key={driver.id}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                            {driver.photo ? (
                              <img src={driver.photo} alt={`${driver.firstName} ${driver.lastName}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-white/30 text-xs font-bold">
                                {driver.firstName[0]}{driver.lastName[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{driver.firstName} {driver.lastName}</p>
                            <p className="text-xs text-white/50 truncate">{driver.languages} · {driver.experienceYears} ans exp.</p>
                          </div>
                          <p className="text-xs text-[#7dd3fc] font-medium shrink-0">{C}{formatPrice(driver.pricePerDay)}/j</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.withChauffeur && !noDrivers && (
                  <p className="text-xs text-white/50 flex items-start gap-2 rounded-lg bg-[#7dd3fc]/5 border border-[#7dd3fc]/20 p-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-[#7dd3fc]">
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                    </svg>
                    Nous vous attribuerons un chauffeur expérimenté selon vos dates. Vous pouvez préciser vos préférences en commentaire WhatsApp.
                  </p>
                )}
              </div>
            );
          })()}

          {/* Step 4 — Coordonnées */}
          {step === 3 && (
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

          {/* Step 5 — Vérification */}
          {step === 4 && (
            <div className="space-y-4">
              <SummaryCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                }
                title="Dates & Durée"
                onEdit={() => setStep(0)}
              >
                <p className="text-sm text-white/70">
                  {form.dateRange} {days > 0 && <span className="text-white/90">({days} jour{days > 1 ? "s" : ""})</span>}
                </p>
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
                title="Lieu"
                onEdit={() => setStep(1)}
              >
                <p className="text-sm text-white/70">
                  Prise en Charge: <span className="text-white">{form.pickupLocation}</span>
                </p>
                <p className="text-sm text-white/70">
                  Retour:{" "}
                  <span className="text-white">{form.sameDropoff ? form.pickupLocation : form.dropoffLocation}</span>
                </p>
              </SummaryCard>

              <SummaryCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" /><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                  </svg>
                }
                title="Chauffeur"
                onEdit={() => setStep(2)}
              >
                <p className="text-sm text-white">
                  {form.withChauffeur ? "Avec chauffeur YOLO" : "Je conduis moi-même"}
                </p>
                {form.withChauffeur && (
                  <p className="text-sm text-white/60">
                    +{C}{formatPrice(bookingConfig.chauffeur.pricePerDay)} /jour · Total {C}{formatPrice(chauffeurTotal)}
                  </p>
                )}
              </SummaryCard>

              <SummaryCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                }
                title="Vos Coordonnées"
                onEdit={() => setStep(3)}
              >
                <p className="text-sm text-white">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-sm text-white/60">{form.email}</p>
                {form.phone && <p className="text-sm text-white/60">{form.countryCode} {form.phone}</p>}
              </SummaryCard>

              {selectedVehicle && (
                <div className="rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>
                      {C}{formatPrice(selectedVehicle.pricePerDay)} × {days} jour{days > 1 ? "s" : ""}
                    </span>
                    <span className="text-white">{C}{formatPrice(vehicleTotal)}</span>
                  </div>
                  {form.withChauffeur && (
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>
                        Chauffeur · {C}{formatPrice(bookingConfig.chauffeur.pricePerDay)} × {days}
                      </span>
                      <span className="text-white">{C}{formatPrice(chauffeurTotal)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#7dd3fc]/20 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#7dd3fc] text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                      Total estimé
                    </div>
                    <p className="font-display text-xl text-[#7dd3fc]">{C}{formatPrice(grandTotal)}</p>
                  </div>
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
            <button
              disabled={submitting}
              onClick={handlePayOnline}
              className="flex-1 py-3.5 rounded-xl bg-[#7dd3fc] text-black text-sm font-medium hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
              </svg>
              {submitting ? "Traitement..." : bookingConfig.payOnline.label}
            </button>
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
    <div className="rounded-xl border border-white/10 bg-white/2 p-4">
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
