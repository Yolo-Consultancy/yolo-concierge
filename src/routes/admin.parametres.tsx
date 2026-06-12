/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/parametres")({ component: SettingsPage });

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function SettingsPage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getSettings().then(setS); }, []);
  if (!s) return null;

  const save = () => { void saveSettings(s).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }); };

  return (
    <>
      <PageHeader title="Paramètres du site" subtitle="Coordonnées, contenus et préférences globales" />

      <div className="max-w-2xl space-y-6">
        <section className="bg-card rounded-xl border border-border p-6 space-y-3">
          <h2 className="font-semibold text-sm mb-2">Identité</h2>
          <label className="block">
            <span className="text-xs text-muted-foreground">Nom de l'entreprise</span>
            <input className={`${inputCls} mt-1`} value={s.companyName} onChange={(e) => setS({ ...s, companyName: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Adresse</span>
            <input className={`${inputCls} mt-1`} value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} />
          </label>
        </section>

        <section className="bg-card rounded-xl border border-border p-6 space-y-3">
          <h2 className="font-semibold text-sm mb-2">Contact</h2>
          <label className="block">
            <span className="text-xs text-muted-foreground">Email de contact</span>
            <input className={`${inputCls} mt-1`} value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">WhatsApp (format international, sans +)</span>
            <input className={`${inputCls} mt-1`} value={s.whatsappNumber} onChange={(e) => setS({ ...s, whatsappNumber: e.target.value })} />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Sera utilisé dans le bouton de réservation. Synchronise aussi avec <code>src/config/booking.ts</code>.
            </span>
          </label>
        </section>

        <section className="bg-card rounded-xl border border-border p-6 space-y-3">
          <h2 className="font-semibold text-sm mb-2">Page d'accueil</h2>
          <label className="block">
            <span className="text-xs text-muted-foreground">Titre principal</span>
            <input className={`${inputCls} mt-1`} value={s.heroTitle} onChange={(e) => setS({ ...s, heroTitle: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Sous-titre</span>
            <textarea className={`${inputCls} mt-1`} rows={2} value={s.heroSubtitle} onChange={(e) => setS({ ...s, heroSubtitle: e.target.value })} />
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90">
            Enregistrer les paramètres
          </button>
          {saved && <span className="text-emerald-600 text-sm">✓ Enregistré</span>}
        </div>
      </div>
    </>
  );
}
