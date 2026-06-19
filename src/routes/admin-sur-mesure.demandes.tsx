/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestsAdminPage } from "@/components/portals/ServiceRequestsAdminPage";

export const Route = createFileRoute("/admin-sur-mesure/demandes")({
  component: () => <ServiceRequestsAdminPage portalId="sur-mesure" />,
});
