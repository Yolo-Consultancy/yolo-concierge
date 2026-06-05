/* eslint-disable prettier/prettier */
// Couche de persistance locale (localStorage) en attendant le backend Express.
// Chaque entité a sa propre clé. Le format est volontairement proche d'une API REST :
// liste -> create -> update -> delete. Quand le backend sera prêt, remplace
// le corps de ces fonctions par des appels fetch (voir src/lib/api/client.ts).

import { vehicles as seedVehicles, type Vehicle } from "@/lib/vehicles";

const KEYS = {
  vehicles: "yolo.admin.vehicles",
  bookings: "yolo.admin.bookings",
  clients: "yolo.admin.clients",
  users: "yolo.admin.users",
  missions: "yolo.admin.missions",
  drivers: "yolo.admin.drivers",
  settings: "yolo.admin.settings",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/* ============================================================
   VÉHICULES — fusion config + overrides admin
   ============================================================ */
export function listVehicles(): Vehicle[] {
  return read<Vehicle[]>(KEYS.vehicles, seedVehicles);
}
export function saveVehicles(list: Vehicle[]) {
  write(KEYS.vehicles, list);
}
export function upsertVehicle(v: Vehicle) {
  const list = listVehicles();
  const i = list.findIndex((x) => x.id === v.id);
  if (i >= 0) list[i] = v;
  else list.unshift(v);
  saveVehicles(list);
}
export function deleteVehicle(id: string) {
  saveVehicles(listVehicles().filter((v) => v.id !== id));
}
export function resetVehicles() {
  saveVehicles(seedVehicles);
}

/* ============================================================
   RÉSERVATIONS
   ============================================================ */
export type BookingStatus = "en_attente" | "confirmee" | "payee" | "terminee" | "annulee";
export type Booking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  days: number;
  pickupLocation: string;
  totalPrice: number;
  withChauffeur: boolean;
  driverId: string;
  driverName: string;
  status: BookingStatus;
  createdAt: string;
};
const seedBookings: Booking[] = [
  {
    id: "b-001", vehicleId: "ferrari-488", vehicleName: "Ferrari 488 GTB",
    clientName: "Patrick Mwamba", clientPhone: "+243 81 234 5678",
    startDate: "2026-06-10", endDate: "2026-06-12", days: 2,
    pickupLocation: "Aéroport de N'djili", totalPrice: 900,
    withChauffeur: false, driverId: "", driverName: "",
    status: "confirmee", createdAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "b-002", vehicleId: "mercedes-g63", vehicleName: "Mercedes AMG G 63",
    clientName: "Sarah Lukumu", clientPhone: "+243 99 876 5432",
    startDate: "2026-06-15", endDate: "2026-06-18", days: 3,
    pickupLocation: "Hôtel Pullman", totalPrice: 1500,
    withChauffeur: true, driverId: "u-003", driverName: "Joseph Mbaya",
    status: "payee", createdAt: "2026-06-02T14:30:00Z",
  },
  {
    id: "b-003", vehicleId: "rolls-cullinan", vehicleName: "Rolls-Royce Cullinan",
    clientName: "Jean-Paul Tshibanda", clientPhone: "+243 82 111 2233",
    startDate: "2026-06-20", endDate: "2026-06-21", days: 1,
    pickupLocation: "Villa Gombe", totalPrice: 850,
    withChauffeur: false, driverId: "", driverName: "",
    status: "en_attente", createdAt: "2026-06-03T09:15:00Z",
  },
];
export function listBookings(): Booking[] {
  return read<Booking[]>(KEYS.bookings, seedBookings);
}
export function saveBookings(list: Booking[]) { write(KEYS.bookings, list); }
export function updateBookingStatus(id: string, status: BookingStatus) {
  saveBookings(listBookings().map((b) => (b.id === id ? { ...b, status } : b)));
}
export function assignBookingDriver(id: string, driverId: string, driverName: string) {
  saveBookings(
    listBookings().map((b) =>
      b.id === id ? { ...b, driverId, driverName, withChauffeur: !!driverId } : b
    )
  );
}
export function deleteBooking(id: string) {
  saveBookings(listBookings().filter((b) => b.id !== id));
}

/* ============================================================
   CLIENTS (CRM léger)
   ============================================================ */
export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  notes: string;
  createdAt: string;
};
const seedClients: Client[] = [
  { id: "c-001", firstName: "Patrick", lastName: "Mwamba", email: "patrick@example.cd", phone: "+243 81 234 5678", totalBookings: 3, totalSpent: 18500, notes: "Client VIP, préfère les SUV", createdAt: "2026-01-15" },
  { id: "c-002", firstName: "Sarah", lastName: "Lukumu", email: "sarah.l@example.cd", phone: "+243 99 876 5432", totalBookings: 5, totalSpent: 34200, notes: "Réserve souvent pour événements pro", createdAt: "2026-02-03" },
  { id: "c-003", firstName: "Jean-Paul", lastName: "Tshibanda", email: "jp.tshibanda@example.cd", phone: "+243 82 111 2233", totalBookings: 1, totalSpent: 8500, notes: "", createdAt: "2026-05-22" },
];
export function listClients(): Client[] { return read<Client[]>(KEYS.clients, seedClients); }
export function saveClients(list: Client[]) { write(KEYS.clients, list); }
export function upsertClient(c: Client) {
  const list = listClients();
  const i = list.findIndex((x) => x.id === c.id);
  if (i >= 0) list[i] = c; else list.unshift(c);
  saveClients(list);
}
export function deleteClient(id: string) {
  saveClients(listClients().filter((c) => c.id !== id));
}

/* ============================================================
   UTILISATEURS internes (équipe YOLO)
   ============================================================ */
export type UserRole = "admin" | "agent" | "chauffeur";
export type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};
const seedUsers: TeamUser[] = [
  { id: "u-001", name: "Admin YOLO", email: "admin@yolo.cd", role: "admin", active: true, createdAt: "2026-01-01" },
  { id: "u-002", name: "Marie Kabasele", email: "marie@yolo.cd", role: "agent", active: true, createdAt: "2026-02-10" },
  { id: "u-003", name: "Joseph Mbaya", email: "joseph@yolo.cd", role: "chauffeur", active: true, createdAt: "2026-03-05" },
];
export function listUsers(): TeamUser[] { return read<TeamUser[]>(KEYS.users, seedUsers); }
export function saveUsers(list: TeamUser[]) { write(KEYS.users, list); }
export function upsertUser(u: TeamUser) {
  const list = listUsers();
  const i = list.findIndex((x) => x.id === u.id);
  if (i >= 0) list[i] = u; else list.unshift(u);
  saveUsers(list);
}
export function deleteUser(id: string) {
  saveUsers(listUsers().filter((u) => u.id !== id));
}

/* ============================================================
   MISSIONS — affectation d'une réservation à un agent/chauffeur
   ============================================================ */
export type MissionStatus = "a_affecter" | "en_cours" | "terminee";
export type Mission = {
  id: string;
  bookingId: string;
  assigneeId: string; // user id
  assigneeName: string;
  type: "livraison" | "chauffeur" | "recuperation";
  scheduledAt: string;
  status: MissionStatus;
  notes: string;
};
const seedMissions: Mission[] = [
  { id: "m-001", bookingId: "b-002", assigneeId: "u-003", assigneeName: "Joseph Mbaya", type: "livraison", scheduledAt: "2026-06-15T09:00:00Z", status: "en_cours", notes: "Livraison à l'hôtel Pullman" },
  { id: "m-002", bookingId: "b-003", assigneeId: "", assigneeName: "", type: "livraison", scheduledAt: "2026-06-20T10:00:00Z", status: "a_affecter", notes: "" },
];
export function listMissions(): Mission[] { return read<Mission[]>(KEYS.missions, seedMissions); }
export function saveMissions(list: Mission[]) { write(KEYS.missions, list); }
export function upsertMission(m: Mission) {
  const list = listMissions();
  const i = list.findIndex((x) => x.id === m.id);
  if (i >= 0) list[i] = m; else list.unshift(m);
  saveMissions(list);
}
export function deleteMission(id: string) {
  saveMissions(listMissions().filter((m) => m.id !== id));
}

/* ============================================================
   PARAMÈTRES DU SITE
   ============================================================ */
export type SiteSettings = {
  companyName: string;
  whatsappNumber: string;
  contactEmail: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  depositCurrency: string;
};
const defaultSettings: SiteSettings = {
  companyName: "YOLO Le Concierge",
  whatsappNumber: "243828863897",
  contactEmail: "contact@yolo.cd",
  address: "Kinshasa, République Démocratique du Congo",
  heroTitle: "Une seule plateforme, tous vos services.",
  heroSubtitle: "Conciergerie premium 24/7 — Mobilité, Logistique, Sur Mesure.",
  depositCurrency: "FCFA",
};
export function getSettings(): SiteSettings { return read<SiteSettings>(KEYS.settings, defaultSettings); }
export function saveSettings(s: SiteSettings) { write(KEYS.settings, s); }

/* ============================================================
   CHAUFFEURS (catalogue dédié — distinct de l'équipe interne)
   ============================================================ */
export type DriverAvailability = "disponible" | "occupe" | "indisponible";
export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  photo: string;           // URL de la photo
  pricePerDay: number;     // tarif jour (en devise du site)
  availability: DriverAvailability;
  active: boolean;         // false = désactivé (n'apparaît plus côté client)
  experienceYears: number;
  languages: string;       // ex: "Français, Lingala"
  notes: string;
  createdAt: string;
};
const seedDrivers: Driver[] = [
  {
    id: "d-001", firstName: "Joseph", lastName: "Mbaya",
    phone: "+243 81 555 1122",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    pricePerDay: 80, availability: "disponible", active: true,
    experienceYears: 8, languages: "Français, Lingala, Anglais",
    notes: "Chauffeur VIP, expérience véhicules de luxe.", createdAt: "2026-01-10",
  },
  {
    id: "d-002", firstName: "Pascal", lastName: "Kalonji",
    phone: "+243 99 222 3344",
    photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
    pricePerDay: 70, availability: "disponible", active: true,
    experienceYears: 5, languages: "Français, Lingala",
    notes: "Spécialisé SUV et longues distances.", createdAt: "2026-02-14",
  },
  {
    id: "d-003", firstName: "André", lastName: "Bwanga",
    phone: "+243 82 777 8899",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    pricePerDay: 95, availability: "occupe", active: true,
    experienceYears: 12, languages: "Français, Lingala, Swahili",
    notes: "Chauffeur protocole / officiels.", createdAt: "2026-03-02",
  },
];
export function listDrivers(): Driver[] { return read<Driver[]>(KEYS.drivers, seedDrivers); }
export function listActiveDrivers(): Driver[] {
  return listDrivers().filter((d) => d.active);
}
export function saveDrivers(list: Driver[]) { write(KEYS.drivers, list); }
export function upsertDriver(d: Driver) {
  const list = listDrivers();
  const i = list.findIndex((x) => x.id === d.id);
  if (i >= 0) list[i] = d; else list.unshift(d);
  saveDrivers(list);
}
export function deleteDriver(id: string) {
  saveDrivers(listDrivers().filter((d) => d.id !== id));
}
export function toggleDriverActive(id: string) {
  saveDrivers(listDrivers().map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
}

/* ============================================================
   UTIL
   ============================================================ */
export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}
