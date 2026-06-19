/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { validateAdminSession } from "@/lib/admin/auth";
import { subscribeAuth } from "@/lib/auth/session";
import { connexionSearch } from "@/lib/auth/redirect";

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
    let cancelled = false;

    const check = async () => {
      const ok = await validateAdminSession();
      if (cancelled) return;
      setAuthed(ok);
      setReady(true);
      if (!ok) {
        navigate({
          to: "/connexion",
          search: connexionSearch("vehicules", "login"),
        });
      }
    };

    void check();
    const unsub = subscribeAuth(() => { void check(); });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [navigate]);

  if (!ready || !authed) return null;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
