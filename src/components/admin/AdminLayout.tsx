/* eslint-disable prettier/prettier */
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Car, CalendarCheck, Users, UserCog,
  ClipboardList, Settings, LogOut, Menu, X, IdCard, FileText,
} from "lucide-react";
import { useState, type ReactNode, useEffect } from "react";
import { adminConfig } from "@/config/admin";
import { logout } from "@/lib/admin/auth";
import { notifyAuthChange } from "@/lib/auth/session";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { requestAdminBadgesRefresh } from "@/lib/admin/badges";

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
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Topbar mobile */}
      <header className="lg:hidden sticky top-0 z-30 bg-charbon border-b border-white/10 flex items-center justify-between px-4 h-14">
        <Link to="/admin" className="font-display text-lg font-semibold text-white">
          {adminConfig.brand.title}<span className="text-or-vif">.</span>
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded text-white/70 hover:bg-white/10 hover:text-white">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-charbon border-r border-white/10 flex flex-col transition-transform lg:translate-x-0 ${
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

          <div className="relative h-16 px-5 flex items-center justify-between border-b border-white/10">
            <div>
              <p className="font-display text-lg font-semibold leading-tight text-white">
                {adminConfig.brand.title}<span className="text-or-vif">.</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">
                {adminConfig.brand.subtitle} · Location
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1 rounded text-white/60 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
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
        <main className="flex-1 min-w-0 p-4 lg:p-8">{children}</main>
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
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
