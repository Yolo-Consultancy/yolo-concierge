/* eslint-disable prettier/prettier */
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  year: number;
  category: string;
  location: string;
  pricePerDay: number;
  image: string;
  gallery: string[];
  specs: { hp: number; seats: number; transmission: string; fuel: string };
  description: string;
  conditions: {
    deposit: string;
    minAge: string;
    licenseYears: string;
    dailyKm: string;
  };
  keyStats: { power: string; zeroTo100: string; topSpeed: string; fuel: string };
  performance: { hp: string; torque: string; zeroTo100: string; topSpeed: string };
  drivetrain: { fuel: string; transmission: string; gearbox: string };
  equipment: {
    seats: string;
    wheels: string;
    brakes: string;
    suspension: string;
    exterior: string;
    interior: string;
  };
};

export const vehicles: Vehicle[] = [
  {
    id: "ferrari-488",
    name: "488 GTB",
    brand: "Ferrari",
    year: 2023,
    category: "Supercar",
    location: "Dakar",
    pricePerDay: 450000,
    image: car1,
    gallery: [car1, car2, car3],
    specs: { hp: 660, seats: 2, transmission: "Automatique", fuel: "Essence super" },
    description:
      "Une icône italienne taillée pour les sensations fortes. Parfaite pour les sorties exclusives, les événements prestigieux ou simplement pour vivre la route avec passion et raffinement.",
    conditions: {
      deposit: "5 000 000 FCFA",
      minAge: "28+",
      licenseYears: "5 ans",
      dailyKm: "150 km",
    },
    keyStats: {
      power: "660 HP",
      zeroTo100: "3,0 secondes",
      topSpeed: "330 km/h",
      fuel: "Essence super",
    },
    performance: { hp: "660 HP", torque: "760 Nm", zeroTo100: "3,0 secondes", topSpeed: "330 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Propulsion arrière", gearbox: "Double embrayage 7 vitesses" },
    equipment: {
      seats: "2",
      wheels: "Jantes forgées 20 pouces",
      brakes: "Freins carbone-céramique",
      suspension: "Suspension magnétorhéologique",
      exterior: "Carrosserie aérodynamique, échappement sport, phares LED",
      interior: "Cuir Nappa, fibre de carbone, écran tactile, sono premium",
    },
  },
  {
    id: "lambo-huracan",
    name: "Huracán EVO",
    brand: "Lamborghini",
    year: 2024,
    category: "Supercar",
    location: "Abidjan",
    pricePerDay: 520000,
    image: car2,
    gallery: [car2, car1, car3],
    specs: { hp: 640, seats: 2, transmission: "Automatique", fuel: "Essence super" },
    description:
      "L'expression ultime de la passion italienne. Conçue pour ceux qui exigent puissance, design et exclusivité absolue.",
    conditions: {
      deposit: "5 500 000 FCFA",
      minAge: "28+",
      licenseYears: "5 ans",
      dailyKm: "150 km",
    },
    keyStats: {
      power: "640 HP",
      zeroTo100: "2,9 secondes",
      topSpeed: "325 km/h",
      fuel: "Essence super",
    },
    performance: { hp: "640 HP", torque: "600 Nm", zeroTo100: "2,9 secondes", topSpeed: "325 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Transmission intégrale", gearbox: "Double embrayage 7 vitesses" },
    equipment: {
      seats: "2",
      wheels: "Jantes forgées 20 pouces Aesir",
      brakes: "Carbone-céramique haute performance",
      suspension: "Suspension adaptative magnétique",
      exterior: "Design angulaire signature, aileron actif, échappement sport",
      interior: "Alcantara, fibre de carbone, écran HD, Lamborghini Connect",
    },
  },
  {
    id: "porsche-911",
    name: "911 GT3",
    brand: "Porsche",
    year: 2024,
    category: "Sport",
    location: "Saly",
    pricePerDay: 380000,
    image: car3,
    gallery: [car3, car1, car2],
    specs: { hp: 510, seats: 2, transmission: "Automatique", fuel: "Essence super" },
    description:
      "L'icône allemande dans sa version la plus pure et la plus radicale. Une voiture de piste homologuée pour la route.",
    conditions: {
      deposit: "4 500 000 FCFA",
      minAge: "25+",
      licenseYears: "3 ans",
      dailyKm: "200 km",
    },
    keyStats: {
      power: "510 HP",
      zeroTo100: "3,4 secondes",
      topSpeed: "318 km/h",
      fuel: "Essence super",
    },
    performance: { hp: "510 HP", torque: "470 Nm", zeroTo100: "3,4 secondes", topSpeed: "318 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Propulsion arrière", gearbox: "PDK 7 vitesses" },
    equipment: {
      seats: "2",
      wheels: "Jantes forgées 20/21 pouces",
      brakes: "Porsche Ceramic Composite Brake",
      suspension: "PASM Sport, abaissée de 27 mm",
      exterior: "Aileron arrière fixe, diffuseur, phares LED matriciels",
      interior: "Sièges baquets, Alcantara, Sport Chrono, BOSE Surround",
    },
  },
];

export function getVehicle(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

// Deterministic thousand-separator formatter to avoid SSR/CSR locale mismatches.
export function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
