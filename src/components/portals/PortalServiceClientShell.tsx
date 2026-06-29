/* eslint-disable prettier/prettier */
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext } from "react";
import { LogOut, Menu, X, Compass } from "lucide-react";
import { hydrateCurrentClient, logoutClient, type ClientAccount } from "@/lib/client/auth";
import { connexionSearch } from "@/lib/auth/redirect";
import { notifyAuthChange } from "@/lib/auth/session";
import { getPortal, type PortalId } from "@/config/portals";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";

const PortalClientContext = createContext<{ account: ClientAccount | null; portalId: PortalId }>({
  account: null,
  portalId: "demenagement",
});

export function usePortalClientAccount() {
  return useContext(PortalClientContext);
}

export function PortalServiceClientShell({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId);
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [ready, setReady] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    hydrateCurrentClient().then((acc) => {
      setAccount(acc);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready && !account) {
      navigate({
        to: "/connexion",
        search: connexionSearch(portalId, "login"),
      });
    }
  }, [ready, account, navigate, portal.clientPath, portalId]);

  const handleLogout = () => {
    logoutClient();
    notifyAuthChange();
    setAccount(null);
    toast.success("Vous avez été déconnecté.");
    navigate({
      to: "/connexion",
      search: connexionSearch(portalId, "login"),
    });
  };

  if (!ready || !account) return null;

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  const accentActive = "bg-or-vif text-charbon shadow-lg shadow-or-vif/10";

  return (
    <PortalClientContext.Provider value={{ account, portalId }}>
      <div className="min-h-screen bg-charbon text-white flex font-sans" data-yolo-space>
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r border-white/10 bg-charbon flex flex-col transition-transform lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <div>
              <p className="font-display text-lg font-semibold">
                YOLO<span className={portal.accentClass}>.</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">{portal.name}</p>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-white/50">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1.5">
            {portal.clientNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/client"}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active ? accentActive : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/5 space-y-1.5">
            <Link
              to={portal.publicPath as "/demenagement"}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5"
            >
              <Compass className="h-4 w-4" />
              Retour au portail
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 text-left"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </aside>
        {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/70" onClick={() => setOpen(false)} />}
        <main className="flex-1 min-w-0 p-6 lg:p-10 flex flex-col">
          <button onClick={() => setOpen(true)} className="lg:hidden mb-4 p-2 rounded-lg border border-white/10">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Outlet />
          </div>
          <SiteFooter variant="compact" />
        </main>
      </div>
    </PortalClientContext.Provider>
  );
}
