/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import { Menu, LogOut, User, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getClientSession,
  getAdminSession,
  logoutSession,
  subscribeAuth,
} from "@/lib/auth/session";
import type { ClientAccount } from "@/lib/client/auth";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAuth = () => {
    setClient(getClientSession());
    setIsAdmin(getAdminSession());
  };

  useEffect(() => {
    refreshAuth();
    return subscribeAuth(refreshAuth);
  }, []);

  const handleLogout = (role: "client" | "admin" | "all") => {
    logoutSession(role);
    refreshAuth();
  };

  const isLoggedIn = !!client || isAdmin;

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-white drop-shadow-lg">
            YOLO<span className="text-gold">.</span>
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-white/80 hidden sm:inline">
            Le Concierge
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
          <Link to="/location-vehicules" className="hover:text-gold transition-colors">Véhicules</Link>
          <Link to="/demenagement" className="hover:text-gold transition-colors">Déménagement</Link>
          <Link to="/services-sur-mesure" className="hover:text-gold transition-colors">Sur Mesure</Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {client && (
                <Link
                  to="/client"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-white hover:bg-gold/20 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-gold" />
                  <span>{client.firstName} {client.lastName.slice(0, 1)}.</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-[#7dd3fc]/40 bg-[#7dd3fc]/10 px-4 py-1.5 text-white hover:bg-[#7dd3fc]/20 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-[#7dd3fc]" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleLogout(client && isAdmin ? "all" : client ? "client" : "admin")}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-xs">Déconnexion</span>
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-white hover:bg-white/15 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Connexion
            </Link>
          )}
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
          <SheetContent side="right" className="border-white/10 bg-[#0f0f0f] text-white">
            <SheetTitle className="font-display text-2xl text-white">
              YOLO<span className="text-gold">.</span>
            </SheetTitle>
            <nav className="mt-10 flex flex-col gap-3">
              <SheetClose asChild>
                <Link to="/" className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white">
                  Accueil
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/location-vehicules" className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white">
                  Véhicules
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/demenagement" className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white">
                  Déménagement
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/services-sur-mesure" className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white">
                  Sur Mesure
                </Link>
              </SheetClose>

              <div className="border-t border-white/10 my-4" />

              {isLoggedIn ? (
                <>
                  {client && (
                    <SheetClose asChild>
                      <Link to="/client" className="inline-flex items-center gap-2 rounded-lg bg-gold/10 border border-gold/30 px-3 py-3 text-base text-white hover:bg-gold/20">
                        <User className="h-4 w-4 text-gold" /> Espace Client ({client.firstName})
                      </Link>
                    </SheetClose>
                  )}
                  {isAdmin && (
                    <SheetClose asChild>
                      <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg bg-[#7dd3fc]/10 border border-[#7dd3fc]/30 px-3 py-3 text-base text-white hover:bg-[#7dd3fc]/20">
                        <Shield className="h-4 w-4 text-[#7dd3fc]" /> Espace Admin
                      </Link>
                    </SheetClose>
                  )}
                  <button
                    type="button"
                    onClick={() => handleLogout(client && isAdmin ? "all" : client ? "client" : "admin")}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-base text-red-300 hover:bg-red-500/10 text-left"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </>
              ) : (
                <SheetClose asChild>
                  <Link to="/connexion" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-base text-white hover:bg-white/10">
                    <User className="h-4 w-4" /> Connexion
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
