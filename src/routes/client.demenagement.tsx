/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestsClientPage } from "@/components/portals/ServiceRequestsClientPage";

export const Route = createFileRoute("/client/demenagement")({
  component: () => <ServiceRequestsClientPage portalId="demenagement" />,
});
