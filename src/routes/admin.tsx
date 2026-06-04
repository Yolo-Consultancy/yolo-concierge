/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoginGate } from "@/components/admin/LoginGate";
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

  useEffect(() => {
    setAuthed(isAuthenticated());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
