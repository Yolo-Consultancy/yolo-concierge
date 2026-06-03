/* eslint-disable prettier/prettier */

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

// Unsplash helper — same image bank, different angles via crop hints.
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Gallery presets: [front, side, rear, 3/4, interior dashboard, interior seats]
const galleries = {
  ferrari488: [
    u("1592198084033-aade902d1aae"),
    u("1503376780353-7e6692767b70"),
    u("1583121274602-3e2820c69888"),
    u("1492144534655-ae79c964c9d7"),
    u("1503736334956-4c8f8e92946d"),
    u("1494976388531-d1058494cdd8"),
  ],
  lamboHuracan: [
    u("1544829099-b9a0c07fad1a"),
    u("1503376780353-7e6692767b70"),
    u("1580273916550-e323be2ae537"),
    u("1614200187524-dc4b892acf16"),
    u("1542362567-b07e54358753"),
    u("1544636331-e26879cd4d9b"),
  ],
  porsche911: [
    u("1503376780353-7e6692767b70"),
    u("1611821064736-1d4d56ff1cf0"),
    u("1611859328019-2c5d3f4e7e7a"),
    u("1517524008697-84bbe3c3fd98"),
    u("1542362567-b07e54358753"),
    u("1544636331-e26879cd4d9b"),
  ],
  mercedesG63: [
    u("1606664515524-ed2f786a0bd6"),
    u("1622200284316-89ef91b2c655"),
    u("1617531653332-bd46c24f2068"),
    u("1494976388531-d1058494cdd8"),
    u("1493238792000-8113da705763"),
    u("1544636331-e26879cd4d9b"),
  ],
  rangeRover: [
    u("1565043666747-69f6646db940"),
    u("1606220945770-b5b6c2c55bf1"),
    u("1606664515524-ed2f786a0bd6"),
    u("1617814076367-b759c7d7e738"),
    u("1493238792000-8113da705763"),
    u("1542362567-b07e54358753"),
  ],
  rollsCullinan: [
    u("1631295868223-63265b40d9e4"),
    u("1631295868834-9bf3b2eaf3a4"),
    u("1614200187524-dc4b892acf16"),
    u("1606664515524-ed2f786a0bd6"),
    u("1493238792000-8113da705763"),
    u("1544636331-e26879cd4d9b"),
  ],
  bentleyCont: [
    u("1614200187524-dc4b892acf16"),
    u("1494976388531-d1058494cdd8"),
    u("1503376780353-7e6692767b70"),
    u("1606664515524-ed2f786a0bd6"),
    u("1542362567-b07e54358753"),
    u("1544636331-e26879cd4d9b"),
  ],
  bmwM4: [
    u("1555215695-3004980ad54e"),
    u("1617531653332-bd46c24f2068"),
    u("1503376780353-7e6692767b70"),
    u("1492144534655-ae79c964c9d7"),
    u("1542362567-b07e54358753"),
    u("1493238792000-8113da705763"),
  ],
};

export const vehicles: Vehicle[] = [
  {
    id: "ferrari-488",
    name: "488 GTB",
    brand: "Ferrari",
    year: 2023,
    category: "Supercar",
    location: "Kinshasa",
    pricePerDay: 4500,
    image: galleries.ferrari488[0],
    gallery: galleries.ferrari488,
    specs: { hp: 660, seats: 2, transmission: "Automatique", fuel: "Essence super" },
    description:
      "Une icône italienne taillée pour les sensations fortes. Parfaite pour les sorties exclusives, les événements prestigieux ou simplement pour vivre la route avec passion et raffinement.",
    conditions: { deposit: "5 000 000 FCFA", minAge: "28+", licenseYears: "5 ans", dailyKm: "150 km" },
    keyStats: { power: "660 HP", zeroTo100: "3,0 s", topSpeed: "330 km/h", fuel: "Essence super" },
    performance: { hp: "660 HP", torque: "760 Nm", zeroTo100: "3,0 s", topSpeed: "330 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Propulsion arrière", gearbox: "Double embrayage 7 vit." },
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
    location: "Kinshasa",
    pricePerDay: 5200,
    image: galleries.lamboHuracan[0],
    gallery: galleries.lamboHuracan,
    specs: { hp: 640, seats: 2, transmission: "Automatique", fuel: "Essence super" },
    description:
      "L'expression ultime de la passion italienne. Conçue pour ceux qui exigent puissance, design et exclusivité absolue.",
    conditions: { deposit: "5 500 000 FCFA", minAge: "28+", licenseYears: "5 ans", dailyKm: "150 km" },
    keyStats: { power: "640 HP", zeroTo100: "2,9 s", topSpeed: "325 km/h", fuel: "Essence super" },
    performance: { hp: "640 HP", torque: "600 Nm", zeroTo100: "2,9 s", topSpeed: "325 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Intégrale", gearbox: "Double embrayage 7 vit." },
    equipment: {
      seats: "2",
      wheels: "Jantes forgées 20 pouces Aesir",
      brakes: "Carbone-céramique haute performance",
      suspension: "Suspension adaptative magnétique",
      exterior: "Design angulaire, aileron actif, échappement sport",
      interior: "Alcantara, fibre de carbone, écran HD, Lamborghini Connect",
    },
  },
  {
    id: "porsche-911",
    name: "911 GT3",
    brand: "Porsche",
    year: 2024,
    category: "Sport",
    location: "Kinshasa",
    pricePerDay: 3800,
    image: galleries.porsche911[0],
    gallery: galleries.porsche911,
    specs: { hp: 510, seats: 2, transmission: "Automatique", fuel: "Essence super" },
    description:
      "L'icône allemande dans sa version la plus pure et la plus radicale. Une voiture de piste homologuée pour la route.",
    conditions: { deposit: "4 500 000 FCFA", minAge: "25+", licenseYears: "3 ans", dailyKm: "200 km" },
    keyStats: { power: "510 HP", zeroTo100: "3,4 s", topSpeed: "318 km/h", fuel: "Essence super" },
    performance: { hp: "510 HP", torque: "470 Nm", zeroTo100: "3,4 s", topSpeed: "318 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Propulsion arrière", gearbox: "PDK 7 vit." },
    equipment: {
      seats: "2",
      wheels: "Jantes forgées 20/21 pouces",
      brakes: "Porsche Ceramic Composite Brake",
      suspension: "PASM Sport, abaissée de 27 mm",
      exterior: "Aileron arrière fixe, diffuseur, phares LED matriciels",
      interior: "Sièges baquets, Alcantara, Sport Chrono, BOSE Surround",
    },
  },
  {
    id: "mercedes-g63",
    name: "AMG G 63",
    brand: "Mercedes-Benz",
    year: 2024,
    category: "SUV de Luxe",
    location: "Kinshasa",
    pricePerDay: 4200,
    image: galleries.mercedesG63[0],
    gallery: galleries.mercedesG63,
    specs: { hp: 585, seats: 5, transmission: "Automatique", fuel: "Essence super" },
    description:
      "Le SUV de luxe le plus iconique au monde. Présence imposante, puissance brute et raffinement absolu pour dominer chaque trajet à Kinshasa.",
    conditions: { deposit: "4 000 000 FCFA", minAge: "25+", licenseYears: "3 ans", dailyKm: "250 km" },
    keyStats: { power: "585 HP", zeroTo100: "4,5 s", topSpeed: "240 km/h", fuel: "Essence super" },
    performance: { hp: "585 HP", torque: "850 Nm", zeroTo100: "4,5 s", topSpeed: "240 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "4MATIC intégrale", gearbox: "AMG SPEEDSHIFT TCT 9G" },
    equipment: {
      seats: "5",
      wheels: "Jantes AMG 22 pouces",
      brakes: "Disques perforés haute performance",
      suspension: "AMG Ride Control adaptative",
      exterior: "Calandre Panamericana, échappement latéral AMG",
      interior: "Cuir Nappa Exclusif, Burmester 3D, MBUX double écran",
    },
  },
  {
    id: "range-rover-autobiography",
    name: "Autobiography LWB",
    brand: "Range Rover",
    year: 2024,
    category: "SUV de Luxe",
    location: "Kinshasa",
    pricePerDay: 350,
    image: galleries.rangeRover[0],
    gallery: galleries.rangeRover,
    specs: { hp: 530, seats: 5, transmission: "Automatique", fuel: "Essence super" },
    description:
      "Le summum du confort britannique. Idéal pour les déplacements VIP, les protocoles d'affaires et les longs trajets en toute sérénité.",
    conditions: { deposit: "3 500 000 FCFA", minAge: "25+", licenseYears: "3 ans", dailyKm: "300 km" },
    keyStats: { power: "530 HP", zeroTo100: "4,6 s", topSpeed: "250 km/h", fuel: "Essence super" },
    performance: { hp: "530 HP", torque: "750 Nm", zeroTo100: "4,6 s", topSpeed: "250 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Intégrale permanente", gearbox: "Auto 8 vit. ZF" },
    equipment: {
      seats: "5",
      wheels: "Jantes 23 pouces diamantées",
      brakes: "Disques ventilés haute performance",
      suspension: "Air Suspension adaptative",
      exterior: "Toit panoramique, marche-pieds déployables, LED matriciels",
      interior: "Cuir semi-aniline, Meridian Signature, sièges massants",
    },
  },
  {
    id: "rolls-cullinan",
    name: "Cullinan Black Badge",
    brand: "Rolls-Royce",
    year: 2024,
    category: "Ultra Luxe",
    location: "Kinshasa",
    pricePerDay: 8500,
    image: galleries.rollsCullinan[0],
    gallery: galleries.rollsCullinan,
    specs: { hp: 600, seats: 5, transmission: "Automatique", fuel: "Essence super" },
    description:
      "Le SUV ultime selon Rolls-Royce. Une bulle de silence, de cuir et de raffinement absolu pour des moments véritablement inoubliables.",
    conditions: { deposit: "8 000 000 FCFA", minAge: "30+", licenseYears: "5 ans", dailyKm: "200 km" },
    keyStats: { power: "600 HP", zeroTo100: "5,2 s", topSpeed: "250 km/h", fuel: "Essence super" },
    performance: { hp: "600 HP", torque: "900 Nm", zeroTo100: "5,2 s", topSpeed: "250 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Intégrale", gearbox: "ZF 8 vit. à anticipation satellite" },
    equipment: {
      seats: "5",
      wheels: "Jantes 22 pouces noires",
      brakes: "Disques haute performance",
      suspension: "Planar Suspension auto-nivelante",
      exterior: "Spirit of Ecstasy noir, Starlight Doors",
      interior: "Cuir double couture, Starlight Headliner, bar champagne",
    },
  },
  {
    id: "bentley-continental",
    name: "Continental GT Speed",
    brand: "Bentley",
    year: 2024,
    category: "Grand Tourisme",
    location: "Kinshasa",
    pricePerDay: 6200,
    image: galleries.bentleyCont[0],
    gallery: galleries.bentleyCont,
    specs: { hp: 659, seats: 4, transmission: "Automatique", fuel: "Essence super" },
    description:
      "L'alliance parfaite entre puissance brute et artisanat britannique. La grande routière par excellence.",
    conditions: { deposit: "6 000 000 FCFA", minAge: "28+", licenseYears: "5 ans", dailyKm: "250 km" },
    keyStats: { power: "659 HP", zeroTo100: "3,6 s", topSpeed: "335 km/h", fuel: "Essence super" },
    performance: { hp: "659 HP", torque: "900 Nm", zeroTo100: "3,6 s", topSpeed: "335 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "Intégrale active", gearbox: "Double embrayage 8 vit." },
    equipment: {
      seats: "4",
      wheels: "Jantes 22 pouces forgées",
      brakes: "Carbone-céramique en option",
      suspension: "Bentley Dynamic Ride 48V",
      exterior: "Calandre Speed, échappement sport noir",
      interior: "Cuir matrix diamond, marqueterie bois, Naim Audio",
    },
  },
  {
    id: "bmw-m4",
    name: "M4 Competition",
    brand: "BMW",
    year: 2024,
    category: "Sport",
    location: "Kinshasa",
    pricePerDay: 280,
    image: galleries.bmwM4[0],
    gallery: galleries.bmwM4,
    specs: { hp: 530, seats: 4, transmission: "Automatique", fuel: "Essence super" },
    description:
      "Une coupé sportive radicale, taillée pour les passionnés de conduite. Performance pure dans une élégance allemande.",
    conditions: { deposit: "3 000 000 FCFA", minAge: "25+", licenseYears: "3 ans", dailyKm: "250 km" },
    keyStats: { power: "530 HP", zeroTo100: "3,5 s", topSpeed: "290 km/h", fuel: "Essence super" },
    performance: { hp: "530 HP", torque: "650 Nm", zeroTo100: "3,5 s", topSpeed: "290 km/h" },
    drivetrain: { fuel: "Essence super", transmission: "xDrive intégrale", gearbox: "M Steptronic 8 vit." },
    equipment: {
      seats: "4",
      wheels: "Jantes M forgées 19/20 pouces",
      brakes: "M Compound, carbone-céramique en option",
      suspension: "Adaptive M suspension",
      exterior: "Kit aéro M, double sortie d'échappement",
      interior: "Sièges M Carbon, Harman Kardon, Live Cockpit Pro",
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
