/* eslint-disable prettier/prettier */
import type { PortalId } from "@/config/portals";
import { contactConfig } from "@/config/contact";

export type PortalContactContent = {
  pageTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  defaultSubject: string;
  subjects: string[];
  whyChoose: string[];
  messagePlaceholder: string;
};

export const portalContactContent: Record<PortalId, PortalContactContent> = {
  vehicules: {
    pageTitle: "Contact — Location Véhicules",
    metaDescription:
      "Contactez YOLO pour une location premium à Kinshasa. Flotte, chauffeur, livraison et réservation.",
    heroSubtitle:
      "Une question sur la flotte, une réservation ou un chauffeur ? Notre concierge location vous répond rapidement à Kinshasa.",
    defaultSubject: "Location de véhicule",
    subjects: ["Informations générales", "Location de véhicule", "Autre"],
    whyChoose: [
      "Flotte premium : supercars et berlines de luxe",
      "Livraison gratuite dans tout Kinshasa",
      "Chauffeur professionnel sur demande",
      "Tarification transparente sans frais cachés",
      "Support client 24/7",
    ],
    messagePlaceholder: "Dates, véhicule souhaité, lieu de livraison, chauffeur...",
  },
  demenagement: {
    pageTitle: "Contact — Déménagement",
    metaDescription:
      "Contactez YOLO pour votre déménagement à Kinshasa. Devis gratuit, emballage, transport et installation.",
    heroSubtitle:
      "Un déménagement à planifier, un devis à affiner ou une date à confirmer ? Notre équipe logistique vous répond sous 24 h.",
    defaultSubject: "Devis déménagement",
    subjects: ["Informations générales", "Devis déménagement", "Autre"],
    whyChoose: [
      "Couverture des 24 communes de Kinshasa",
      "Devis détaillé avant engagement",
      "Matériel de protection inclus",
      "Équipe dédiée du devis à la livraison",
      "Interlocuteur unique tout au long du projet",
    ],
    messagePlaceholder: "Volume, adresses de départ/arrivée, date souhaitée, étages...",
  },
  "sur-mesure": {
    pageTitle: "Contact — Sur Mesure",
    metaDescription:
      "Contactez YOLO pour vos demandes sur mesure à Kinshasa. Événementiel, voyages et assistance professionnelle.",
    heroSubtitle:
      "Événement, voyage ou besoin spécifique ? Décrivez votre projet — un concierge dédié prend le relais rapidement.",
    defaultSubject: "Service sur mesure",
    subjects: ["Informations générales", "Service sur mesure", "Autre"],
    whyChoose: [
      "Conciergerie privée et discrète",
      "Événementiel, voyages et assistance pro",
      "Réponse sous 2 h en moyenne",
      "Un interlocuteur unique pour tout coordonner",
      "Réseau de partenaires premium à Kinshasa",
    ],
    messagePlaceholder: "Type de service, dates, lieu, budget indicatif...",
  },
};

export const generalContactContent: PortalContactContent = {
  pageTitle: "Contact — YOLO Le Concierge",
  metaDescription:
    "Contactez YOLO Le Concierge à Kinshasa. Location premium, déménagement et services sur mesure.",
  heroSubtitle:
    "Prêt à vivre le luxe ? Notre équipe à Kinshasa vous répond rapidement pour tous nos services.",
  defaultSubject: contactConfig.subjects[0],
  subjects: contactConfig.subjects,
  whyChoose: contactConfig.whyChoose,
  messagePlaceholder: "Décrivez votre demande (dates, véhicule, services...)",
};

export function getPortalContactContent(portalId?: PortalId): PortalContactContent {
  if (portalId) return portalContactContent[portalId];
  return generalContactContent;
}
