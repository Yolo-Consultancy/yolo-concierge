/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { SectionLabel } from "@/components/portal-ui/SectionLabel";
import { PortalButton } from "@/components/portal-ui/PortalButton";
import servicesImg from "@/assets/portal-services.jpg";
import { submitServiceRequest } from "@/lib/portals/service-requests";
import { toast } from "sonner";
import { useClientContactPrefill } from "@/lib/client/form-prefill";
import { ContactPhoneField } from "@/components/ContactPhoneField";
import { phoneDigitsOnly, phoneMaxLength } from "@/lib/phone-field";

export const Route = createFileRoute("/services-sur-mesure")({
  head: () => ({
    meta: [
      { title: "Services Sur Mesure — YOLO Le Concierge" },
      {
        name: "description",
        content:
          "Événementiel, voyages, assistance professionnelle. Un concierge dédié à vos besoins spécifiques.",
      },
      { property: "og:title", content: "Services Sur Mesure — YOLO" },
      { property: "og:description", content: "Composez votre demande, un concierge s'en occupe." },
    ],
  }),
  component: SurMesure,
});

const categories = [
  {
    title: "Assistance professionnelle",
    items: ["Organisation de réunions", "Réservation de salles", "Gestion logistique"],
  },
  {
    title: "Événementiel",
    items: ["Mariages", "Anniversaires", "Séminaires", "Réceptions"],
  },
  {
    title: "Voyage & Tourisme",
    items: ["Réservation d'hôtels", "Billets d'avion", "Organisation de séjours"],
  },
];

function SurMesure() {
  const { account, fields, fullName } = useClientContactPrefill();
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+243",
    phone: "",
    category: "",
    message: "",
  });

  useEffect(() => {
    if (!account?.id) return;
    setForm((prev) => {
      const next = {
        ...prev,
        name: prev.name || fullName,
        email: prev.email || fields.email,
        countryCode: prev.countryCode === "+243" && fields.countryCode ? fields.countryCode : prev.countryCode,
        phone: prev.phone || fields.phone,
      };
      if (
        next.name === prev.name &&
        next.email === prev.email &&
        next.countryCode === prev.countryCode &&
        next.phone === prev.phone
      ) {
        return prev;
      }
      return next;
    });
  }, [account?.id, fields, fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await submitServiceRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() ? `${form.countryCode} ${form.phone}`.trim() : "",
        subject: form.category || "Demande sur mesure",
        message: form.message.trim(),
        serviceType: "sur_mesure",
      });
      setSent(true);
      toast.success("Votre demande a bien été envoyée.");
    } catch {
      toast.error("Impossible d'envoyer votre demande. Réessayez plus tard.");
    } finally {
      setSaving(false);
    }
  };

  const darkInputCls =
    "w-full bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-or-vif rounded-none";

  return (
    <main className="min-h-screen font-sans antialiased" data-yolo-portal data-yolo-portal-light>
      <PortalHeader
        portalId="sur-mesure"
        onAction={() => {
          document.getElementById("demande")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <section className="relative min-h-[75vh] flex flex-col overflow-hidden bg-charbon text-white">
        <img
          src={servicesImg}
          alt="Conciergerie sur mesure"
          className="yolo-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-charbon/92 via-charbon/55 to-charbon/30" />
        <div className="relative z-10 mx-auto flex flex-1 w-full max-w-6xl flex-col items-center justify-end px-6 pb-16 pt-28 md:pb-24">
          <ScrollReveal className="yolo-hero-content">
            <SectionLabel>Conciergerie · Sur mesure</SectionLabel>
            <h1 className="max-w-2xl text-[clamp(2.4rem,5vw,3.75rem)] font-bold leading-[1.08]">
              Votre demande,
              <br />
              <span className="text-or-vif">notre priorité.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/78">
              Événementiel, voyages, assistance pro — un concierge dédié s&apos;occupe de tout, du quotidien
              à l&apos;exceptionnel.
            </p>
            <div className="yolo-hero-actions mt-9">
              <a href="#demande">
                <PortalButton variant="primary">
                  Décrire mon besoin
                  <ArrowRight className="h-4 w-4" />
                </PortalButton>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section id="univers" className="yolo-section-light py-20 md:py-28 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16">
          <ScrollReveal>
            <SectionLabel>Nos univers</SectionLabel>
            <h2 className="text-[clamp(1.85rem,3vw,2.75rem)] font-bold text-charbon mb-8">
              Trois domaines, une seule équipe
            </h2>
            <div className="space-y-5">
              {categories.map((c, i) => (
                <ScrollReveal key={c.title} delayMs={i * 70}>
                  <div className="yolo-portal-card bg-white border border-black/8 p-6">
                    <h3 className="font-display text-xl font-semibold text-charbon mb-3">{c.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {c.items.map((item) => (
                        <span
                          key={item}
                          className="text-xs px-3 py-1.5 bg-[var(--yolo-cream)] text-charbon border border-black/6"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={120}>
            <div
              id="demande"
              className="bg-charbon text-white p-8 md:p-10 sticky top-6 border border-charbon"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Votre demande</h2>
              <p className="text-white/65 text-sm mb-6">Réponse sous 2 h en moyenne.</p>

              {sent ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto bg-or-vif flex items-center justify-center mb-4">
                    <Check className="h-7 w-7 text-charbon" strokeWidth={3} />
                  </div>
                  <p className="font-display text-xl font-semibold">Demande envoyée</p>
                  <p className="text-sm text-white/65 mt-2">Votre concierge vous contactera très vite.</p>
                  <Link
                    to="/connexion"
                    search={{ portal: "sur-mesure", mode: "register" }}
                    className="inline-block mt-6 text-sm text-or-vif hover:underline"
                  >
                    Créer un compte pour suivre votre demande →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {account && (
                    <p className="text-xs text-or-vif bg-or-vif/10 border border-or-vif/25 px-3 py-2">
                      Coordonnées préremplies depuis votre compte.
                    </p>
                  )}
                  <input
                    required
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={darkInputCls}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={darkInputCls}
                  />
                  <ContactPhoneField
                    required
                    variant="dark"
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
                    inputCls={darkInputCls}
                  />
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={darkInputCls}
                  >
                    <option value="" className="bg-charbon text-white">
                      Type de service
                    </option>
                    {categories.map((c) => (
                      <option key={c.title} value={c.title} className="bg-charbon text-white">
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    required
                    rows={4}
                    placeholder="Décrivez votre besoin..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${darkInputCls} resize-none`}
                  />
                  <PortalButton variant="primary" type="submit" disabled={saving} className="w-full">
                    {saving ? "Envoi..." : "Envoyer la demande"}
                  </PortalButton>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter portalId="sur-mesure" />
    </main>
  );
}
