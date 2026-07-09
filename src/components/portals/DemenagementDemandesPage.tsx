/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listAdminServiceRequests,
  updateServiceRequestStatus,
  STATUS_LABELS,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/lib/portals/service-requests";
import { DemenagementQuoteDetails, isDemenagementQuote } from "@/components/portals/DemenagementQuoteDetails";
import { requestNavBadgesRefresh } from "@/lib/nav-badges";
import { toast } from "sonner";

const STATUS_STYLES: Record<
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

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
    short: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
  };
}

export function DemenagementDemandesPage() {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ServiceRequestStatus>("all");

  const refresh = () => {
    setLoading(true);
    listAdminServiceRequests("demenagement")
      .then(setItems)
      .catch(() => toast.error("Impossible de charger les demandes."))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

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

  const handleStatus = async (id: string, status: ServiceRequestStatus) => {
    try {
      await updateServiceRequestStatus(id, status);
      toast.success("Statut mis à jour.");
      refresh();
      requestNavBadgesRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action impossible.");
    }
  };

  return (
    <>
      <PageHeader
        title="Demandes clients"
        subtitle={`Déménagement — ${counts.all} demande(s), ${counts.nouveau} nouvelle(s)`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
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
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="yolo-card h-64 animate-pulse rounded-2xl border border-black/6 bg-white/80"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="yolo-card rounded-2xl border border-dashed border-or-vif/25 bg-linear-to-br from-or-vif/5 to-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-or-vif/15">
            <Sparkles className="h-6 w-6 text-or-vif" />
          </div>
          <p className="font-display text-lg font-semibold text-charbon">Aucune demande</p>
          <p className="mt-1 text-sm yolo-muted">
            {filter === "all"
              ? "Les devis envoyés depuis le portail apparaîtront ici."
              : `Aucune demande avec le statut « ${STATUS_LABELS[filter as ServiceRequestStatus]} ».`}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((item) => {
            const styles = STATUS_STYLES[item.status];
            const dates = formatRequestDate(item.createdAt);
            const isQuote = isDemenagementQuote(item.quoteData);

            return (
              <article
                key={item.id}
                className={`yolo-card group overflow-hidden rounded-2xl border border-black/8 border-l-4 ${styles.border} bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.18)]`}
              >
                <div className="border-b border-black/6 bg-linear-to-r from-[var(--yolo-cream)]/80 to-white px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-or-vif/15 font-display text-sm font-bold text-or-bronze shadow-inner">
                      {initials(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-lg font-semibold leading-tight text-charbon">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-xs yolo-muted">Reçue le {dates.full}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-[var(--yolo-cream)]/50 px-2.5 py-1.5 text-xs text-charbon/80 hover:border-or-vif/30 hover:text-charbon"
                      >
                        <Mail className="h-3.5 w-3.5 text-or-vif" />
                        {item.email}
                      </a>
                    )}
                    {item.phone && (
                      <a
                        href={`tel:${item.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-[var(--yolo-cream)]/50 px-2.5 py-1.5 text-xs text-charbon/80 hover:border-or-vif/30 hover:text-charbon"
                      >
                        <Phone className="h-3.5 w-3.5 text-or-vif" />
                        {item.phone}
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-[var(--yolo-cream)]/50 px-2.5 py-1.5 text-xs text-charbon/70">
                      <Calendar className="h-3.5 w-3.5 text-or-vif" />
                      {dates.short}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-bronze mb-1">
                      Objet
                    </p>
                    <p className="font-medium text-charbon">{item.subject}</p>
                  </div>

                  {isQuote ? (
                    <DemenagementQuoteDetails quote={item.quoteData} variant="card" />
                  ) : (
                    <div className="rounded-xl border border-black/8 bg-[var(--yolo-cream)]/40 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charbon/45 mb-2">
                        Message
                      </p>
                      <p className="text-sm leading-relaxed text-charbon/80 whitespace-pre-wrap">
                        {item.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-black/6 bg-[var(--yolo-cream)]/30 px-5 py-3">
                  <span className="mr-auto self-center text-[10px] font-semibold uppercase tracking-wider text-charbon/45">
                    Mettre à jour
                  </span>
                  {(["en_cours", "traite", "annule"] as ServiceRequestStatus[]).map((s) => {
                    const active = item.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatus(item.id, s)}
                        disabled={active}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "bg-charbon text-white shadow-sm cursor-default"
                            : "border border-black/10 bg-white text-charbon hover:border-or-vif/35 hover:bg-or-vif/10"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
