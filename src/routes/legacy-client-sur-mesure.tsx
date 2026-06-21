/* eslint-disable prettier/prettier */
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/legacy-client-sur-mesure")({
  component: () => <Navigate to="/client/sur-mesure" replace />,
});
