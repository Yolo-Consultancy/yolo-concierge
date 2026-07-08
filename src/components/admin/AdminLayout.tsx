/* eslint-disable prettier/prettier */
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Car, CalendarCheck, Users, UserCog,
  ClipboardList, Settings, LogOut, Menu, IdCard, FileText,
} from "lucide-react";
import { useState, type ReactNode, useEffect } from "react";
import { adminConfig } from "@/config/admin";
import { logout } from "@/lib/admin/auth";
import { notifyAuthChange } from "@/lib/auth/session";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { requestAdminBadgesRefresh } from "@/lib/admin/badges";
import { SiteFooter } from "@/components/SiteFooter";
import { YoloLogo } from "@/components/YoloLogo";

type NavBadgeKey = "pendingBookings" | "unreadReports";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: NavBadgeKey;
  alert?: boolean;
};

const nav: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/vehicules", label: "Véhicules", icon: Car },
  { to: "/admin/reservations", label: "Réservations", icon: CalendarCheck, badge: "pendingBookings", alert: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/chauffeurs", label: "Chauffeurs", icon: IdCard },
  { to: "/admin/missions", label: "Missions", icon: ClipboardList },
  { to: "/admin/rapports", label: "Rapports", icon: FileText, badge: "unreadReports", alert: true },
  { to: "/admin/utilisateurs", label: "Équipe YOLO", icon: UserCog },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

function NavBadge({
  count,
  alert,
  active,
}: {
  count: number;
  alert?: boolean;
  active: boolean;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums ${
        active
          ? alert
            ? "bg-black/25 text-black"
            : "bg-black/15 text-black/80"
          : alert
            ? "bg-amber-500 text-black"
            : "bg-white/15 text-white"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const badges = useAdminNavBadges();

  useEffect(() => {
    requestAdminBadgesRefresh();
  }, [path]);

  const handleLogout = () => {
    logout();
    notifyAuthChange();
    navigate({ to: "/connexion", search: { redirect: "/admin" } });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  return (
    <div className="min-h-screen bg-muted/30 text-foreground font-sans" data-yolo-space>
      {/* Topbar mobile */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-charbon border-b border-white/10 flex items-center justify-between px-4 h-14">
        <Link to="/admin">
          <YoloLogo variant="yellow" size="sm" />
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded text-white/70 hover:bg-white/10 hover:text-white">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <div className="flex pt-14 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-charbon border-r border-white/10 flex flex-col transition-transform lg:top-0 lg:bottom-auto lg:sticky lg:h-screen lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{
              background:
                "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(237,179,43,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="hidden lg:flex relative h-16 px-5 items-center border-b border-white/10">
            <div>
              <YoloLogo variant="white" size="sm" to="/admin" />
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                {adminConfig.brand.subtitle} · Location
              </p>
            </div>
          </div>

          <nav className="relative flex-1 overflow-y-auto p-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              const badgeCount = item.badge ? badges[item.badge] : 0;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/admin"}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-or-vif text-black shadow-sm shadow-or-vif/20"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  <NavBadge count={badgeCount} alert={item.alert} active={active} />
                </Link>
              );
            })}
          </nav>

          <div className="relative p-3 border-t border-white/10 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/55 hover:bg-white/5 hover:text-white transition-colors"
            >
              ← Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </aside>

        {open && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)} />
        )}

        {/* Contenu */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 yolo-space-main flex flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter variant="compact" />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="yolo-page-title">{title}</h1>
        {subtitle && <p className="yolo-page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
