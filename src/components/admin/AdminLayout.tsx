/* eslint-disable prettier/prettier */
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Car, CalendarCheck, Users, UserCog,
  ClipboardList, Settings, LogOut, Menu, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { adminConfig } from "@/config/admin";
import { logout } from "@/lib/admin/auth";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/vehicules", label: "Véhicules", icon: Car },
  { to: "/admin/reservations", label: "Réservations", icon: CalendarCheck },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/missions", label: "Missions", icon: ClipboardList },
  { to: "/admin/utilisateurs", label: "Équipe YOLO", icon: UserCog },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin" });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Topbar mobile */}
      <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <Link to="/admin" className="font-display text-lg font-semibold">
          {adminConfig.brand.title}
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-muted">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 px-5 flex items-center justify-between border-b border-border">
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                {adminConfig.brand.title}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {adminConfig.brand.subtitle}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1 rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ← Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10"
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
