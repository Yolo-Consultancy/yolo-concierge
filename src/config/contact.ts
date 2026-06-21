/* eslint-disable prettier/prettier */
export const contactConfig = {
  city: "Kinshasa",
  country: "République Démocratique du Congo",
  defaultAddress: "Gombe, Kinshasa, RDC",
  mapsQuery: "Gombe, Kinshasa, RDC",
  openingHours: [
    { days: "Lundi - Vendredi", hours: "8h00 - 20h00" },
    { days: "Samedi", hours: "8h00 - 18h00" },
    { days: "Dimanche", hours: "10h00 - 16h00" },
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

export function mapsDirectionsUrl(query: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}
