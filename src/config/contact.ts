/* eslint-disable prettier/prettier */
export const contactConfig = {
  city: "Kinshasa",
  country: "République Démocratique du Congo",
  defaultAddress:
    "N° 5284 Avenue Tabu ley, (Ex. Tombalbaye), Quartier Golfe, Gombe, Kinshasa RD Congo",
  mapsQuery:
    "N° 5284 Avenue Tabu ley, (Ex. Tombalbaye), Quartier Golfe, Gombe, Kinshasa RD Congo",
  mapsShareUrl: "https://maps.app.goo.gl/zgqkUcuJHZdGmurH7",
  mapsCoordinates: {
    lat: -4.309066,
    lng: 15.29769,
  },
  openingHours: [
    { days: "Lundi - Vendredi", hours: "8h00 - 16h00" },
    { days: "Samedi", hours: "8h00 - 12h00" },
  ],
  whyChoose: [
    "Service professionnel et irréprochable",
    "Flotte premium de supercars et véhicules de luxe",
    "Livraison gratuite dans tout Kinshasa",
    "Support client 24/7",
    "Tarification transparente sans frais cachés",
  ],
  subjects: [
    "Informations générales",
    "Location de véhicule",
    "Devis déménagement",
    "Service sur mesure",
    "Autre",
  ],
};

export function formatPhoneDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("243") && digits.length >= 11) {
    return `+243 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`.trim();
  }
  if (digits.length >= 9) return `+${digits}`;
  return raw;
}

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function mapsDirectionsUrl(query?: string) {
  if (!query) return contactConfig.mapsShareUrl;
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(query?: string) {
  const q = encodeURIComponent(query || contactConfig.mapsQuery);
  return `https://www.google.com/maps?q=${q}&hl=fr&z=16&output=embed`;
}
