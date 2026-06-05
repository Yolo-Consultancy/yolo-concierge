/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import { Menu, Lock } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-white drop-shadow-lg">
            YOLO<span className="text-gold"> .</span>
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-white/80 hidden sm:inline">
            Le Concierge
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/90">
          <Link to="/location-vehicules" className="hover:text-gold transition-colors">Véhicules</Link>
          <Link to="/demenagement" className="hover:text-gold transition-colors">Déménagement</Link>
          <Link to="/services-sur-mesure" className="hover:text-gold transition-colors">Sur Mesure</Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-white hover:bg-white/15 transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
            Login
          </Link>
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
              <SheetClose asChild>
                <Link to="/admin" className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-base text-white hover:bg-white/10">
                  <Lock className="h-4 w-4" /> Login admin
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

