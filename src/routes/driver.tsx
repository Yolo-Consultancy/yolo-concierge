/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { hydrateCurrentDriver, logoutDriver, type DriverAccount } from "@/lib/driver/auth";
import { connexionSearch } from "@/lib/auth/redirect";
import { notifyAuthChange } from "@/lib/auth/session";
import { toast } from "sonner";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Espace Chauffeur — YOLO Le Concierge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DriverShell,
});

export const DriverContext = createContext<{ account: DriverAccount | null }>({ account: null });

export function useDriverAccount() {
  return useContext(DriverContext);
}

function DriverShell() {
  const [account, setAccount] = useState<DriverAccount | null>(null);
  const [ready, setReady] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    hydrateCurrentDriver().then((acc) => {
      setAccount(acc);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready && !account) {
      navigate({
        to: "/connexion",
        search: connexionSearch("vehicules", "login"),
      });
    }
  }, [ready, account, navigate]);

  const handleLogout = () => {
    logoutDriver();
    notifyAuthChange();
    setAccount(null);
    toast.success("Vous avez été déconnecté.");
    navigate({ to: "/connexion", search: connexionSearch("vehicules", "login") });
  };

  if (!ready || !account) return null;

  const navigation = [
    { to: "/driver", label: "Mes missions", icon: LayoutDashboard, exact: true },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  return (
    <DriverContext.Provider value={{ account }}>
      <div className="min-h-screen bg-charbon text-white flex flex-col lg:flex-row font-sans" data-yolo-space>
        <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-charbon/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 h-16">
          <Link to="/driver" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              YOLO<span className="text-amber-400">.</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-amber-400">Chauffeur</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        <aside
          className={`fixed top-16 bottom-0 left-0 z-40 w-72 bg-charbon border-r border-white/5 flex flex-col transition-transform duration-300 lg:top-0 lg:bottom-auto lg:sticky lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-20 px-8 flex items-center justify-between border-b border-white/5">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-white">
                  YOLO<span className="text-amber-400">.</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400">Chauffeur</span>
              </Link>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
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

          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/driver"}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

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

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 p-6 lg:p-10 pt-[5.5rem] lg:pt-10 flex flex-col bg-charbon relative overflow-y-auto">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400/2.5 blur-[120px] pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </DriverContext.Provider>
  );
}
