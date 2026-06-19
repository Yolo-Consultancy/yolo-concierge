/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePortalClientAccount } from "@/components/portals/PortalServiceClientShell";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/client-demenagement/")({
  component: ClientDemenagementDashboard,
});

function ClientDemenagementDashboard() {
  const { account } = usePortalClientAccount();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">
        Bonjour, {account?.firstName}
      </h1>
      <p className="text-white/50 text-sm mb-8">Votre espace déménagement YOLO Le Concierge.</p>
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <Link
          to="/client-demenagement/demandes"
          className="rounded-2xl border border-white/10 bg-white/2 p-6 hover:border-gold/30 transition"
        >
          <ClipboardList className="h-8 w-8 text-gold mb-3" />
          <p className="font-semibold">Mes demandes</p>
          <p className="text-sm text-white/50 mt-1">Suivre vos devis et interventions</p>
        </Link>
        <Link
          to="/demenagement"
          className="rounded-2xl border border-white/10 bg-white/2 p-6 hover:border-gold/30 transition"
        >
          <p className="font-semibold">Nouveau devis</p>
          <p className="text-sm text-white/50 mt-1">Demander un déménagement assisté</p>
        </Link>
      </div>
    </div>
  );
}
