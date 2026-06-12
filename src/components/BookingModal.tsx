/* eslint-disable prettier/prettier */
import { useMemo, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { vehicles as defaultVehicles, formatPrice, type Vehicle } from "@/lib/vehicles";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { bookingConfig } from "@/config/booking";
import { upsertBooking, newId, type Booking } from "@/lib/admin/store";
import { toast } from "sonner";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { getCurrentClient, hydrateCurrentClient, type ClientAccount } from "@/lib/client/auth";

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
  // ── Auth gate ────────────────────────────────────────────
  // null = not yet decided, ClientAccount = logged in, "guest" = guest
  const [clientAccount, setClientAccount] = useState<ClientAccount | "guest" | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    hydrateCurrentClient().then((acc) => {
      if (acc) setClientAccount(acc);
      setAuthChecked(true);
    });
  }, []);

  const [step, setStep] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

  // Pre-fill form from account if available
  const account = clientAccount && clientAccount !== "guest" ? clientAccount : null;
  const [form, setForm] = useState({
    vehicleId: initialVehicle,
    dateRange: "",
    pickupTime: "06:00",
    returnTime: "12:00",
    pickupLocation: "",
    dropoffLocation: "",
    sameDropoff: true,
    firstName: account?.firstName ?? "",
    lastName: account?.lastName ?? "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    countryCode: account?.countryCode ?? "+243",
  });

  // When auth resolves, pre-fill form if we got an account
  const handleAuthSuccess = (acc: ClientAccount) => {
    setClientAccount(acc);
    setForm((prev) => ({
      ...prev,
      firstName: acc.firstName,
      lastName: acc.lastName,
      email: acc.email,
      phone: acc.phone,
      countryCode: acc.countryCode,
    }));
  };

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

  const days = useMemo(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) return 0;
    const ms = selectedDateRange.to.getTime() - selectedDateRange.from.getTime();
    return Math.max(1, Math.round(ms / 86400000));
  }, [selectedDateRange]);

  const vehicleTotal = selectedVehicle ? days * selectedVehicle.pricePerDay : 0;
  const grandTotal = vehicleTotal;
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
      clientId: account?.id,
      clientName: `${form.firstName} ${form.lastName}`.trim(),
      clientPhone: form.phone ? `${form.countryCode} ${form.phone}` : "",
      clientEmail: form.email?.trim().toLowerCase() || undefined,
      startDate,
      endDate,
      days,
      pickupLocation: form.pickupLocation,
      dropoffLocation: form.sameDropoff ? form.pickupLocation : form.dropoffLocation,
      totalPrice: grandTotal,
      withChauffeur: false,
      driverId: "",
      driverName: "",
      status: "en_attente",
      createdAt: new Date().toISOString(),
    };
  };

  const handleConfirmBooking = async () => {
    const booking = buildBooking();
    if (!booking) {
      toast.error("Veuillez compléter les étapes précédentes.");
      return;
    }
    setSubmitting(true);
    try {
      const saved = await upsertBooking(booking);
      const notified = (saved as { adminEmailSent?: boolean }).adminEmailSent;
      toast.success(
        notified
          ? "Réservation enregistrée. L'administrateur a reçu un e-mail."
          : "Réservation enregistrée.",
      );
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer la réservation.");
    } finally {
      setSubmitting(false);
    }
  };


  if (!authChecked) return null;

  // ── Auth gate — show ClientAuthModal if not yet decided ──────────────────
  if (clientAccount === null) {
    return (
      <ClientAuthModal
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        onContinueAsGuest={() => setClientAccount("guest")}
      />
    );
  }

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
          <div>
            <h3 className="font-display text-2xl text-white">Réservation</h3>
            {clientAccount && clientAccount !== "guest" ? (
              <p className="text-xs text-[#7dd3fc] mt-0.5 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
                {clientAccount.firstName} {clientAccount.lastName}
              </p>
            ) : (
              <p className="text-xs text-white/30 mt-0.5">Mode invité</p>
            )}
          </div>
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
                <div className="rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>
                      {C}{formatPrice(selectedVehicle.pricePerDay)} × {days} jour{days > 1 ? "s" : ""}
                    </span>
                    <span className="text-white">{C}{formatPrice(vehicleTotal)}</span>
                  </div>
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
              onClick={handleConfirmBooking}
              className="flex-1 py-3.5 rounded-xl bg-[#7dd3fc] text-black text-sm font-medium hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
              </svg>
              {submitting ? "Traitement..." : bookingConfig.reservation.label}
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
