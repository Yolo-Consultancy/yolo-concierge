/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { DemenagementDemandesPage } from "@/components/portals/DemenagementDemandesPage";

export const Route = createFileRoute("/admin-demenagement/demandes")({
  component: DemenagementDemandesPage,
});
