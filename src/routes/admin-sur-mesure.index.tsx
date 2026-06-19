/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/AdminLayout";
import { listAdminServiceRequests } from "@/lib/portals/service-requests";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin-sur-mesure/")({
  component: AdminSurMesureDashboard,
});

function AdminSurMesureDashboard() {
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    listAdminServiceRequests("sur_mesure").then((items) => {
      setTotal(items.length);
      setPending(items.filter((i) => i.status === "nouveau").length);
    });
  }, []);

  return (
    <>
      <PageHeader title="Services Sur Mesure" subtitle="Back-office conciergerie YOLO" />
      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Demandes totales</p>
          <p className="text-4xl font-display font-semibold mt-1">{total}</p>
        </div>
        <div className="bg-card rounded-xl border border-amber-500/30 p-6">
          <p className="text-sm text-muted-foreground">Nouvelles demandes</p>
          <p className="text-4xl font-display font-semibold mt-1">{pending}</p>
        </div>
      </div>
      <Link
        to="/admin-sur-mesure/demandes"
        className="inline-flex mt-6 text-sm font-medium text-gold hover:underline"
      >
        Voir toutes les demandes →
      </Link>
    </>
  );
}
