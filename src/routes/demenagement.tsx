/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { PortalComingSoon } from "@/components/PortalComingSoon";

export const Route = createFileRoute("/demenagement")({
  head: () => ({
    meta: [
      { title: "YOLO Le Concierge" },
      { name: "description", content: "Bientôt disponible." },
      { property: "og:title", content: "YOLO Le Concierge" },
      { property: "og:description", content: "Bientôt disponible." },
    ],
  }),
  component: Demenagement,
});

function Demenagement() {
  return <PortalComingSoon />;
}
