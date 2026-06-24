/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalHeader } from "@/components/PortalHeader";
import { PortalHomeLink } from "@/components/PortalHomeLink";
import servicesImg from "@/assets/portal-services.jpg";
import { submitServiceRequest } from "@/lib/portals/service-requests";
import { toast } from "sonner";
import { useClientContactPrefill } from "@/lib/client/form-prefill";

export const Route = createFileRoute("/services-sur-mesure")({
  head: () => ({
    meta: [
      { title: "Services Sur Mesure — YOLO Le Concierge" },
      { name: "description", content: "Événementiel, voyages, assistance professionnelle. Un concierge dédié à vos besoins spécifiques." },
      { property: "og:title", content: "Services Sur Mesure — YOLO" },
      { property: "og:description", content: "Composez votre demande, un concierge s'en occupe." },
    ],
  }),
  component: SurMesure,
});

const categories = [
  { title: "Assistance professionnelle", items: ["Organisation de réunions", "Réservation de salles", "Gestion logistique"] },
  { title: "Événementiel", items: ["Mariages", "Anniversaires", "Séminaires", "Réceptions"] },
  { title: "Voyage & Tourisme", items: ["Réservation d'hôtels", "Billets d'avion", "Organisation de séjours"] },
];

function SurMesure() {
  const { account, fields, fullName, phoneWithCountry } = useClientContactPrefill();
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
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
        phone: prev.phone || phoneWithCountry,
      };
      if (next.name === prev.name && next.email === prev.email && next.phone === prev.phone) {
        return prev;
      }
      return next;
    });
  }, [account?.id, fields, fullName, phoneWithCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await submitServiceRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
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

  return (
    <main className="min-h-screen bg-background">
      <section className="relative h-[60vh] min-h-120 overflow-hidden">
        <PortalHeader portalId="sur-mesure" onAction={() => {
          document.getElementById("demande")?.scrollIntoView({ behavior: "smooth" });
        }} />
        <img src={servicesImg} alt="Conciergerie" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-16 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Portail 03</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-3xl">Services Sur Mesure</h1>
          <p className="mt-4 max-w-xl text-white/80">Un concierge dédié à toutes vos demandes, du quotidien à l'exceptionnel.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12">
        <div id="univers">
          <h2 className="font-display text-3xl mb-8">Nos univers de service</h2>
          <div className="space-y-5">
            {categories.map((c) => (
              <div key={c.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-xl mb-3">{c.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {c.items.map((i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{i}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="demande" className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 self-start sticky top-6">
          <h2 className="font-display text-3xl mb-2">Formulaire personnalisé</h2>
          <p className="text-primary-foreground/70 text-sm mb-6">Décrivez votre besoin, nous revenons vers vous sous 2h.</p>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-gold flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold-foreground"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-display text-xl">Demande envoyée !</p>
              <p className="text-sm text-primary-foreground/70 mt-2">Votre concierge dédié vous contactera très vite.</p>
              <Link
                to="/connexion"
                search={{ portal: "sur-mesure", mode: "register" }}
                className="inline-block mt-6 text-sm text-gold hover:underline"
              >
                Créer un compte pour suivre votre demande →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {account && (
                <p className="text-xs text-gold/90 bg-gold/10 border border-gold/20 rounded-md px-3 py-2">
                  Coordonnées préremplies depuis votre compte.
                </p>
              )}
              <input
                required
                placeholder="Votre nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold"
              />
              <input
                required
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold"
              />
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-gold"
              >
                <option value="" className="bg-primary">Type de service</option>
                {categories.map((c) => <option key={c.title} value={c.title} className="bg-primary">{c.title}</option>)}
              </select>
              <textarea
                required
                rows={4}
                placeholder="Décrivez votre besoin..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gold text-gold-foreground py-3 rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Envoi..." : "Envoyer la demande"}
              </button>
            </form>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-12">
        <PortalHomeLink variant="footer" className="inline-flex text-muted-foreground hover:text-foreground" />
      </div>
    </main>
  );
}
