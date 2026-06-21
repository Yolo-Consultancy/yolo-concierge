/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";

type PortalHomeLinkProps = {
  variant?: "pill" | "nav" | "footer";
  className?: string;
  onNavigate?: () => void;
  accentClass?: string;
};

export function PortalHomeLink({
  variant = "pill",
  className = "",
  onNavigate,
  accentClass = "text-or-vif",
}: PortalHomeLinkProps) {
  if (variant === "pill") {
    return (
      <Link
        to="/"
        onClick={onNavigate}
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-white/90 backdrop-blur transition hover:border-white/35 hover:bg-white/10 hover:text-white ${className}`}
        title="Retour à l'accueil de tous les portails"
      >
        <LayoutGrid className={`h-3.5 w-3.5 ${accentClass}`} />
        <span className="hidden sm:inline">Tous les portails</span>
        <span className="sm:hidden">Portails</span>
      </Link>
    );
  }

  if (variant === "footer") {
    return (
      <Link
        to="/"
        onClick={onNavigate}
        className={`inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white ${className}`}
      >
        <LayoutGrid className={`h-4 w-4 ${accentClass}`} />
        Tous les portails
      </Link>
    );
  }

  return (
    <Link
      to="/"
      onClick={onNavigate}
      className={`inline-flex items-center gap-1.5 transition-colors hover:opacity-100 opacity-90 ${className}`}
    >
      <LayoutGrid className={`h-3.5 w-3.5 ${accentClass}`} />
      Tous les portails
    </Link>
  );
}
