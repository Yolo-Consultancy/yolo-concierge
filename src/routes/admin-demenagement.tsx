/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { PortalServiceAdminShell } from "@/components/portals/PortalServiceAdminShell";

export const Route = createFileRoute("/admin-demenagement")({
  head: () => ({
    meta: [
      { title: "Admin Déménagement — YOLO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => <PortalServiceAdminShell portalId="demenagement" />,
});
