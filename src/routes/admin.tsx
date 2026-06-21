/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminSession } from "@/lib/admin/auth";
import { adminCanAccessPortal } from "@/lib/auth/admin-portal";
import { subscribeAuth } from "@/lib/auth/session";
import { adminPathForScope, connexionSearch } from "@/lib/auth/redirect";

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
      const user = await getAdminSession();
      if (cancelled) return;

      if (!user) {
        setAuthed(false);
        setReady(true);
        navigate({
          to: "/connexion",
          search: connexionSearch("vehicules", "login"),
        });
        return;
      }

      if (!adminCanAccessPortal(user, "vehicules")) {
        setAuthed(false);
        setReady(true);
        navigate({ to: adminPathForScope(user.portalScope) as "/admin" });
        return;
      }

      setAuthed(true);
      setReady(true);
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
