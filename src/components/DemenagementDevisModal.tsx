/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight, Check, MapPin, User, Calendar as CalendarIcon, Home } from "lucide-react";
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
import {
  useClientContactPrefill,
  emptyClientContactFields,
  clientContactFieldsFromAccount,
  type ClientContactFormFields,
} from "@/lib/client/form-prefill";

const STEPS = ["Coordonnées", "Départ & Arrivée", "Détails", "Confirmation"] as const;

const SELECT_OPTION_CLS = "bg-charbon text-white";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-or-vif focus:outline-none [color-scheme:dark]";
const selectCls = `${inputCls} bg-charbon text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:text-white/40`;
const labelCls = "block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider";

type Props = {
  open: boolean;
  onClose: () => void;
};

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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <p className="text-sm font-semibold text-or-vif flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {title}
      </p>
      <div>
        <label className={labelCls}>Commune *</label>
        <select
          className={selectCls}
          value={value.communeId}
          onChange={(e) =>
            onChange({ communeId: e.target.value, quartier: "", avenue: value.avenue })
          }
        >
          <option value="" className={SELECT_OPTION_CLS}>
            — Choisir une commune —
          </option>
          {KINSHASA_COMMUNES.map((c) => (
            <option key={c.id} value={c.id} className={SELECT_OPTION_CLS}>
              {c.alias ? `${c.name} (${c.alias})` : c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Quartier *</label>
        <select
          className={selectCls}
          value={value.quartier}
          disabled={!value.communeId}
          onChange={(e) => onChange({ ...value, quartier: e.target.value })}
        >
          <option value="" className={SELECT_OPTION_CLS}>
            — Choisir un quartier —
          </option>
          {quartiers.map((q) => (
            <option key={q} value={q} className={SELECT_OPTION_CLS}>
              {q}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Avenue / rue proche *</label>
        <input
          className={inputCls}
          placeholder="Ex. Avenue Kasa-Vubu, près de..."
          value={value.avenue}
          onChange={(e) => onChange({ ...value, avenue: e.target.value })}
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
    <div className="space-y-3 pt-2 border-t border-white/5">
      <p className="text-xs font-medium text-white/70">{title}</p>
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
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
            <label className={labelCls}>Niveau / étage *</label>
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
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
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
  return !!(loc.communeId && loc.quartier.trim() && loc.avenue.trim());
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isBusyMoveDate(moveDate: string, busySet: Set<string>) {
  return !!moveDate && busySet.has(moveDate);
}

export function DemenagementDevisModal({ open, onClose }: Props) {
  const { account } = useClientContactPrefill();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ClientContactFormFields>(emptyClientContactFields());
  const [quote, setQuote] = useState<DemenagementQuoteData>(emptyQuoteData());
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [busyDateStrings, setBusyDateStrings] = useState<string[]>([]);
  const [loadingBusyDates, setLoadingBusyDates] = useState(false);

  const busyDates = useMemo(() => parseBusyDateStrings(busyDateStrings), [busyDateStrings]);
  const busyDateSet = useMemo(() => new Set(busyDateStrings), [busyDateStrings]);

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
    if (account) {
      setContact(clientContactFieldsFromAccount(account));
    } else {
      setContact(emptyClientContactFields());
    }
  }, [open, account?.id]);

  if (!open) return null;

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!contact.firstName.trim() || !contact.lastName.trim() || !contact.email.trim() || !contact.phone.trim()) {
        toast.error("Renseignez vos coordonnées complètes.");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!isLocationValid(quote.departure) || !isLocationValid(quote.arrival)) {
        toast.error("Complétez commune, quartier et avenue pour le départ et l'arrivée.");
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
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-xl bg-charbon border border-white/10 sm:rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
          <div>
            <p className="font-display text-lg font-semibold text-white">Demande de devis</p>
            <p className="text-[10px] text-white/45 uppercase tracking-widest mt-0.5">
              Déménagement Kinshasa · Étape {step + 1}/{STEPS.length}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4 shrink-0">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-or-vif" : "bg-white/10"}`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {done ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-or-vif/20 flex items-center justify-center">
                <Check className="h-7 w-7 text-or-vif" />
              </div>
              <h3 className="font-display text-xl text-white">Demande enregistrée</h3>
              <p className="text-sm text-white/60 max-w-xs mx-auto">
                Un concierge YOLO étudiera votre devis et vous contactera sous 24h.
              </p>
            </div>
          ) : step === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-white/60 flex items-center gap-2">
                <User className="h-4 w-4 text-or-vif" />
                Vos coordonnées
                {account && (
                  <span className="text-[10px] text-or-vif/80 ml-auto">Compte connecté — prérempli</span>
                )}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Prénom *</label>
                  <input className={inputCls} value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Nom *</label>
                  <input className={inputCls} value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>E-mail *</label>
                <input type="email" className={inputCls} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <div className="w-24">
                  <label className={labelCls}>Indicatif</label>
                  <input className={inputCls} value={contact.countryCode} onChange={(e) => setContact({ ...contact, countryCode: e.target.value })} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Téléphone *</label>
                  <input className={inputCls} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
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
              <p className="text-sm text-white/60 flex items-center gap-2">
                <Home className="h-4 w-4 text-or-vif" />
                À propos du déménagement
              </p>
              <div>
                <label className={labelCls}>Date souhaitée *</label>
                {quote.moveDate && (
                  <p className="mb-3 text-sm text-white">
                    {format(parseLocalDate(quote.moveDate), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                )}
                <div className="rounded-xl border border-white/10 bg-white/2 overflow-hidden [&_[data-slot=calendar]_button]:text-white [&_[data-slot=calendar]_button]:hover:bg-white/10">
                  <Calendar
                    mode="single"
                    selected={quote.moveDate ? parseLocalDate(quote.moveDate) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const iso = format(date, "yyyy-MM-dd");
                      if (busyDateSet.has(iso)) {
                        toast.error("Déménagement en cours ce jour — date indisponible.");
                        return;
                      }
                      setQuote({ ...quote, moveDate: iso });
                    }}
                    locale={fr}
                    disabled={[{ before: startOfToday() }, ...busyDates]}
                    modifiers={{ enCours: busyDates }}
                    modifiersClassNames={{
                      selected:
                        "[&_button]:!bg-or-vif [&_button]:!text-charbon [&_button]:!font-semibold [&_button]:!rounded-md",
                      enCours:
                        "[&_button]:!bg-blue-500/35 [&_button]:!text-blue-100 [&_button]:!font-semibold [&_button]:!rounded-md [&_button]:!opacity-100 [&_button]:disabled:!opacity-100 [&_button]:line-through [&_button]:hover:!bg-blue-500/35 [&_button]:hover:!text-blue-100",
                    }}
                    className="w-full bg-charbon p-3 text-white [--cell-size:2.25rem]"
                    classNames={{
                      caption_label: "text-white font-medium",
                      button_previous: "text-white hover:bg-white/10",
                      button_next: "text-white hover:bg-white/10",
                      day: "text-white",
                      weekday: "text-white/50",
                      outside: "text-white/25",
                      disabled: "text-white/25 opacity-40",
                      today: "bg-white/10 text-white rounded-md",
                    }}
                  />
                  <p className="border-t border-white/10 px-4 py-2.5 text-xs text-white/50">
                    {loadingBusyDates
                      ? "Chargement des disponibilités…"
                      : "Dates bleues : déménagement en cours (non sélectionnables)."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre de chambres *</label>
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
                  <label className={labelCls}>Salons / pièces à vivre</label>
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
              <div>
                <label className={labelCls}>Informations complémentaires</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder="Objets fragiles, piano, accès difficile..."
                  value={quote.additionalNotes}
                  onChange={(e) => setQuote({ ...quote, additionalNotes: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-white/80">
              <p className="text-white font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-or-vif" />
                Récapitulatif
              </p>
              <div className="rounded-xl border border-white/10 p-4 space-y-2 text-xs">
                <p><span className="text-white/45">Client :</span> {contact.firstName} {contact.lastName}</p>
                <p><span className="text-white/45">Contact :</span> {contact.email} · {contact.countryCode} {contact.phone}</p>
                <p><span className="text-white/45">Date :</span> {quote.moveDate}</p>
                <p><span className="text-white/45">Départ :</span> {formatLocation(quote.departure)}</p>
                <p className="text-white/55 pl-2">{formatFloorInfo("Départ", quote.departureFloor)}</p>
                <p><span className="text-white/45">Arrivée :</span> {formatLocation(quote.arrival)}</p>
                <p className="text-white/55 pl-2">{formatFloorInfo("Arrivée", quote.arrivalFloor)}</p>
                <p><span className="text-white/45">Volume :</span> {quote.bedrooms} chambre(s), {quote.livingRooms} salon(s)</p>
                {quote.additionalNotes && (
                  <p><span className="text-white/45">Notes :</span> {quote.additionalNotes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {!done && (
          <div className="border-t border-white/10 px-5 py-4 flex justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 0 ? "Annuler" : "Retour"}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-xl bg-or-vif px-5 py-2.5 text-sm font-semibold text-charbon hover:bg-white"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending}
                className="inline-flex items-center gap-1 rounded-xl bg-or-vif px-5 py-2.5 text-sm font-semibold text-charbon hover:bg-white disabled:opacity-50"
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
