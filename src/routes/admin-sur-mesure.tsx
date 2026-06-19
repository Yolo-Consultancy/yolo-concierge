/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { PortalServiceAdminShell } from "@/components/portals/PortalServiceAdminShell";

export const Route = createFileRoute("/admin-sur-mesure")({
  head: () => ({
    meta: [
      { title: "Admin Sur Mesure — YOLO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => <PortalServiceAdminShell portalId="sur-mesure" />,
});
