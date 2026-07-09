/* eslint-disable prettier/prettier */
import { getCommuneLabel } from "@/config/kinshasa-communes";

export type LocationAddress = {
  communeId: string;
  quartier: string;
  avenue: string;
  reference: string;
};

export type FloorInfo = {
  /** false tant que l'utilisateur n'a pas choisi explicitement */
  answered: boolean;
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
  const parts = [commune, addr.quartier, addr.avenue].filter(Boolean);
  if (addr.reference?.trim()) {
    parts.push(`Réf. ${addr.reference.trim()}`);
  }
  return parts.join(" · ");
}

export function formatFloorInfo(label: string, floor: FloorInfo): string {
  if (floor.answered === false) {
    return label ? `${label} : non renseigné` : "Non renseigné";
  }
  if (!floor.isElevated) {
    const text = "rez-de-chaussée / plain-pied";
    return label ? `${label} : ${text}` : text;
  }
  const elev = floor.hasElevator ? "avec ascenseur" : "sans ascenseur";
  const text = `étage ${floor.floorLevel} (${elev})`;
  return label ? `${label} : ${text}` : text;
}

export function isFloorInfoComplete(floor: FloorInfo): boolean {
  if (!floor.answered) return false;
  if (floor.isElevated && (!floor.floorLevel || floor.floorLevel < 1)) return false;
  return true;
}

export function floorValidationMessage(floor: FloorInfo, label: string): string | null {
  if (!floor.answered) {
    return `Indiquez le type de logement ${label} (rez-de-chaussée ou étage).`;
  }
  if (floor.isElevated && (!floor.floorLevel || floor.floorLevel < 1)) {
    return `Indiquez le niveau / étage du logement ${label}.`;
  }
  return null;
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
  return { communeId: "", quartier: "", avenue: "", reference: "" };
}

export function emptyFloor(): FloorInfo {
  return { answered: false, isElevated: false, floorLevel: 0, hasElevator: false };
}

export function emptyQuoteData(): DemenagementQuoteData {
  return {
    type: "demenagement_devis",
    moveDate: "",
    departure: emptyLocation(),
    arrival: emptyLocation(),
    departureFloor: emptyFloor(),
    arrivalFloor: emptyFloor(),
    bedrooms: 0,
    livingRooms: 0,
    additionalNotes: "",
  };
}

function parseFloorLine(line: string): FloorInfo {
  const text = line.replace(/^Niveau\s*:\s*/i, "").trim();
  if (/rez-de-chaussée|plain-pied/i.test(text)) {
    return { answered: true, isElevated: false, floorLevel: 0, hasElevator: false };
  }
  const level = text.match(/étage\s*(\d+)/i);
  return {
    answered: true,
    isElevated: true,
    floorLevel: level ? Number(level[1]) : 1,
    hasElevator: /avec ascenseur/i.test(text),
  };
}

function lineToLocation(line: string): LocationAddress {
  const value = line.trim();
  return { communeId: "", quartier: "", avenue: value, reference: "" };
}

/** Reconstruit un devis structuré depuis l'ancien message texte (sans quoteData). */
export function parseDemenagementQuoteFromMessage(message: string): DemenagementQuoteData | null {
  if (!message.includes("DEMANDE DE DEVIS DÉMÉNAGEMENT")) return null;

  const moveDate = message.match(/Date souhaitée\s*:\s*(\S+)/)?.[1] ?? "";
  const bedrooms = Number(message.match(/Chambres\s*:\s*(\d+)/)?.[1] ?? 1);
  const livingRooms = Number(message.match(/Salons[^\n]*:\s*(\d+)/)?.[1] ?? 1);
  const notes = message.match(/Notes\s*:\s*([\s\S]+?)$/)?.[1]?.trim() ?? "";

  const depBlock = message.match(/— DÉPART —\s*\n([^\n]+)\s*\n([^\n]+)/);
  const arrBlock = message.match(/— ARRIVÉE —\s*\n([^\n]+)\s*\n([^\n]+)/);
  if (!depBlock || !arrBlock) return null;

  return {
    type: "demenagement_devis",
    moveDate,
    departure: lineToLocation(depBlock[1]),
    arrival: lineToLocation(arrBlock[1]),
    departureFloor: parseFloorLine(depBlock[2]),
    arrivalFloor: parseFloorLine(arrBlock[2]),
    bedrooms: Number.isFinite(bedrooms) ? bedrooms : 1,
    livingRooms: Number.isFinite(livingRooms) ? livingRooms : 1,
    additionalNotes: notes,
  };
}

export function resolveDemenagementQuote(
  quoteData: DemenagementQuoteData | null | undefined,
  message: string,
): DemenagementQuoteData | null {
  if (quoteData?.type === "demenagement_devis") return quoteData;
  return parseDemenagementQuoteFromMessage(message);
}

export function formatQuoteRouteTitle(quote: DemenagementQuoteData): string {
  return `${formatLocation(quote.departure)} → ${formatLocation(quote.arrival)}`;
}
