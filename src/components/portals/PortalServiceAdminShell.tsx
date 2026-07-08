/* eslint-disable prettier/prettier */
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { getAdminSession, logout } from "@/lib/admin/auth";
import { adminCanAccessPortal } from "@/lib/auth/admin-portal";
import { adminPathForScope, connexionSearch } from "@/lib/auth/redirect";
import { notifyAuthChange } from "@/lib/auth/session";
import { getPortal, type PortalId } from "@/config/portals";
import { SiteFooter } from "@/components/SiteFooter";
import { YoloLogo } from "@/components/YoloLogo";

export function PortalServiceAdminShell({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getAdminSession().then((user) => {
      if (!user) {
        setAuthed(false);
        setReady(true);
        navigate({
          to: "/connexion",
          search: connexionSearch(portalId, "login"),
        });
        return;
      }

      if (!adminCanAccessPortal(user, portalId)) {
        setAuthed(false);
        setReady(true);
        navigate({ to: adminPathForScope(user.portalScope) as "/admin" });
        return;
      }

      setAuthed(true);
      setReady(true);
    });
  }, [navigate, portal.adminPath, portalId]);

  const handleLogout = () => {
    logout();
    notifyAuthChange();
    navigate({ to: "/connexion", search: connexionSearch(portalId, "login") });
  };

  if (!ready || !authed) return null;

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  const accentActive = "bg-or-vif text-charbon";

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col lg:flex-row font-sans" data-yolo-space>
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-charbon border-b border-white/10 flex items-center justify-between px-4 h-14">
        <YoloLogo variant="yellow" size="sm" subtitle={`Admin · ${portal.name}`} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-charbon border-r border-white/10 flex flex-col transition-transform lg:top-0 lg:bottom-auto lg:sticky lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden lg:flex h-16 px-5 items-center border-b border-white/10">
            <YoloLogo
              variant="white"
              size="sm"
              subtitle={`Admin · ${portal.name}`}
            />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {portal.adminNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to as "/admin-demenagement"}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? accentActive : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="block px-3 py-2 text-sm text-white/55 hover:text-white">
            ← Accueil général
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>
      {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)} />}
      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-[3.75rem] lg:pt-8 yolo-space-main flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <SiteFooter variant="compact" />
      </main>
    </div>
  );
}
