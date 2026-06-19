/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { PortalServiceClientShell } from "@/components/portals/PortalServiceClientShell";

export const Route = createFileRoute("/client-demenagement")({
  head: () => ({
    meta: [
      { title: "Espace Client Déménagement — YOLO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => <PortalServiceClientShell portalId="demenagement" />,
});
