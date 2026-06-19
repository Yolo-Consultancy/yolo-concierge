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
import { toast } from "sonner";

export function ServiceRequestsClientPage({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId);
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyServiceRequests(portal.serviceType)
      .then(setItems)
      .catch(() => toast.error("Impossible de charger vos demandes."))
      .finally(() => setLoading(false));
  }, [portal.serviceType]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Mes demandes</h1>
        <p className="text-white/50 text-sm mt-2">Suivi de vos demandes {portal.name.toLowerCase()}.</p>
      </div>
      {loading ? (
        <p className="text-white/40 text-sm">Chargement...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/2 p-10 text-center">
          <p className="text-white/40 text-sm mb-4">Vous n'avez pas encore de demande.</p>
          <Link
            to={portal.publicPath as "/demenagement"}
            className="inline-flex px-5 py-2.5 rounded-xl bg-gold text-gold-foreground text-sm font-medium"
          >
            Faire une demande
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <p className="font-semibold">{item.subject}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>
              <p className="text-sm text-white/55 whitespace-pre-wrap">{item.message}</p>
              <p className="text-xs text-white/35 mt-3">
                Envoyée le {new Date(item.createdAt).toLocaleString("fr-FR")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
