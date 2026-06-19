/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { PortalServiceClientShell } from "@/components/portals/PortalServiceClientShell";

export const Route = createFileRoute("/client-sur-mesure")({
  head: () => ({
    meta: [
      { title: "Espace Client Sur Mesure — YOLO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => <PortalServiceClientShell portalId="sur-mesure" />,
});
