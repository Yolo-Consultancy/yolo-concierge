/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminServiceRequests } from "@/lib/portals/service-requests";
import { listMovingMissions, listMovers } from "@/lib/demenagement/store";

export const Route = createFileRoute("/admin-demenagement/")({
  component: AdminDemenagementDashboard,
});

function AdminDemenagementDashboard() {
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);
  const [missionsActive, setMissionsActive] = useState(0);
  const [moversCount, setMoversCount] = useState(0);

  useEffect(() => {
    listAdminServiceRequests("demenagement").then((items) => {
      setTotal(items.length);
      setPending(items.filter((i) => i.status === "nouveau").length);
    });
    listMovingMissions().then((items) => {
      setMissionsActive(items.filter((m) => m.status !== "terminee").length);
    });
    listMovers().then((items) => {
      setMoversCount(items.filter((m) => m.active).length);
    });
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Déménagement</h1>
        <p className="text-muted-foreground text-sm mt-1">Back-office logistique YOLO</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Demandes totales</p>
          <p className="text-4xl font-display font-semibold mt-1">{total}</p>
        </div>
        <div className="bg-card rounded-xl border border-amber-500/30 p-6">
          <p className="text-sm text-muted-foreground">Nouvelles demandes</p>
          <p className="text-4xl font-display font-semibold mt-1">{pending}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Missions actives</p>
          <p className="text-4xl font-display font-semibold mt-1">{missionsActive}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Déménageurs actifs</p>
          <p className="text-4xl font-display font-semibold mt-1">{moversCount}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium">
        <Link to="/admin-demenagement/demandes" className="text-or-vif hover:underline">
          Voir les demandes →
        </Link>
        <Link to="/admin-demenagement/missions" className="text-or-vif hover:underline">
          Gérer les missions →
        </Link>
        <Link to="/admin-demenagement/demenageurs" className="text-or-vif hover:underline">
          Équipe déménageurs →
        </Link>
      </div>
    </>
  );
}
