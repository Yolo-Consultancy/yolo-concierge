/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { getCurrentClient, logoutClient, type ClientAccount } from "@/lib/client/auth";
import { notifyAuthChange } from "@/lib/auth/session";
import { toast } from "sonner";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Espace Client — YOLO Le Concierge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClientShell,
});

// ─── CLIENT CONTEXT FOR CHILD ROUTES ─────────────────────────────────────────
export const ClientContext = createContext<{ account: ClientAccount | null }>({ account: null });

export function useClientAccount() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClientAccount must be used within a ClientContext.Provider");
  }
  return context;
}

function ClientShell() {
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [ready, setReady] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAccount(getCurrentClient());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !account) {
      navigate({
        to: "/connexion",
        search: { espace: "client", redirect: "/client" },
      });
    }
  }, [ready, account, navigate]);

  const handleLogout = () => {
    logoutClient();
    notifyAuthChange();
    setAccount(null);
    toast.success("Vous avez été déconnecté.");
    navigate({ to: "/connexion", search: { espace: "client", redirect: "/client" } });
  };

  if (!ready || !account) return null;

  // ─── CLIENT PORTAL LAYOUT SHELL ───────────────────────────────────────────
  const navigation = [
    { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { to: "/client/reservations", label: "Mes Réservations", icon: CalendarCheck },
    { to: "/client/support", label: "Chat Support", icon: MessageSquare },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  return (
    <ClientContext.Provider value={{ account }}>
      <div className="min-h-screen bg-[#070708] text-white flex flex-col lg:flex-row font-sans">
        {/* Mobile Topbar */}
        <header className="lg:hidden shrink-0 sticky top-0 z-30 bg-[#0f0f11]/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 h-16">
          <Link to="/client" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              YOLO<span className="text-[#7dd3fc]">.</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#7dd3fc]">Client</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Sidebar navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0c0c0e] border-r border-white/5 flex flex-col transition-transform duration-300 lg:sticky lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="h-20 px-8 flex items-center justify-between border-b border-white/5">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-white">
                  YOLO<span className="text-[#7dd3fc]">.</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7dd3fc]">Client</span>
              </Link>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Client User Profile Info Card */}
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#7dd3fc]/10 border border-[#7dd3fc]/20 flex items-center justify-center text-[#7dd3fc] font-bold">
                {account.firstName[0].toUpperCase()}
                {account.lastName[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {account.firstName} {account.lastName}
                </p>
                <p className="text-xs text-white/40 truncate">{account.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/client"}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#7dd3fc] text-black shadow-lg shadow-[#7dd3fc]/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/5 space-y-1.5">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <Compass className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Backdrop mobile sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content page area */}
        <main className="flex-1 min-w-0 p-6 lg:p-10 flex flex-col bg-[#070708] relative overflow-y-auto">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#7dd3fc]/2.5 blur-[120px] pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </ClientContext.Provider>
  );
}
