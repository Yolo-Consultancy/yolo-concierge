/* eslint-disable prettier/prettier */
import { getCommuneLabel } from "@/config/kinshasa-communes";

export type LocationAddress = {
  communeId: string;
  quartier: string;
  avenue: string;
};

export type FloorInfo = {
  isElevated: boolean;
  floorLevel: number;
  hasElevator: boolean;
};

export type DemenagementQuoteData = {
  type: "demenagement_devis";
  moveDate: string;
  departure: LocationAddress;
  arrival: LocationAddress;
  departureFloor: FloorInfo;
  arrivalFloor: FloorInfo;
  bedrooms: number;
  livingRooms: number;
  additionalNotes: string;
};

export function formatLocation(addr: LocationAddress): string {
  const commune = getCommuneLabel(addr.communeId);
  return [commune, addr.quartier, addr.avenue].filter(Boolean).join(" · ");
}

export function formatFloorInfo(label: string, floor: FloorInfo): string {
  if (!floor.isElevated) return `${label} : rez-de-chaussée / plain-pied`;
  const elev = floor.hasElevator ? "avec ascenseur" : "sans ascenseur";
  return `${label} : étage ${floor.floorLevel} (${elev})`;
}

export function buildDemenagementQuoteMessage(data: DemenagementQuoteData): string {
  return [
    "=== DEMANDE DE DEVIS DÉMÉNAGEMENT ===",
    "",
    `Date souhaitée : ${data.moveDate}`,
    "",
    "— DÉPART —",
    formatLocation(data.departure),
    formatFloorInfo("Niveau", data.departureFloor),
    "",
    "— ARRIVÉE —",
    formatLocation(data.arrival),
    formatFloorInfo("Niveau", data.arrivalFloor),
    "",
    `Chambres : ${data.bedrooms}`,
    `Salons / pièces à vivre : ${data.livingRooms}`,
    data.additionalNotes ? `\nNotes : ${data.additionalNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function emptyLocation(): LocationAddress {
  return { communeId: "", quartier: "", avenue: "" };
}

export function emptyFloor(): FloorInfo {
  return { isElevated: false, floorLevel: 0, hasElevator: false };
}

export function emptyQuoteData(): DemenagementQuoteData {
  return {
    type: "demenagement_devis",
    moveDate: "",
    departure: emptyLocation(),
    arrival: emptyLocation(),
    departureFloor: emptyFloor(),
    arrivalFloor: emptyFloor(),
    bedrooms: 1,
    livingRooms: 1,
    additionalNotes: "",
  };
}
