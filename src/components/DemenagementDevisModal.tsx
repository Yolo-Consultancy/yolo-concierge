/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight, Check, MapPin, User, Calendar as CalendarIcon, Home, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { KINSHASA_COMMUNES } from "@/config/kinshasa-communes";
import {
  getMovingBusyDates,
  parseBusyDateStrings,
  startOfToday,
} from "@/lib/demenagement/busy-dates";
import {
  buildDemenagementQuoteMessage,
  emptyQuoteData,
  formatLocation,
  formatFloorInfo,
  type DemenagementQuoteData,
  type LocationAddress,
  type FloorInfo,
} from "@/lib/demenagement/quote";
import { submitServiceRequest } from "@/lib/portals/service-requests";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { type ClientAccount } from "@/lib/client/auth";
import { ContactPhoneField } from "@/components/ContactPhoneField";
import { formatPhoneSummary, phoneDigitsOnly, phoneMaxLength } from "@/lib/phone-field";
import {
  emptyClientContactFields,
  clientContactFieldsFromAccount,
  resolveClientAccount,
  type ClientContactFormFields,
} from "@/lib/client/form-prefill";

const STEPS = ["Coordonnées", "Départ & Arrivée", "Détails", "Confirmation"] as const;

const inputCls = "yolo-form-input";
const selectCls = `${inputCls} yolo-form-select cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`;

const CALENDAR_CLASS_NAMES = {
  caption_label: "text-charbon font-semibold font-display",
  button_previous: "text-charbon hover:bg-black/5",
  button_next: "text-charbon hover:bg-black/5",
  weekday: "text-charbon/55 font-semibold",
  day_button:
    "text-charbon font-semibold hover:bg-black/6 data-[selected-single=true]:!bg-or-vif data-[selected-single=true]:!text-charbon",
  outside: "text-charbon/30",
  disabled: "text-charbon/35 opacity-100",
  today: "bg-black/6 text-charbon font-bold rounded-md",
} as const;

const CALENDAR_MODIFIERS_CLASS_NAMES = {
  selected: "rdp-selected",
  enCours: "rdp-enCours",
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="text-sm font-medium text-charbon flex items-center gap-2 font-display">
      <Icon className="h-4 w-4 text-or-bronze shrink-0" />
      {children}
    </p>
  );
}

function LocationFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: LocationAddress;
  onChange: (v: LocationAddress) => void;
}) {
  const commune = KINSHASA_COMMUNES.find((c) => c.id === value.communeId);
  const quartiers = commune?.quartiers ?? [];

  return (
    <div className="rounded-xl border border-black/8 bg-white p-4 space-y-3 shadow-sm">
      <p className="text-sm font-semibold text-charbon flex items-center gap-2 font-display">
        <MapPin className="h-4 w-4 text-or-bronze" />
        {title}
      </p>
      <div>
        <label className="yolo-form-label" data-required>Commune</label>
        <select
          className={selectCls}
          value={value.communeId}
          onChange={(e) =>
            onChange({
              communeId: e.target.value,
              quartier: "",
              avenue: value.avenue,
              reference: value.reference,
            })
          }
        >
          <option value="">— Choisir une commune —</option>
          {KINSHASA_COMMUNES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.alias ? `${c.name} (${c.alias})` : c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="yolo-form-label" data-required>Quartier</label>
        <select
          className={selectCls}
          value={value.quartier}
          disabled={!value.communeId}
          onChange={(e) => onChange({ ...value, quartier: e.target.value })}
        >
          <option value="">— Choisir un quartier —</option>
          {quartiers.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="yolo-form-label">Avenue / rue proche</label>
        <input
          className={inputCls}
          placeholder="Ex. Avenue Kasa-Vubu, près de..."
          value={value.avenue}
          onChange={(e) => onChange({ ...value, avenue: e.target.value })}
        />
      </div>
      <div>
        <label className="yolo-form-label">Référence / repère</label>
        <input
          className={inputCls}
          placeholder="Ex. Immeuble CTC, face à la station, portail bleu..."
          value={value.reference}
          onChange={(e) => onChange({ ...value, reference: e.target.value })}
        />
      </div>
    </div>
  );
}

function FloorFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: FloorInfo;
  onChange: (v: FloorInfo) => void;
}) {
  return (
    <div className="space-y-3 pt-3 border-t border-black/8">
      <p className="text-xs font-semibold text-charbon font-display uppercase tracking-wide">{title}</p>
      <label className="flex items-center gap-2 text-sm text-charbon cursor-pointer">
        <input
          type="checkbox"
          className="accent-or-vif"
          checked={value.isElevated}
          onChange={(e) =>
            onChange({
              ...value,
              isElevated: e.target.checked,
              floorLevel: e.target.checked ? Math.max(1, value.floorLevel) : 0,
            })
          }
        />
        Logement en étage (pas rez-de-chaussée)
      </label>
      {value.isElevated && (
        <>
          <div>
            <label className="yolo-form-label" data-required>Niveau / étage</label>
            <input
              type="number"
              min={1}
              max={50}
              className={inputCls}
              value={value.floorLevel || ""}
              onChange={(e) =>
                onChange({ ...value, floorLevel: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-charbon cursor-pointer">
            <input
              type="checkbox"
              className="accent-or-vif"
              checked={value.hasElevator}
              onChange={(e) => onChange({ ...value, hasElevator: e.target.checked })}
            />
            Ascenseur disponible
          </label>
        </>
      )}
    </div>
  );
}

function isLocationValid(loc: LocationAddress) {
  return !!(loc.communeId && loc.quartier.trim());
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isBusyMoveDate(moveDate: string, busySet: Set<string>) {
  return !!moveDate && busySet.has(moveDate);
}

export function DemenagementDevisModal({ open, onClose }: Props) {
  const [clientAccount, setClientAccount] = useState<ClientAccount | "guest" | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ClientContactFormFields>(emptyClientContactFields());
  const [quote, setQuote] = useState<DemenagementQuoteData>(emptyQuoteData());
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [busyDateStrings, setBusyDateStrings] = useState<string[]>([]);
  const [loadingBusyDates, setLoadingBusyDates] = useState(false);

  const busyDates = useMemo(() => parseBusyDateStrings(busyDateStrings), [busyDateStrings]);
  const busyDateSet = useMemo(() => new Set(busyDateStrings), [busyDateStrings]);
  const account = clientAccount && clientAccount !== "guest" ? clientAccount : null;
  const selectedMoveDate = useMemo(
    () => (quote.moveDate ? parseLocalDate(quote.moveDate) : undefined),
    [quote.moveDate],
  );
  const todayStart = useMemo(() => startOfToday(), [open]);
  const calendarDisabled = useMemo(
    () => [{ before: todayStart }, ...busyDates],
    [todayStart, busyDates],
  );
  const calendarModifiers = useMemo(() => ({ enCours: busyDates }), [busyDates]);

  const handleMoveDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      const iso = format(date, "yyyy-MM-dd");
      if (busyDateSet.has(iso)) {
        toast.error("Déménagement en cours ce jour — date indisponible.");
        return;
      }
      setQuote((prev) => (prev.moveDate === iso ? prev : { ...prev, moveDate: iso }));
    },
    [busyDateSet],
  );

  useEffect(() => {
    void resolveClientAccount().then((acc) => {
      if (acc) {
        setClientAccount(acc);
      }
      setAuthChecked(true);
    });
  }, []);

  const handleAuthSuccess = (acc: ClientAccount) => {
    setClientAccount(acc);
    setContact(clientContactFieldsFromAccount(acc));
  };

  useEffect(() => {
    if (!open) return;
    setLoadingBusyDates(true);
    getMovingBusyDates()
      .then(setBusyDateStrings)
      .catch(() => setBusyDateStrings([]))
      .finally(() => setLoadingBusyDates(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setDone(false);
    setQuote(emptyQuoteData());
    setContact(emptyClientContactFields());
  }, [open]);

  useEffect(() => {
    if (!open || !account?.id) return;
    setContact(clientContactFieldsFromAccount(account));
  
  }, [open, account?.id]);

  if (!open) return null;

  if (!authChecked) return null;

  if (clientAccount === null) {
    return (
      <ClientAuthModal
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        onContinueAsGuest={() => setClientAccount("guest")}
        portal="demenagement"
      />
    );
  }

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!contact.firstName.trim()) {
        toast.error("Le prénom est obligatoire.");
        return false;
      }
      if (!contact.lastName.trim()) {
        toast.error("Le nom est obligatoire.");
        return false;
      }
      if (!contact.email.trim()) {
        toast.error("L'adresse e-mail est obligatoire.");
        return false;
      }
      if (!contact.phone.trim()) {
        toast.error("Le numéro de téléphone est obligatoire.");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!isLocationValid(quote.departure) || !isLocationValid(quote.arrival)) {
        toast.error("Complétez la commune et le quartier pour le départ et l'arrivée.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!quote.moveDate) {
        toast.error("Indiquez la date souhaitée du déménagement.");
        return false;
      }
      if (isBusyMoveDate(quote.moveDate, busyDateSet)) {
        toast.error("Cette date a déjà un déménagement en cours. Choisissez une autre date.");
        return false;
      }
      if (quote.bedrooms < 1) {
        toast.error("Indiquez au moins une chambre.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSending(true);
    try {
      const name = `${contact.firstName} ${contact.lastName}`.trim();
      const phone = `${contact.countryCode} ${contact.phone}`.trim();
      await submitServiceRequest({
        name,
        email: contact.email.trim(),
        phone,
        subject: `Devis déménagement — ${formatLocation(quote.departure)} → ${formatLocation(quote.arrival)}`,
        message: buildDemenagementQuoteMessage(quote),
        serviceType: "demenagement",
        quoteData: quote,
      });
      setDone(true);
      toast.success("Demande de devis envoyée ! Notre équipe vous recontactera.");
    } catch {
      toast.error("Envoi impossible. Réessayez ou contactez-nous par téléphone.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 font-sans">
      <div
        className="w-full sm:max-w-xl bg-(--yolo-cream) border border-black/10 sm:rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden"
        data-yolo-form
      >
        <div className="flex items-center justify-between border-b yolo-form-divider px-5 py-4 shrink-0 bg-white">
          <div>
            <p className="font-display text-xl font-bold text-charbon leading-tight">Demande de devis</p>
            <p className="text-[11px] yolo-form-muted uppercase tracking-[0.15em] mt-1 font-medium">
              Déménagement Kinshasa · {STEPS[step]}
              {account ? (
                <span className="normal-case tracking-normal text-or-bronze">
                  {" "}
                  · {account.firstName} {account.lastName}
                </span>
              ) : (
                <span className="normal-case tracking-normal"> · Mode invité</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 text-charbon/50 hover:text-charbon transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4 shrink-0 bg-white border-b yolo-form-divider pb-4">
          <div className="flex gap-1 mb-2">
            {STEPS.map((_, i) => (
              <div
                key={STEPS[i]}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-or-vif" : "bg-black/10"}`}
              />
            ))}
          </div>
          <p className="text-xs yolo-form-muted">
            Étape {step + 1} sur {STEPS.length}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {done ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto h-14 w-14 bg-or-vif flex items-center justify-center">
                <Check className="h-7 w-7 text-charbon" strokeWidth={3} />
              </div>
              <h3 className="font-display text-xl font-bold text-charbon">Demande enregistrée</h3>
              <p className="text-sm yolo-form-muted max-w-xs mx-auto leading-relaxed">
                Un concierge YOLO étudiera votre devis et vous contactera sous 24 h.
              </p>
            </div>
          ) : step === 0 ? (
            <div className="space-y-4">
              <SectionTitle icon={User}>
                Vos coordonnées
                {account && (
                  <span className="text-[10px] text-or-bronze ml-auto font-normal normal-case tracking-normal">
                    Compte connecté — prérempli
                  </span>
                )}
              </SectionTitle>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="yolo-form-label" data-required>Prénom</label>
                  <input
                    required
                    className={inputCls}
                    value={contact.firstName}
                    onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="yolo-form-label" data-required>Nom</label>
                  <input
                    required
                    className={inputCls}
                    value={contact.lastName}
                    onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="yolo-form-label" data-required>E-mail</label>
                <input
                  type="email"
                  required
                  className={inputCls}
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </div>
              <ContactPhoneField
                required
                countryCode={contact.countryCode}
                phone={contact.phone}
                onCountryCodeChange={(countryCode) =>
                  setContact((prev) => ({
                    ...prev,
                    countryCode,
                    phone: phoneDigitsOnly(prev.phone).slice(0, phoneMaxLength(countryCode)),
                  }))
                }
                onPhoneChange={(phone) => setContact({ ...contact, phone })}
                inputCls={inputCls}
              />
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <LocationFields
                title="Adresse de départ"
                value={quote.departure}
                onChange={(departure) => setQuote({ ...quote, departure })}
              />
              <LocationFields
                title="Adresse d'arrivée"
                value={quote.arrival}
                onChange={(arrival) => setQuote({ ...quote, arrival })}
              />
            </div>
          ) : step === 2 ? (
            <div className="space-y-5">
              <SectionTitle icon={Home}>À propos du déménagement</SectionTitle>
              <div>
                <label className="yolo-form-label" data-required>Date souhaitée</label>
                {quote.moveDate && (
                  <p className="mb-3 text-sm text-charbon font-medium font-display capitalize">
                    {format(parseLocalDate(quote.moveDate), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                )}
                <div className="yolo-light-calendar rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedMoveDate}
                    onSelect={handleMoveDateSelect}
                    locale={fr}
                    disabled={calendarDisabled}
                    modifiers={calendarModifiers}
                    modifiersClassNames={CALENDAR_MODIFIERS_CLASS_NAMES}
                    className="w-full bg-white p-3 [--cell-size:2.75rem]"
                    classNames={CALENDAR_CLASS_NAMES}
                  />
                  <p className="border-t border-black/8 px-4 py-2.5 text-xs yolo-form-muted">
                    {loadingBusyDates
                      ? "Chargement des disponibilités…"
                      : "Dates bleues : déménagement en cours (non sélectionnables)."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="yolo-form-label" data-required>Nombre de chambres</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className={inputCls}
                    value={quote.bedrooms}
                    onChange={(e) => setQuote({ ...quote, bedrooms: Number(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="yolo-form-label">Salons / pièces à vivre</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className={inputCls}
                    value={quote.livingRooms}
                    onChange={(e) => setQuote({ ...quote, livingRooms: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-black/8 bg-white p-4 shadow-sm">
                <FloorFields
                  title="Logement de départ"
                  value={quote.departureFloor}
                  onChange={(departureFloor) => setQuote({ ...quote, departureFloor })}
                />
                <FloorFields
                  title="Logement d'arrivée"
                  value={quote.arrivalFloor}
                  onChange={(arrivalFloor) => setQuote({ ...quote, arrivalFloor })}
                />
              </div>
              <div>
                <label className="yolo-form-label">Informations complémentaires</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Objets fragiles, piano, accès difficile..."
                  value={quote.additionalNotes}
                  onChange={(e) => setQuote({ ...quote, additionalNotes: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SectionTitle icon={CalendarIcon}>Récapitulatif</SectionTitle>
              <div className="rounded-xl border border-black/8 bg-white p-4 space-y-2.5 text-sm shadow-sm">
                <RecapRow label="Client" value={`${contact.firstName} ${contact.lastName}`} />
                <RecapRow
                  label="Contact"
                  value={`${contact.email} · ${formatPhoneSummary(contact.countryCode, contact.phone)}`}
                />
                <RecapRow
                  label="Date"
                  value={
                    quote.moveDate
                      ? format(parseLocalDate(quote.moveDate), "d MMMM yyyy", { locale: fr })
                      : "—"
                  }
                />
                <RecapRow label="Départ" value={formatLocation(quote.departure)} />
                <p className="text-xs yolo-form-muted pl-1">{formatFloorInfo("Départ", quote.departureFloor)}</p>
                <RecapRow label="Arrivée" value={formatLocation(quote.arrival)} />
                <p className="text-xs yolo-form-muted pl-1">{formatFloorInfo("Arrivée", quote.arrivalFloor)}</p>
                <RecapRow
                  label="Volume"
                  value={`${quote.bedrooms} chambre(s), ${quote.livingRooms} salon(s)`}
                />
                {quote.additionalNotes && (
                  <RecapRow label="Notes" value={quote.additionalNotes} />
                )}
              </div>
            </div>
          )}
        </div>

        {!done && (
          <div className="border-t yolo-form-divider px-5 py-4 flex justify-between gap-3 shrink-0 bg-white">
            <button
              type="button"
              onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-4 py-2.5 text-sm font-medium text-charbon hover:bg-(--yolo-cream) transition"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 0 ? "Annuler" : "Retour"}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-lg bg-or-vif px-5 py-2.5 text-sm font-semibold text-charbon hover:bg-charbon hover:text-white transition"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending}
                className="inline-flex items-center gap-1 rounded-lg bg-or-vif px-5 py-2.5 text-sm font-semibold text-charbon hover:bg-charbon hover:text-white transition disabled:opacity-50"
              >
                {sending ? "Envoi..." : "Envoyer la demande"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="yolo-form-muted text-xs uppercase tracking-wide">{label} :</span>{" "}
      <span className="text-charbon">{value}</span>
    </p>
  );
}
