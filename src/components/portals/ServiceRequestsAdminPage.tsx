/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { getPortal, type PortalId } from "@/config/portals";
import {
  listAdminServiceRequests,
  updateServiceRequestStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/lib/portals/service-requests";
import { DemenagementQuoteDetails, isDemenagementQuote } from "@/components/portals/DemenagementQuoteDetails";
import { toast } from "sonner";

export function ServiceRequestsAdminPage({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId);
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listAdminServiceRequests(portal.serviceType)
      .then(setItems)
      .catch(() => toast.error("Impossible de charger les demandes."))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [portal.serviceType]);

  const handleStatus = async (id: string, status: ServiceRequestStatus) => {
    try {
      await updateServiceRequestStatus(id, status);
      toast.success("Statut mis à jour.");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action impossible.");
    }
  };

  const pending = items.filter((i) => i.status === "nouveau").length;

  return (
    <>
      <PageHeader
        title="Demandes clients"
        subtitle={`${portal.name} — ${items.length} demande(s), ${pending} nouvelle(s)`}
      />
      {loading ? (
        <p className="text-sm yolo-muted">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="text-sm yolo-muted yolo-card rounded-xl border-dashed p-10 text-center">
          Aucune demande pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="yolo-card rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium text-[var(--yolo-ink)]">{item.name}</p>
                  <p className="text-sm yolo-muted">{item.email} · {item.phone}</p>
                  <p className="text-xs yolo-muted mt-1">
                    {new Date(item.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>
              <p className="text-sm font-medium mt-2 text-[var(--yolo-ink)]">{item.subject}</p>
              {isDemenagementQuote(item.quoteData) ? (
                <DemenagementQuoteDetails quote={item.quoteData} />
              ) : (
                <p className="text-sm yolo-muted mt-2 whitespace-pre-wrap">{item.message}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {(["en_cours", "traite", "annule"] as ServiceRequestStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(item.id, s)}
                    disabled={item.status === s}
                    className="text-xs px-3 py-1.5 rounded-md border border-black/10 bg-white hover:bg-[var(--yolo-cream)] disabled:opacity-40 text-charbon"
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
