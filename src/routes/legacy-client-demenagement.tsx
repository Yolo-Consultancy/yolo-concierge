/* eslint-disable prettier/prettier */
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/legacy-client-demenagement")({
  component: () => <Navigate to="/client/demenagement" replace />,
});
