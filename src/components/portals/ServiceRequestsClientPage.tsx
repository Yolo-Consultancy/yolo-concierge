/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Plus, Sparkles, Truck } from "lucide-react";
import { getPortal, type PortalId } from "@/config/portals";
import {
  listMyServiceRequests,
  STATUS_LABELS,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/lib/portals/service-requests";
import {
  formatQuoteRouteTitle,
  resolveDemenagementQuote,
} from "@/lib/demenagement/quote";
import { DemenagementQuoteDetails } from "@/components/portals/DemenagementQuoteDetails";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { toast } from "sonner";

const CLIENT_STATUS_STYLES: Record<
  ServiceRequestStatus,
  { badge: string; border: string; dot: string }
> = {
  nouveau: {
    badge: "bg-or-vif/15 text-or-bronze border-or-vif/30",
    border: "border-l-or-vif",
    dot: "bg-or-vif",
  },
  en_cours: {
    badge: "bg-blue-500/12 text-blue-800 border-blue-500/25",
    border: "border-l-blue-500",
    dot: "bg-blue-500",
  },
  traite: {
    badge: "bg-emerald-500/12 text-emerald-800 border-emerald-500/25",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
  },
  annule: {
    badge: "bg-black/5 text-charbon/60 border-black/10",
    border: "border-l-charbon/25",
    dot: "bg-charbon/35",
  },
};

const FILTER_OPTIONS: { id: "all" | ServiceRequestStatus; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "nouveau", label: "Nouvelles" },
  { id: "en_cours", label: "En cours" },
  { id: "traite", label: "Traitées" },
  { id: "annule", label: "Annulées" },
];

function formatRequestDate(iso: string) {
  const date = new Date(iso);
  return {
    full: date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    short: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
  };
}

function DemenagementRequestCard({ item }: { item: ServiceRequest }) {
  const styles = CLIENT_STATUS_STYLES[item.status];
  const dates = formatRequestDate(item.createdAt);
  const quote = resolveDemenagementQuote(item.quoteData, item.message);
  const routeTitle = quote ? formatQuoteRouteTitle(quote) : item.subject;

  return (
    <article
      className={`yolo-card overflow-hidden rounded-2xl border border-black/8 border-l-4 ${styles.border} bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.18)]`}
    >
      <div className="border-b border-black/6 bg-linear-to-r from-[var(--yolo-cream)]/90 to-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-or-vif/15 text-or-vif">
              <Truck className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold leading-snug text-charbon">
              {routeTitle}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs yolo-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-or-vif" />
                Envoyée le {dates.full}
              </span>
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {STATUS_LABELS[item.status]}
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        {quote ? (
          <DemenagementQuoteDetails quote={quote} variant="card" />
        ) : (
          <div className="rounded-xl border border-black/8 bg-[var(--yolo-cream)]/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charbon/45 mb-2">
              Détails de la demande
            </p>
            <p className="text-sm leading-relaxed text-charbon/80 whitespace-pre-wrap line-clamp-6">
              {item.message}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-black/6 bg-[var(--yolo-cream)]/25 px-5 py-3">
        <p className="text-[11px] text-charbon/50">
          {item.status === "nouveau" && "Votre demande a bien été reçue. Notre équipe vous recontactera sous 24 h."}
          {item.status === "en_cours" && "Votre dossier est en cours de traitement par notre équipe logistique."}
          {item.status === "traite" && "Cette demande a été traitée. Merci de votre confiance."}
          {item.status === "annule" && "Cette demande a été annulée."}
        </p>
      </div>
    </article>
  );
}

function GenericRequestCard({ item }: { item: ServiceRequest }) {
  const styles = CLIENT_STATUS_STYLES[item.status];
  const dates = formatRequestDate(item.createdAt);

  return (
    <article
      className={`yolo-card overflow-hidden rounded-2xl border border-black/8 border-l-4 ${styles.border} bg-white p-5`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <p className="font-display text-lg font-semibold text-charbon">{item.subject}</p>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${styles.badge}`}>
          {STATUS_LABELS[item.status]}
        </span>
      </div>
      <p className="text-sm yolo-muted whitespace-pre-wrap leading-relaxed">{item.message}</p>
      <p className="text-xs text-charbon/45 mt-4 flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        Envoyée le {dates.full}
      </p>
    </article>
  );
}

export function ServiceRequestsClientPage({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId);
  const isDemenagement = portalId === "demenagement";
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ServiceRequestStatus>("all");

  useEffect(() => {
    listMyServiceRequests(portal.serviceType)
      .then((data) =>
        setItems([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
      )
      .catch(() => toast.error("Impossible de charger vos demandes."))
      .finally(() => setLoading(false));
  }, [portal.serviceType]);

  const counts = useMemo(
    () => ({
      all: items.length,
      nouveau: items.filter((i) => i.status === "nouveau").length,
      en_cours: items.filter((i) => i.status === "en_cours").length,
      traite: items.filter((i) => i.status === "traite").length,
      annule: items.filter((i) => i.status === "annule").length,
    }),
    [items],
  );

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );

  return (
    <div>
      <ScrollReveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="yolo-page-title">Mes demandes</h1>
          <p className="yolo-page-subtitle">
            Suivi de vos demandes {portal.name.toLowerCase()}.
          </p>
        </div>
        <Link
          to={portal.publicPath as "/demenagement"}
          className="inline-flex items-center gap-2 rounded-xl bg-or-vif px-4 py-2.5 text-sm font-semibold text-charbon shadow-sm transition hover:bg-or-vif/90"
        >
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </Link>
      </ScrollReveal>

      {items.length > 0 && (
        <ScrollReveal className="mb-6 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.id;
            const count = counts[opt.id];
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-or-vif/40 bg-or-vif/12 text-charbon shadow-sm"
                    : "border-black/8 bg-white text-charbon/70 hover:border-or-vif/25 hover:bg-or-vif/5"
                }`}
              >
                {opt.label}
                <span
                  className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    active ? "bg-or-vif text-charbon" : "bg-black/5 text-charbon/55"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </ScrollReveal>
      )}

      {loading ? (
        <div className={`grid gap-5 ${isDemenagement ? "lg:grid-cols-2" : ""}`}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="yolo-card h-56 animate-pulse rounded-2xl border border-black/6 bg-white/80"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ScrollReveal>
          <div className="yolo-card rounded-2xl border border-dashed border-or-vif/25 bg-linear-to-br from-or-vif/5 to-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-or-vif/15">
              <Sparkles className="h-6 w-6 text-or-vif" />
            </div>
            <p className="font-display text-lg font-semibold text-charbon">Aucune demande</p>
            <p className="mt-1 text-sm yolo-muted mb-6">
              Vous n&apos;avez pas encore envoyé de demande de devis.
            </p>
            <Link
              to={portal.publicPath as "/demenagement"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-charbon px-6 py-3 text-sm font-semibold text-white transition hover:bg-or-vif hover:text-charbon"
            >
              <MapPin className="h-4 w-4" />
              Demander un devis
            </Link>
          </div>
        </ScrollReveal>
      ) : filtered.length === 0 ? (
        <div className="yolo-card rounded-2xl border border-dashed border-black/10 p-10 text-center">
          <p className="text-sm yolo-muted">
            Aucune demande avec le statut « {STATUS_LABELS[filter as ServiceRequestStatus]} ».
          </p>
        </div>
      ) : (
        <div className={`grid gap-5 ${isDemenagement ? "lg:grid-cols-2" : ""}`}>
          {filtered.map((item, i) => (
            <ScrollReveal key={item.id} delayMs={i * 60}>
              {isDemenagement ? (
                <DemenagementRequestCard item={item} />
              ) : (
                <GenericRequestCard item={item} />
              )}
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
