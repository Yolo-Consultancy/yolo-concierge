/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isAuthenticated } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace Administrateur — YOLO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminShell,
});

function AdminShell() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthed(isAuthenticated());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !authed) {
      navigate({
        to: "/connexion",
        search: { espace: "admin", redirect: "/admin" },
      });
    }
  }, [ready, authed, navigate]);

  if (!ready || !authed) return null;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
