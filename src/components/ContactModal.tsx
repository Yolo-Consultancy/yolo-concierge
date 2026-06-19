/* eslint-disable prettier/prettier */
import { useState, useMemo } from "react";
import { publicApi } from "@/lib/api/client";
import type { ServiceType } from "@/config/portals";
import { toast } from "sonner";
import { allCountries } from "country-telephone-data";

const SELECT_OPTION_CLS = "bg-[#0f0f0f] text-white";

type ContactModalProps = {
  onClose: () => void;
  prefilledVehicle?: string;
  initialSubject?: string;
  serviceType?: ServiceType | "general";
};

// Tri alphabétique de tous les pays du monde
const sortedCountries = [...allCountries].sort((a, b) =>
  a.name.localeCompare(b.name)
);

// Fonction utilitaire pour générer le drapeau émoji à partir de l'ISO 2 (ex: "fr" -> 🇫🇷)
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
export function ContactModal({
  onClose,
  prefilledVehicle = "",
  initialSubject = "",
  serviceType = "general",
}: ContactModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+243",
    subject: initialSubject || (prefilledVehicle ? "Location spécifique" : "Informations générales"),
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const inputCls =
    "w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc] transition";
  const selectCls = `${inputCls} bg-[#0f0f0f] text-white [color-scheme:dark]`;

  const subjects = [
    "Informations générales",
    "Location spécifique",
    "Devis Déménagement",
    "Devis personnalisé",
    "Autre",
  ];

  const summary = useMemo(() => {
    const lines = [
      `Bonjour YOLO Le Concierge,`,
      ``,
      `Je souhaite vous contacter pour le sujet suivant : *${form.subject}*`,
      prefilledVehicle ? `• Véhicule concerné : *${prefilledVehicle}*` : "",
      ``,
      `*Mes coordonnées :*`,
      `• Nom complet : ${form.name}`,
      `• E-mail : ${form.email}`,
      form.phone ? `• Téléphone : ${form.countryCode} ${form.phone}` : "",
      ``,
      `*Message :*`,
      form.message,
    ].filter((line) => line !== "");
    return lines.join("\n");
  }, [form, prefilledVehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      await publicApi.post("/contact", {
        name: form.name,
        email: form.email,
        phone: form.phone ? `${form.countryCode} ${form.phone}` : "",
        subject: form.subject || prefilledVehicle || "Contact YOLO",
        message: summary,
        serviceType,
      });
      setSubmitted(true);
      toast.success("Votre demande a bien été envoyée à notre équipe.");
    } catch {
      toast.error("Impossible d'envoyer votre message. Réessayez plus tard.");
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-xl my-8 transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="font-display text-2xl text-white">Contacter le Concierge</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-t border-white/10" />

        {/* Body */}
        <div className="p-6 text-white">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#7dd3fc]/10 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="3">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <h4 className="font-display text-2xl mb-3">Demande Envoyée !</h4>
              <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Votre message a été ouvert dans WhatsApp. Notre concierge dédié est en train de prendre connaissance de votre demande et vous répondra dans les plus brefs délais.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition"
              >
                Fermer la fenêtre
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {prefilledVehicle && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 text-sm text-[#7dd3fc]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>
                    Vous nous contactez concernant le véhicule : <strong>{prefilledVehicle}</strong>
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                  Nom Complet *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom et prénom"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                    Adresse E-mail *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                    Sujet de la Demande
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={selectCls}
                  >
                    {subjects.map((subj) => (
                      <option key={subj} value={subj} className={SELECT_OPTION_CLS}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-white mb-2">Téléphone <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form , countryCode: e.target.value })}
                    className="bg-[#0f0f0f] border border-white/15 rounded-lg px-3 py-3.5 text-sm text-white focus:outline-none focus:border-[#7dd3fc] w-36 scheme-dark"
                  >
                    {sortedCountries.map((country) => {
                      const dialCodeWithPlus = `+${country.dialCode}`;
                      return (
                        <option
                          key={`${country.iso2}-${country.dialCode}`}
                          className={SELECT_OPTION_CLS}
                          value={dialCodeWithPlus}
                        >
                          {getFlagEmoji(country.iso2)} {dialCodeWithPlus} ({country.name})
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="828863897"
                    className={`${inputCls} flex-1`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
                  Message / Description du Besoin *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre demande en détail (dates souhaitées, services additionnels...)"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-[#7dd3fc] text-black text-sm font-medium hover:bg-white transition flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                  </svg>
                  Envoyer via WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
