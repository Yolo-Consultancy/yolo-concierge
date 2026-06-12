/* eslint-disable prettier/prettier */
import { api, getAccessToken, publicApi } from "@/lib/api/client";

async function withAdminAuth<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  if (!getAccessToken()) return fallback;
  try {
    return await call();
  } catch {
    return fallback;
  }
}
import { bookingConfig } from "@/config/booking";
import { vehicles as seedVehicles, type Vehicle } from "@/lib/vehicles";

/* ============================================================
   VÉHICULES
   ============================================================ */
export async function listVehicles(): Promise<Vehicle[]> {
  return publicApi.get<Vehicle[]>("/vehicles");
}

export async function saveVehicles(list: Vehicle[]): Promise<void> {
  for (const v of list) await api.put(`/vehicles/${v.id}`, v);
}

export async function upsertVehicle(v: Vehicle): Promise<Vehicle> {
  const exists = (await listVehicles()).some((x) => x.id === v.id);
  return exists ? api.put<Vehicle>(`/vehicles/${v.id}`, v) : api.post<Vehicle>("/vehicles", v);
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.del(`/vehicles/${id}`);
}

export async function resetVehicles(): Promise<void> {
  const current = await listVehicles();
  for (const v of current) await api.del(`/vehicles/${v.id}`);
  for (const v of seedVehicles) await api.post("/vehicles", v);
}

/* ============================================================
   RÉSERVATIONS
   ============================================================ */
export type BookingStatus = "en_attente" | "confirmee" | "payee" | "terminee" | "annulee";
export type Booking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  startDate: string;
  endDate: string;
  days: number;
  pickupLocation: string;
  dropoffLocation?: string;
  totalPrice: number;
  withChauffeur: boolean;
  driverId: string;
  driverName: string;
  status: BookingStatus;
  createdAt: string;
};

export type ListBookingsOptions = { clientEmail?: string; clientPhone?: string };

export async function listBookings(opts?: ListBookingsOptions): Promise<Booking[]> {
  if (getAccessToken()) {
    return withAdminAuth(() => api.get<Booking[]>("/bookings"), []);
  }
  if (opts?.clientEmail || opts?.clientPhone) {
    const params = new URLSearchParams();
    if (opts.clientEmail) params.set("clientEmail", opts.clientEmail);
    if (opts.clientPhone) params.set("clientPhone", opts.clientPhone);
    return publicApi.get<Booking[]>(`/bookings?${params.toString()}`);
  }
  return [];
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/status`, { status });
}

export async function assignBookingDriver(id: string, driverId: string): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/assign-driver`, { driverId });
}

export async function isDriverAvailableForDates(driverId: string, startDate: string, endDate: string, excludeBookingId?: string): Promise<boolean> {
  const bookings = await listBookings();
  const activeStatuses: BookingStatus[] = ["en_attente", "confirmee", "payee"];
  return !bookings.some((b) => b.driverId === driverId && b.id !== excludeBookingId && activeStatuses.includes(b.status) && b.startDate <= endDate && b.endDate >= startDate);
}

export async function listAvailableDriversForDates(startDate: string, endDate: string, excludeBookingId?: string): Promise<Driver[]> {
  const drivers = await listDrivers();
  const available = await Promise.all(drivers.map(async (d) => (d.active && (await isDriverAvailableForDates(d.id, startDate, endDate, excludeBookingId)) ? d : null)));
  return available.filter(Boolean) as Driver[];
}

function toBookingPayload(b: Booking) {
  return {
    vehicleId: b.vehicleId,
    vehicleName: b.vehicleName,
    clientId: b.clientId,
    clientName: b.clientName,
    clientPhone: b.clientPhone,
    clientEmail: b.clientEmail?.trim().toLowerCase(),
    startDate: b.startDate,
    endDate: b.endDate,
    days: b.days,
    pickupLocation: b.pickupLocation,
    dropoffLocation: b.dropoffLocation,
    withChauffeur: b.withChauffeur,
    driverId: b.driverId || undefined,
    status: b.status,
  };
}

export async function upsertBooking(b: Booking): Promise<Booking> {
  if (b.id && !b.id.startsWith("b-")) {
    return api.put<Booking>(`/bookings/${b.id}`, toBookingPayload(b));
  }
  return publicApi.post<Booking>("/bookings", toBookingPayload(b));
}

export async function deleteBooking(id: string): Promise<void> {
  await api.del(`/bookings/${id}`);
}

/* ============================================================
   CLIENTS
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

export async function listClients(): Promise<Client[]> {
  return withAdminAuth(() => api.get<Client[]>("/clients"), []);
}

export async function upsertClient(c: Client): Promise<Client> {
  const exists = c.id && !c.id.startsWith("c-");
  return exists ? api.put<Client>(`/clients/${c.id}`, c) : api.post<Client>("/clients", c);
}

export async function deleteClient(id: string): Promise<void> {
  await api.del(`/clients/${id}`);
}

/* ============================================================
   UTILISATEURS internes
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

export async function listUsers(): Promise<TeamUser[]> {
  return withAdminAuth(() => api.get<TeamUser[]>("/users"), []);
}

export async function upsertUser(u: TeamUser): Promise<TeamUser> {
  const exists = u.id && !u.id.startsWith("u-");
  return exists ? api.put<TeamUser>(`/users/${u.id}`, u) : api.post<TeamUser>("/users", u);
}

export async function deleteUser(id: string): Promise<void> {
  await api.del(`/users/${id}`);
}

/* ============================================================
   MISSIONS
   ============================================================ */
export type MissionStatus = "a_affecter" | "en_cours" | "terminee";
export type Mission = {
  id: string;
  bookingId: string;
  assigneeId: string;
  assigneeName: string;
  type: "livraison" | "chauffeur" | "recuperation";
  scheduledAt: string;
  status: MissionStatus;
  notes: string;
};

export type MissionSaveResult = Mission & {
  emailSent?: boolean;
  emailReason?: string;
  emailPreviewUrl?: string;
};

export async function listMissions(): Promise<Mission[]> {
  return withAdminAuth(() => api.get<Mission[]>("/missions"), []);
}

function isMongoId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

function toMissionPayload(m: Mission) {
  const { id: _id, ...payload } = m;
  return payload;
}

export async function upsertMission(m: Mission): Promise<MissionSaveResult> {
  const payload = toMissionPayload(m);
  return isMongoId(m.id)
    ? api.put<MissionSaveResult>(`/missions/${m.id}`, payload)
    : api.post<MissionSaveResult>("/missions", payload);
}

export async function listBusyDriverIds(excludeMissionId?: string): Promise<string[]> {
  const q = excludeMissionId ? `?excludeMissionId=${excludeMissionId}` : "";
  return withAdminAuth(() => api.get<string[]>(`/missions/busy-drivers${q}`), []);
}

export async function deleteMission(id: string): Promise<void> {
  await api.del(`/missions/${id}`);
}

/* ============================================================
   PARAMÈTRES
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

export async function getSettings(): Promise<SiteSettings> {
  return publicApi.get<SiteSettings>("/settings");
}

export async function saveSettings(s: SiteSettings): Promise<SiteSettings> {
  return api.put<SiteSettings>("/settings", s);
}

/* ============================================================
   CHAUFFEURS
   ============================================================ */
export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hiredAt: string;
  salary: number;
  active: boolean;
  notes: string;
  createdAt: string;
};

export async function listDrivers(): Promise<Driver[]> {
  return publicApi.get<Driver[]>("/drivers");
}

export async function listActiveDrivers(): Promise<Driver[]> {
  return (await listDrivers()).filter((d) => d.active);
}

export async function upsertDriver(d: Driver): Promise<Driver> {
  const exists = d.id && !d.id.startsWith("d-");
  return exists ? api.put<Driver>(`/drivers/${d.id}`, d) : api.post<Driver>("/drivers", d);
}

export async function deleteDriver(id: string): Promise<void> {
  await api.del(`/drivers/${id}`);
}

export async function toggleDriverActive(id: string): Promise<Driver> {
  return api.patch<Driver>(`/drivers/${id}/toggle-active`, {});
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}
