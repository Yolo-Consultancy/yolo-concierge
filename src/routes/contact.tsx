/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Clock, Check, AlertCircle } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PortalHeader } from "@/components/PortalHeader";
import { getPortal } from "@/config/portals";
import { publicApi } from "@/lib/api/client";
import { getSettings } from "@/lib/admin/store";
import {
  contactConfig,
  formatPhoneDisplay,
  mapsEmbedUrl,
  whatsappLink,
} from "@/config/contact";
import { toast } from "sonner";
import { ContactPhoneField } from "@/components/ContactPhoneField";
import { phoneDigitsOnly, phoneMaxLength } from "@/lib/phone-field";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { SectionLabel } from "@/components/portal-ui/SectionLabel";
import { PortalButton } from "@/components/portal-ui/PortalButton";
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

function ContactPage() {
  const { portal: portalId } = Route.useSearch();
  const portal = portalId ? getPortal(portalId) : null;
  const { account, fields } = useClientContactPrefill();

  const inputCls = "yolo-form-input";
  const selectCls = `${inputCls} yolo-form-select`;

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
    if (!account?.id) return;
    setForm((prev) => {
      const next = {
        ...prev,
        firstName: prev.firstName || fields.firstName,
        lastName: prev.lastName || fields.lastName,
        email: prev.email || fields.email,
        phone: prev.phone || fields.phone,
        countryCode: fields.countryCode,
      };
      if (
        next.firstName === prev.firstName &&
        next.lastName === prev.lastName &&
        next.email === prev.email &&
        next.phone === prev.phone &&
        next.countryCode === prev.countryCode
      ) {
        return prev;
      }
      return next;
    });
  }, [account?.id, fields]);

  const phoneDisplay = formatPhoneDisplay(settings.whatsappNumber);
  const telHref = `tel:+${settings.whatsappNumber.replace(/\D/g, "")}`;
  const mapsUrl = contactConfig.mapsShareUrl;
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
        phone: form.phone ? `${form.countryCode} ${phoneDigitsOnly(form.phone)}` : "",
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
    <main className="min-h-screen font-sans antialiased" data-yolo-portal data-yolo-portal-light>
      <section className="relative bg-charbon text-white pb-16 pt-28">
        {portalId ? <PortalHeader portalId={portalId} /> : <SiteHeader />}
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal className="yolo-hero-content max-w-2xl mx-auto">
            <SectionLabel>{portal ? portal.name : "YOLO Le Concierge"}</SectionLabel>
            <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-tight mb-4">
              Contactez-nous
            </h1>
            <p className="text-[17px] leading-relaxed text-white/75">
              Prêt à vivre le luxe ? Notre équipe à{" "}
              <span className="text-or-vif">{contactConfig.city}</span> vous répond rapidement.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="yolo-section-light py-14 md:py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-3 mb-14">
            {[
              {
                icon: MessageCircle,
                title: "WhatsApp",
                desc: "Réponses rapides garanties",
                btn: "Chat sur WhatsApp",
                href: whatsappLink(settings.whatsappNumber, "Bonjour YOLO Le Concierge,"),
                external: true,
                iconBg: "bg-emerald-500/10",
                iconColor: "text-emerald-600",
                btnCls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 hover:bg-emerald-500/20",
              },
              {
                icon: Phone,
                title: "Appelez-nous",
                desc: phoneDisplay,
                btn: "Appeler maintenant",
                href: telHref,
                external: false,
                iconBg: "bg-or-vif/15",
                iconColor: "text-or-bronze",
                btnCls: "bg-or-vif/15 border-or-vif/30 text-or-bronze hover:bg-or-vif/25",
              },
              {
                icon: Mail,
                title: "Écrivez-nous",
                desc: settings.contactEmail,
                btn: "Envoyer un e-mail",
                href: `mailto:${settings.contactEmail}`,
                external: false,
                iconBg: "bg-charbon/5",
                iconColor: "text-charbon",
                btnCls: "border-black/12 text-charbon hover:bg-charbon hover:text-white",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <ScrollReveal key={card.title} delayMs={i * 70}>
                  <article className="yolo-portal-card bg-white border border-black/8 p-6 text-center h-full">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center ${card.iconBg}`}>
                      <Icon className={`h-7 w-7 ${card.iconColor}`} />
                    </div>
                    <h2 className="font-display text-xl font-semibold text-charbon mb-1">{card.title}</h2>
                    <p className="text-sm text-[var(--yolo-muted)] mb-5 break-all">{card.desc}</p>
                    <a
                      href={card.href}
                      target={card.external ? "_blank" : undefined}
                      rel={card.external ? "noopener noreferrer" : undefined}
                      className={`inline-flex w-full items-center justify-center border px-4 py-3 text-sm font-medium transition ${card.btnCls}`}
                    >
                      {card.btn}
                    </a>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <ScrollReveal className="lg:col-span-7">
              <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-charbon mb-6">
                Envoyez-nous un message
              </h2>

              {submitted ? (
                <div className="yolo-portal-card bg-white border border-or-vif/30 p-10 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-or-vif">
                    <Check className="h-8 w-8 text-charbon" strokeWidth={3} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-charbon mb-3">Message envoyé</h3>
                  <p className="text-sm text-[var(--yolo-muted)] max-w-md mx-auto">
                    Notre équipe à {contactConfig.city} a bien reçu votre demande et vous répondra dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  data-yolo-form
                  className="space-y-5 yolo-portal-card bg-white border border-black/8 p-6 md:p-8"
                >
                  {account && (
                    <p className="text-xs text-or-bronze bg-or-vif/10 border border-or-vif/25 px-3 py-2">
                      Coordonnées préremplies depuis votre compte YOLO.
                    </p>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="yolo-form-label" data-required>Prénom</label>
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className={inputCls}
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="yolo-form-label" data-required>Nom</label>
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
                    <label className="yolo-form-label" data-required>E-mail</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
                      placeholder="vous@exemple.com"
                    />
                  </div>

                  <ContactPhoneField
                    countryCode={form.countryCode}
                    phone={form.phone}
                    onCountryCodeChange={(countryCode) =>
                      setForm((prev) => ({
                        ...prev,
                        countryCode,
                        phone: phoneDigitsOnly(prev.phone).slice(0, phoneMaxLength(countryCode)),
                      }))
                    }
                    onPhoneChange={(phone) => setForm({ ...form, phone })}
                    inputCls={inputCls}
                  />

                  <div>
                    <label className="yolo-form-label">Sujet</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={selectCls}
                    >
                      {contactConfig.subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="yolo-form-label" data-required>Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputCls} resize-none`}
                      placeholder="Décrivez votre demande (dates, véhicule, services...)"
                    />
                  </div>

                  <PortalButton variant="primary" type="submit" disabled={sending} className="w-full">
                    {sending ? "Envoi..." : "Envoyer le message"}
                  </PortalButton>
                </form>
              )}
            </ScrollReveal>

            <aside className="lg:col-span-5 space-y-6">
              <ScrollReveal delayMs={100}>
                <div className="yolo-portal-card bg-white border border-black/8 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="h-5 w-5 text-or-bronze" />
                    <h3 className="font-display text-xl font-semibold text-charbon">Visitez-nous</h3>
                  </div>
                  <p className="text-sm text-[var(--yolo-muted)] leading-relaxed whitespace-pre-line">
                    {settings.address || contactConfig.defaultAddress}
                    {"\n"}
                    <span className="text-or-bronze">{contactConfig.city}</span> — {contactConfig.country}
                  </p>
                  <div className="mt-4 overflow-hidden border border-black/8">
                    <iframe
                      title={`YOLO Le Concierge — ${contactConfig.city}`}
                      src={mapsEmbedUrl()}
                      className="h-52 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-4 text-sm text-or-bronze hover:text-charbon transition underline underline-offset-4"
                  >
                    Obtenir l&apos;itinéraire
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={160}>
                <div className="yolo-portal-card bg-white border border-black/8 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-or-bronze" />
                    <h3 className="font-display text-xl font-semibold text-charbon">Heures d&apos;ouverture</h3>
                  </div>
                  <ul className="space-y-3">
                    {contactConfig.openingHours.map((row) => (
                      <li key={row.days} className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-[var(--yolo-muted)]">{row.days}</span>
                        <span className="text-charbon font-medium">{row.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={220}>
                <div className="yolo-portal-card bg-white border border-black/8 p-6">
                  <h3 className="font-display text-xl font-semibold text-charbon mb-4">Pourquoi YOLO ?</h3>
                  <ul className="space-y-3">
                    {contactConfig.whyChoose.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[var(--yolo-muted)]">
                        <Check className="h-4 w-4 shrink-0 mt-0.5 text-or-bronze" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={280}>
                <div className="yolo-portal-card bg-amber-500/5 border border-amber-500/20 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-display text-xl font-semibold text-charbon">Support d&apos;urgence</h3>
                  </div>
                  <p className="text-sm text-[var(--yolo-muted)] mb-4">
                    Besoin d&apos;assistance immédiate ? Notre ligne de support est disponible 24/7 à {contactConfig.city}.
                  </p>
                  <a
                    href={telHref}
                    className="inline-flex w-full items-center justify-center border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 hover:bg-amber-500/20 transition"
                  >
                    Contact d&apos;urgence
                  </a>
                </div>
              </ScrollReveal>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter portalId={portalId} />
    </main>
  );
}
