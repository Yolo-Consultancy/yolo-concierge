/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getClientSession,
  logoutSession,
  subscribeAuth,
} from "@/lib/auth/session";
import type { ClientAccount } from "@/lib/client/auth";
import { getAdminSession, type AdminUser } from "@/lib/admin/auth";
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
import { YoloLogo } from "@/components/YoloLogo";
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

  const isLoggedIn = !!client || !!adminUser;

  const handleLogout = () => {
    logoutSession("all");
    refreshAuth();
  };

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
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-charbon/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 min-w-0">
          <YoloLogo
            variant="yolo"
            size="md"
            to={portal.publicPath as "/location-vehicules"}
          />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          {portal.publicNav.map((item) => renderNavItem(item))}

          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/15">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Déconnexion
              </button>
            ) : (
              <>
                <Link
                  to="/connexion"
                  search={registerSearch}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-white hover:bg-white/15 transition-colors text-sm"
                >
                  Inscription
                </Link>
                <Link
                  to="/connexion"
                  search={loginSearch}
                  className="inline-flex items-center gap-2 rounded-full bg-or-vif px-4 py-1.5 text-sm font-medium text-charbon transition-colors hover:bg-white"
                >
                  Connexion
                </Link>
              </>
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
            <SheetTitle className="sr-only">YOLO Le Concierge — {portal.name}</SheetTitle>
            <YoloLogo variant="yolo" size="md" />
            <nav className="mt-8 flex flex-col gap-2">
              {portal.publicNav.map((item) => renderNavItem(item, true))}
              <div className="border-t border-white/10 my-4" />
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-base text-red-300 hover:bg-red-500/10 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link to="/connexion" search={registerSearch} className="rounded-lg border border-white/15 px-3 py-3 text-base block">
                      Inscription
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/connexion" search={loginSearch} className="rounded-lg bg-gold text-gold-foreground px-3 py-3 text-base font-medium block">
                      Connexion
                    </Link>
                  </SheetClose>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
