/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Check, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import {
  listTripReports,
  markTripReportRead,
  listRatings,
  type TripReport,
  type ClientRating,
} from "@/lib/admin/store";
import { toast } from "sonner";
import { requestAdminBadgesRefresh } from "@/lib/admin/badges";

export const Route = createFileRoute("/admin/rapports")({ component: RapportsPage });

function RapportsPage() {
  const [reports, setReports] = useState<TripReport[]>([]);
  const [ratings, setRatings] = useState<ClientRating[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    Promise.all([listTripReports(), listRatings()])
      .then(([r, rt]) => {
        setReports(r);
        setRatings(rt);
      })
      .catch(() => toast.error("Impossible de charger les rapports."))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markTripReportRead(id);
      toast.success("Rapport marqué comme lu.");
      refresh();
      requestAdminBadgesRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action impossible.");
    }
  };

  return (
    <>
      <PageHeader
        title="Rapports de course"
        subtitle="Comptes-rendus des chauffeurs et avis clients"
      />

      {loading ? (
        <p className="text-muted-foreground text-sm">Chargement...</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <FileText className="h-5 w-5 text-or-vif" />
              Rapports chauffeurs ({reports.length})
            </h2>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-8 text-center">
                Aucun rapport pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <article
                    key={r.id}
                    className={`rounded-xl border p-4 bg-card ${
                      r.status === "soumis" ? "border-amber-500/30" : "border-border"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium">{r.driverName}</p>
                        <p className="text-sm text-muted-foreground">
                          {r.clientName} · {r.vehicleName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(r.submittedAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.status === "soumis"
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-emerald-500/15 text-emerald-700"
                        }`}
                      >
                        {r.status === "soumis" ? "Nouveau" : "Lu"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap mt-3">{r.notes}</p>
                    {r.incidents && (
                      <p className="text-sm text-amber-700 mt-2">
                        <strong>Incidents :</strong> {r.incidents}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      {r.odometerEnd != null && <span>Km fin : {r.odometerEnd}</span>}
                      {r.fuelLevel && <span>Carburant : {r.fuelLevel}</span>}
                      <span>
                        E-mail client :{" "}
                        {r.ratingEmailSent
                          ? "envoyé"
                          : r.clientEmail
                            ? "en attente d'envoi"
                            : "non envoyé (pas d'e-mail)"}
                      </span>
                    </div>
                    {r.status === "soumis" && (
                      <button
                        onClick={() => handleMarkRead(r.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-or-vif hover:underline"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Marquer comme lu
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Star className="h-5 w-5 text-amber-500" />
              Avis clients ({ratings.length})
            </h2>
            {ratings.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-8 text-center">
                Aucun avis reçu pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {ratings.map((rt) => (
                  <article key={rt.id} className="rounded-xl border border-border p-4 bg-card">
                    <p className="font-medium text-sm">{rt.clientName}</p>
                    <p className="text-xs text-muted-foreground">Chauffeur : {rt.driverName}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>Service : {"★".repeat(rt.serviceScore)}{"☆".repeat(5 - rt.serviceScore)}</span>
                      <span>Chauffeur : {"★".repeat(rt.driverScore)}{"☆".repeat(5 - rt.driverScore)}</span>
                    </div>
                    {rt.comment && (
                      <p className="text-sm text-amber-700 mt-2">
                        <strong>À améliorer :</strong> {rt.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(rt.submittedAt).toLocaleString("fr-FR")}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
