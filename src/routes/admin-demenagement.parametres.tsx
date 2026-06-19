/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin-demenagement/parametres")({
  component: () => (
    <>
      <PageHeader title="Paramètres" subtitle="Configuration du portail déménagement" />
      <p className="text-sm text-muted-foreground mb-4">
        Les paramètres globaux (e-mail, contact) sont gérés dans le back-office location.
      </p>
      <Link to="/admin/parametres" className="text-sm text-gold hover:underline">
        Ouvrir les paramètres globaux →
      </Link>
    </>
  ),
});
