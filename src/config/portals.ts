/* eslint-disable prettier/prettier */
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  ClipboardList,
  Users,
  Settings,
  FileText,
} from "lucide-react";

export type PortalId = "vehicules" | "demenagement" | "sur-mesure";

export type ServiceType = "vehicules" | "demenagement" | "sur_mesure";

export type PortalPublicNavItem =
  | { type: "link"; label: string; to: string }
  | { type: "anchor"; label: string; href: string }
  | { type: "action"; label: string; action: "contact" | "devis" };

export type PortalNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type PortalConfig = {
  id: PortalId;
  name: string;
  subtitle: string;
  accent: string;
  accentClass: string;
  accentBgClass: string;
  publicPath: string;
  clientPath: string;
  adminPath: string;
  serviceType: ServiceType;
  publicNav: PortalPublicNavItem[];
  clientNav: PortalNavItem[];
  adminNav: PortalNavItem[];
};

export const PORTALS: Record<PortalId, PortalConfig> = {
  vehicules: {
    id: "vehicules",
    name: "Location Véhicules",
    subtitle: "Mobilité premium",
    accent: "#7dd3fc",
    accentClass: "text-[#7dd3fc]",
    accentBgClass: "bg-[#7dd3fc]",
    publicPath: "/location-vehicules",
    clientPath: "/client",
    adminPath: "/admin",
    serviceType: "vehicules",
    publicNav: [
      { type: "link", label: "Accueil", to: "/" },
      { type: "anchor", label: "Flotte", href: "#flotte" },
      { type: "anchor", label: "Destinations", href: "#destinations" },
      { type: "anchor", label: "À propos", href: "#pourquoi" },
      { type: "link", label: "Contact", to: "/contact" },
    ],
    clientNav: [
      { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/client/reservations", label: "Mes réservations", icon: CalendarCheck },
      { to: "/client/demenagement", label: "Déménagement", icon: ClipboardList },
      { to: "/client/sur-mesure", label: "Sur mesure", icon: ClipboardList },
      { to: "/client/support", label: "Support", icon: MessageSquare },
    ],
    adminNav: [
      { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/admin/vehicules", label: "Véhicules", icon: FileText },
      { to: "/admin/reservations", label: "Réservations", icon: CalendarCheck },
      { to: "/admin/clients", label: "Clients", icon: Users },
      { to: "/admin/chauffeurs", label: "Chauffeurs", icon: Users },
      { to: "/admin/missions", label: "Missions", icon: ClipboardList },
      { to: "/admin/rapports", label: "Rapports", icon: FileText },
      { to: "/admin/parametres", label: "Paramètres", icon: Settings },
    ],
  },
  demenagement: {
    id: "demenagement",
    name: "Déménagement",
    subtitle: "Logistique clé en main",
    accent: "#d4a853",
    accentClass: "text-gold",
    accentBgClass: "bg-gold",
    publicPath: "/demenagement",
    clientPath: "/client",
    adminPath: "/admin-demenagement",
    serviceType: "demenagement",
    publicNav: [
      { type: "link", label: "Accueil", to: "/" },
      { type: "anchor", label: "Services", href: "#services" },
      { type: "anchor", label: "Processus", href: "#processus" },
      { type: "link", label: "Devis", to: "/contact" },
    ],
    clientNav: [
      { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/client/reservations", label: "Mes réservations", icon: CalendarCheck },
      { to: "/client/demenagement", label: "Déménagement", icon: ClipboardList },
      { to: "/client/sur-mesure", label: "Sur mesure", icon: ClipboardList },
      { to: "/client/support", label: "Support", icon: MessageSquare },
    ],
    adminNav: [
      { to: "/admin-demenagement", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/admin-demenagement/demandes", label: "Demandes", icon: ClipboardList },
      { to: "/admin-demenagement/clients", label: "Clients", icon: Users },
      { to: "/admin-demenagement/parametres", label: "Paramètres", icon: Settings },
    ],
  },
  "sur-mesure": {
    id: "sur-mesure",
    name: "Sur Mesure",
    subtitle: "Conciergerie privée",
    accent: "#d4a853",
    accentClass: "text-gold",
    accentBgClass: "bg-gold",
    publicPath: "/services-sur-mesure",
    clientPath: "/client",
    adminPath: "/admin-sur-mesure",
    serviceType: "sur_mesure",
    publicNav: [
      { type: "link", label: "Accueil", to: "/" },
      { type: "anchor", label: "Univers", href: "#univers" },
      { type: "anchor", label: "Demande", href: "#demande" },
      { type: "link", label: "Composer", to: "/contact" },
    ],
    clientNav: [
      { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/client/reservations", label: "Mes réservations", icon: CalendarCheck },
      { to: "/client/demenagement", label: "Déménagement", icon: ClipboardList },
      { to: "/client/sur-mesure", label: "Sur mesure", icon: ClipboardList },
      { to: "/client/support", label: "Support", icon: MessageSquare },
    ],
    adminNav: [
      { to: "/admin-sur-mesure", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/admin-sur-mesure/demandes", label: "Demandes", icon: ClipboardList },
      { to: "/admin-sur-mesure/clients", label: "Clients", icon: Users },
      { to: "/admin-sur-mesure/parametres", label: "Paramètres", icon: Settings },
    ],
  },
};

export function getPortal(id: PortalId): PortalConfig {
  return PORTALS[id];
}

export function portalFromPath(path: string): PortalId | null {
  if (path.startsWith("/location-vehicules")) return "vehicules";
  if (path.startsWith("/demenagement") || path.startsWith("/client-demenagement") || path.startsWith("/admin-demenagement")) {
    return "demenagement";
  }
  if (path.startsWith("/services-sur-mesure") || path.startsWith("/client-sur-mesure") || path.startsWith("/admin-sur-mesure")) {
    return "sur-mesure";
  }
  if (path.startsWith("/admin") && !path.startsWith("/admin-demenagement") && !path.startsWith("/admin-sur-mesure")) {
    return "vehicules";
  }
  return null;
}
