/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { Car, CalendarCheck, Users, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { listVehicles, listBookings, listClients, listMissions } from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ vehicles: 0, bookings: 0, clients: 0, revenue: 0, pending: 0, missions: 0 });
  const [recent, setRecent] = useState<ReturnType<typeof listBookings>>([]);

  useEffect(() => {
    const v = listVehicles();
    const b = listBookings();
    const c = listClients();
    const m = listMissions();
    setStats({
      vehicles: v.length,
      bookings: b.length,
      clients: c.length,
      revenue: b.filter((x) => x.status === "payee" || x.status === "terminee").reduce((s, x) => s + x.totalPrice, 0),
      pending: b.filter((x) => x.status === "en_attente").length,
      missions: m.filter((x) => x.status !== "terminee").length,
    });
    setRecent(b.slice(0, 5));
  }, []);

  const cards = [
    { label: "Véhicules", value: stats.vehicles, icon: Car, accent: "bg-blue-500/10 text-blue-600" },
    { label: "Réservations", value: stats.bookings, icon: CalendarCheck, accent: "bg-emerald-500/10 text-emerald-600" },
    { label: "Clients", value: stats.clients, icon: Users, accent: "bg-purple-500/10 text-purple-600" },
    { label: "Revenus (€)", value: formatPrice(stats.revenue), icon: TrendingUp, accent: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité YOLO" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-5">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${c.accent}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold font-display">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm font-semibold mb-1">Réservations en attente</p>
          <p className="text-4xl font-display font-semibold">{stats.pending}</p>
          <p className="text-xs text-muted-foreground mt-2">À valider rapidement</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm font-semibold mb-1">Missions actives</p>
          <p className="text-4xl font-display font-semibold">{stats.missions}</p>
          <p className="text-xs text-muted-foreground mt-2">Affectations en cours</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm font-semibold mb-3">5 dernières réservations</p>
          <ul className="space-y-2 text-sm">
            {recent.map((b) => (
              <li key={b.id} className="flex justify-between gap-2">
                <span className="truncate">{b.clientName}</span>
                <span className="text-muted-foreground text-xs">{b.vehicleName}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-muted-foreground text-xs">Aucune réservation.</li>}
          </ul>
        </div>
      </div>
    </>
  );
}
