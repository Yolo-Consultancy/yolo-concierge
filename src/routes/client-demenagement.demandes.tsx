/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestsClientPage } from "@/components/portals/ServiceRequestsClientPage";

export const Route = createFileRoute("/client-demenagement/demandes")({
  component: () => <ServiceRequestsClientPage portalId="demenagement" />,
});
