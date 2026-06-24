/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getPortal, type PortalId } from "@/config/portals";
import {
  listMyServiceRequests,
  STATUS_LABELS,
  STATUS_COLORS,
  type ServiceRequest,
} from "@/lib/portals/service-requests";
import { ScrollReveal } from "@/components/portal-ui/ScrollReveal";
import { toast } from "sonner";

export function ServiceRequestsClientPage({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId);
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyServiceRequests(portal.serviceType)
      .then((data) =>
        setItems(
          [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        ),
      )
      .catch(() => toast.error("Impossible de charger vos demandes."))
      .finally(() => setLoading(false));
  }, [portal.serviceType]);

  return (
    <div>
      <ScrollReveal className="mb-8">
        <h1 className="yolo-page-title">Mes demandes</h1>
        <p className="yolo-page-subtitle">
          Suivi de vos demandes {portal.name.toLowerCase()}.
        </p>
      </ScrollReveal>
      {loading ? (
        <p className="yolo-muted text-sm">Chargement...</p>
      ) : items.length === 0 ? (
        <ScrollReveal>
          <div className="yolo-card rounded-2xl p-10 text-center">
            <p className="yolo-muted text-sm mb-5">Vous n&apos;avez pas encore de demande.</p>
            <Link
              to={portal.publicPath as "/demenagement"}
              className="yolo-portal-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold bg-charbon text-white border border-charbon hover:bg-or-vif hover:text-charbon transition-all duration-300"
            >
              Faire une demande
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <ScrollReveal key={item.id} delayMs={i * 60}>
              <article className="yolo-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-[var(--yolo-ink)]">{item.subject}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <p className="text-sm yolo-muted whitespace-pre-wrap">{item.message}</p>
                <p className="text-xs text-charbon/45 mt-3">
                  Envoyée le {new Date(item.createdAt).toLocaleString("fr-FR")}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
