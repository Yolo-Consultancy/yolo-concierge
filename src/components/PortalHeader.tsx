/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import { Menu, LogOut, User, Shield, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getClientSession,
  logoutSession,
  subscribeAuth,
} from "@/lib/auth/session";
import type { ClientAccount } from "@/lib/client/auth";
import { getAdminSession, type AdminUser } from "@/lib/admin/auth";
import { adminCanAccessPortal } from "@/lib/auth/admin-portal";
import { getPortal, type PortalId } from "@/config/portals";
import { connexionSearch, contactSearch } from "@/lib/auth/redirect";
import { useRouterState } from "@tanstack/react-router";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PortalHomeLink } from "@/components/PortalHomeLink";

type PortalHeaderProps = {
  portalId: PortalId;
  onAction?: (action: "contact" | "devis") => void;
};

export function PortalHeader({ portalId, onAction }: PortalHeaderProps) {
  const portal = getPortal(portalId);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchPortal = useRouterState({
    select: (s) => (s.location.search as { portal?: PortalId }).portal,
  });
  const onContactPage = pathname === "/contact" && searchPortal === portalId;
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const refreshAuth = () => {
    setClient(getClientSession());
    void getAdminSession().then(setAdminUser);
  };

  useEffect(() => {
    refreshAuth();
    return subscribeAuth(refreshAuth);
  }, []);

  const showAdminLink = adminUser && adminCanAccessPortal(adminUser, portalId);

  const handleLogout = () => {
    logoutSession("all");
    refreshAuth();
  };

  const accentDot = portal.accentClass;
  const loginSearch = connexionSearch(portalId, "login");
  const registerSearch = connexionSearch(portalId, "register");

  const renderNavItem = (item: (typeof portal.publicNav)[number], mobile = false) => {
    const isContactLink = item.type === "link" && item.to === "/contact";
    const isActive = isContactLink && onContactPage;
    const cls = mobile
      ? `rounded-lg px-3 py-3 text-base block w-full text-left ${
          isActive ? `${portal.accentClass} bg-white/10` : "text-white/80 hover:bg-white/10 hover:text-white"
        }`
      : `transition-colors ${isActive ? portal.accentClass : "hover:opacity-100 opacity-90"}`;

    if (item.type === "link") {
      const search = isContactLink ? contactSearch(portalId) : undefined;
      const to = item.to === "/" ? portal.publicPath : item.to;
      if (mobile) {
        return (
          <SheetClose key={item.label} asChild>
            <Link to={to as "/"} search={search} className={cls}>
              {item.label}
            </Link>
          </SheetClose>
        );
      }
      return (
        <Link key={item.label} to={to as "/"} search={search} className={cls}>
          {item.label}
        </Link>
      );
    }
    if (item.type === "anchor") {
      const anchorCls = mobile
        ? "rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white block w-full text-left"
        : "hover:opacity-100 opacity-90 transition-colors";
      const hash = item.href.replace(/^#/, "");
      if (mobile) {
        return (
          <SheetClose key={item.label} asChild>
            <Link to={portal.publicPath as "/"} hash={hash} className={anchorCls}>
              {item.label}
            </Link>
          </SheetClose>
        );
      }
      return (
        <Link key={item.label} to={portal.publicPath as "/"} hash={hash} className={anchorCls}>
          {item.label}
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        onClick={() => onAction?.(item.action)}
        className={`${cls} cursor-pointer`}
      >
        {item.label}
      </button>
    );
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={portal.publicPath as "/location-vehicules"} className="flex flex-col gap-0.5 shrink-0">
            <span className="font-display text-2xl font-bold text-white drop-shadow-lg">
              YOLO<span className={accentDot}>.</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 hidden sm:inline">
              {portal.name}
            </span>
          </Link>
          <PortalHomeLink variant="pill" accentClass={portal.accentClass} />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          {portal.publicNav.map((item) => renderNavItem(item))}

          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/15">
            {client ? (
              <Link
                to={portal.clientPath as "/client"}
                className="inline-flex items-center gap-2 rounded-full border border-or-vif/40 bg-or-vif/10 px-4 py-1.5 text-white transition-colors hover:bg-or-vif/20"
              >
                <User className={`h-3.5 w-3.5 ${portal.accentClass}`} />
                <span>{client.firstName}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/connexion"
                  search={registerSearch}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-white hover:bg-white/15 transition-colors text-sm"
                >
                  Créer un compte
                </Link>
                <Link
                  to="/connexion"
                  search={loginSearch}
                  className="inline-flex items-center gap-2 rounded-full bg-or-vif px-4 py-1.5 text-sm font-medium text-charbon transition-colors hover:bg-white"
                >
                  Se connecter
                </Link>
              </>
            )}
            {showAdminLink && (
              <Link
                to={portal.adminPath as "/admin"}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 hover:text-white transition-colors text-xs"
                title="Back-office"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
            {(client || showAdminLink) && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/70 hover:text-white transition-colors text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur transition hover:bg-white/10"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="border-white/10 bg-charbon text-white">
            <SheetTitle className="font-display text-2xl text-white">
              YOLO<span className={accentDot}>.</span>
            </SheetTitle>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">{portal.name}</p>
            <nav className="mt-8 flex flex-col gap-2">
              <SheetClose asChild>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-or-vif/30 bg-or-vif/10 px-3 py-3 text-base font-medium text-white"
                >
                  <LayoutGrid className={`h-4 w-4 ${portal.accentClass}`} />
                  Tous les portails
                </Link>
              </SheetClose>
              {portal.publicNav.map((item) => renderNavItem(item, true))}
              <div className="border-t border-white/10 my-4" />
              {client ? (
                <SheetClose asChild>
                  <Link
                    to={portal.clientPath as "/client"}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-base"
                  >
                    <User className="h-4 w-4" /> Mon espace ({client.firstName})
                  </Link>
                </SheetClose>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link to="/connexion" search={registerSearch} className="rounded-lg border border-white/15 px-3 py-3 text-base">
                      Créer un compte
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/connexion" search={loginSearch} className="rounded-lg bg-gold text-gold-foreground px-3 py-3 text-base font-medium">
                      Se connecter
                    </Link>
                  </SheetClose>
                </>
              )}
              {showAdminLink && (
                <SheetClose asChild>
                  <Link to={portal.adminPath as "/admin"} className="rounded-lg border border-white/15 px-3 py-3 text-base">
                    Back-office
                  </Link>
                </SheetClose>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
