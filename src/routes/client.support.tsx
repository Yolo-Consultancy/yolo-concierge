/* eslint-disable prettier/prettier */
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/client/support")({
  component: () => <Navigate to="/client" replace />,
});
