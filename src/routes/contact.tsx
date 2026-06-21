/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Clock, Check, AlertCircle } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { PortalHomeLink } from "@/components/PortalHomeLink";
import { PortalHeader } from "@/components/PortalHeader";
import { getPortal } from "@/config/portals";
import { publicApi } from "@/lib/api/client";
import { getSettings } from "@/lib/admin/store";
import {
  contactConfig,
  formatPhoneDisplay,
  mapsDirectionsUrl,
  whatsappLink,
} from "@/config/contact";
import { toast } from "sonner";
import { allCountries } from "country-telephone-data";
import { useClientContactPrefill } from "@/lib/client/form-prefill";

const contactSearchSchema = z.object({
  portal: z.enum(["vehicules", "demenagement", "sur-mesure"]).optional().catch(undefined),
}).catch({});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — YOLO Le Concierge" },
      { name: "description", content: "Contactez YOLO Le Concierge à Kinshasa. Location premium, déménagement et services sur mesure." },
    ],
  }),
  validateSearch: contactSearchSchema,
  component: ContactPage,
});

const sortedCountries = [...allCountries].sort((a, b) => a.name.localeCompare(b.name));

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function ContactPage() {
  const { portal: portalId } = Route.useSearch();
  const portal = portalId ? getPortal(portalId) : null;
  const { account, fields } = useClientContactPrefill();
  const accentText = portal?.accentClass ?? "text-or-vif";
  const accentBgBtn = "bg-or-vif text-charbon hover:bg-white";
  const phoneCardIcon = "text-or-vif";
  const phoneCardBg = "bg-or-vif/10";
  const phoneCardBorder = "border-or-vif/30";
  const phoneCardBtn = "bg-or-vif/15 border-or-vif/30 text-or-vif hover:bg-or-vif/25";
  const successBorder = "border-or-vif/30 bg-or-vif/5";
  const focusBorder = "focus:border-or-vif";
  const inputBase =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition";
  const inputCls = `${inputBase} ${focusBorder} focus:outline-none`;
  const selectCls = `${inputCls} bg-charbon [color-scheme:dark]`;

  const [settings, setSettings] = useState({
    whatsappNumber: "243828863897",
    contactEmail: "contact@yololeconcierge.com",
    address: contactConfig.defaultAddress,
    companyName: "YOLO Le Concierge",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
    subject: "Informations générales",
    message: "",
  });

  useEffect(() => {
    getSettings().then(setSettings).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!account) return;
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || fields.firstName,
      lastName: prev.lastName || fields.lastName,
      email: prev.email || fields.email,
      phone: prev.phone || fields.phone,
      countryCode: fields.countryCode,
    }));
  }, [account, fields]);

  const phoneDisplay = formatPhoneDisplay(settings.whatsappNumber);
  const telHref = `tel:+${settings.whatsappNumber.replace(/\D/g, "")}`;
  const mapsUrl = mapsDirectionsUrl(settings.address || contactConfig.mapsQuery);
  const serviceType =
    portalId === "demenagement" ? "demenagement" : portalId === "sur-mesure" ? "sur_mesure" : portalId === "vehicules" ? "vehicules" : "general";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    setSending(true);
    try {
      await publicApi.post("/contact", {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: form.phone ? `${form.countryCode} ${form.phone}` : "",
        subject: form.subject,
        message: form.message.trim(),
        serviceType,
      });
      setSubmitted(true);
      toast.success("Votre message a bien été envoyé.");
    } catch {
      toast.error("Impossible d'envoyer votre message. Réessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-charbon text-white font-sans">
      <div className="relative border-b border-white/10 bg-linear-to-b from-charbon to-charbon pb-16 pt-28">
        {portalId ? <PortalHeader portalId={portalId} /> : <SiteHeader />}
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className={`text-xs uppercase tracking-[0.45em] mb-4 ${accentText}`}>
            {portal ? portal.name : "YOLO Le Concierge"}
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-5">Contactez-nous</h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
            Prêt à vivre le luxe ? Entrez en contact avec notre équipe et laissez-nous vous offrir une
            expérience premium inoubliable à <span className={accentText}>{contactConfig.city}</span>.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3 mb-16">
          <article className="rounded-[28px] border border-white/10 bg-charbon p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <MessageCircle className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="font-display text-xl mb-1">WhatsApp</h2>
            <p className="text-sm text-white/50 mb-5">Réponses rapides garanties</p>
            <a
              href={whatsappLink(settings.whatsappNumber, "Bonjour YOLO Le Concierge,")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              Chat sur WhatsApp
            </a>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-charbon p-6 text-center">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${phoneCardBg}`}>
              <Phone className={`h-7 w-7 ${phoneCardIcon}`} />
            </div>
            <h2 className="font-display text-xl mb-1">Appelez-nous</h2>
            <p className={`text-sm mb-5 ${accentText}`}>{phoneDisplay}</p>
            <a
              href={telHref}
              className={`inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${phoneCardBtn}`}
            >
              Appeler maintenant
            </a>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-charbon p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <Mail className="h-7 w-7 text-white/80" />
            </div>
            <h2 className="font-display text-xl mb-1">Écrivez-nous</h2>
            <p className="text-sm text-white/50 mb-5 break-all">{settings.contactEmail}</p>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Envoyer un e-mail
            </a>
          </article>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl mb-6">Envoyez-nous un Message</h2>

            {submitted ? (
              <div className={`rounded-[28px] border p-10 text-center ${successBorder}`}>
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${phoneCardBg}`}>
                  <Check className={`h-8 w-8 ${phoneCardIcon}`} />
                </div>
                <h3 className="font-display text-2xl mb-3">Message envoyé !</h3>
                <p className="text-sm text-white/65 max-w-md mx-auto">
                  Notre équipe à {contactConfig.city} a bien reçu votre demande et vous répondra dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-[28px] border border-white/10 bg-charbon p-6 md:p-8">
                {account && (
                  <p className="text-xs text-or-vif/90 bg-or-vif/10 border border-or-vif/20 rounded-lg px-3 py-2">
                    Coordonnées préremplies depuis votre compte YOLO.
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Prénom *</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className={inputCls}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Nom *</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className={inputCls}
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">E-mail *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls}
                    placeholder="vous@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Numéro de téléphone</label>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                      className={`w-36 shrink-0 rounded-xl border border-white/15 bg-charbon px-3 py-3.5 text-sm text-white focus:outline-none ${focusBorder}`}
                    >
                      {sortedCountries.map((country) => {
                        const dial = `+${country.dialCode}`;
                        return (
                          <option key={`${country.iso2}-${country.dialCode}`} value={dial} className="bg-charbon">
                            {getFlagEmoji(country.iso2)} {dial}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                      className={`${inputCls} flex-1`}
                      placeholder="828863897"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Sujet</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={selectCls}
                  >
                    {contactConfig.subjects.map((s) => (
                      <option key={s} value={s} className="bg-charbon">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${inputCls} resize-none`}
                    placeholder="Décrivez votre demande (dates, véhicule, services...)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className={`w-full rounded-xl py-4 text-sm font-semibold transition disabled:opacity-50 ${accentBgBtn}`}
                >
                  {sending ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-charbon p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className={`h-5 w-5 ${accentText}`} />
                <h3 className="font-display text-xl">Visitez-nous</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                {settings.address || contactConfig.defaultAddress}
                {"\n"}
                <span className={accentText}>{contactConfig.city}</span> — {contactConfig.country}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex mt-4 text-sm hover:text-white transition underline underline-offset-4 ${accentText}`}
              >
                Obtenir l&apos;itinéraire
              </a>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-charbon p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className={`h-5 w-5 ${accentText}`} />
                <h3 className="font-display text-xl">Heures d&apos;ouverture</h3>
              </div>
              <ul className="space-y-3">
                {contactConfig.openingHours.map((row) => (
                  <li key={row.days} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-white/55">{row.days}</span>
                    <span className="text-white/85">{row.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-charbon p-6">
              <h3 className="font-display text-xl mb-4">Pourquoi Choisir YOLO ?</h3>
              <ul className="space-y-3">
                {contactConfig.whyChoose.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${accentText}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/5 p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-xl">Support d&apos;urgence</h3>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Besoin d&apos;assistance immédiate ? Notre ligne de support est disponible 24/7 à {contactConfig.city}.
              </p>
              <a
                href={telHref}
                className="inline-flex w-full items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition"
              >
                Contact d&apos;urgence
              </a>
            </div>
          </aside>
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-white/40 uppercase tracking-widest">
        © {new Date().getFullYear()} YOLO Le Concierge ·{" "}
        <PortalHomeLink variant="footer" className="inline-flex hover:text-white" />
        {portal && (
          <>
            {" · "}
            <Link to={portal.publicPath as "/location-vehicules"} className="hover:text-white normal-case tracking-normal">
              {portal.name}
            </Link>
          </>
        )}
      </footer>
    </div>
  );
}
