/* eslint-disable prettier/prettier */
import { api } from "@/lib/api/client";
import { newId } from "@/lib/admin/store";

export type MovingMissionStatus = "a_affecter" | "en_cours" | "terminee";
export type MovingMissionType = "emballage" | "transport" | "montage" | "complet";

export type Mover = {
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

export const MOVER_INPUT_CLS =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function emptyMover(): Mover {
  return {
    id: newId("m"),
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hiredAt: new Date().toISOString().slice(0, 10),
    salary: 0,
    active: true,
    notes: "",
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export type MovingMission = {
  id: string;
  contactMessageId: string;
  assigneeIds: string[];
  assigneeNames: string[];
  /** Premier déménageur — compatibilité */
  assigneeId: string;
  /** Noms concaténés — affichage */
  assigneeName: string;
  type: MovingMissionType;
  scheduledAt: string;
  status: MovingMissionStatus;
  notes: string;
};

function isMongoId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export { newId };

export async function listMovers(): Promise<Mover[]> {
  return api.get<Mover[]>("/movers");
}

export async function upsertMover(m: Mover): Promise<Mover> {
  const { id, createdAt: _c, ...payload } = m;
  return isMongoId(id)
    ? api.put<Mover>(`/movers/${id}`, payload)
    : api.post<Mover>("/movers", payload);
}

export async function deleteMover(id: string): Promise<void> {
  await api.del(`/movers/${id}`);
}

export type MoverDuplicateConflict = {
  field: "email" | "phone";
  type: "mover" | "driver" | "client";
  typeLabel: string;
  id: string;
  name: string;
  email: string;
  phone: string;
};

export async function checkMoverContactDuplicates(
  email: string,
  phone: string,
  excludeMoverId?: string,
): Promise<MoverDuplicateConflict[]> {
  const params = new URLSearchParams();
  if (email.trim()) params.set("email", email.trim());
  if (phone.trim()) params.set("phone", phone.trim());
  if (excludeMoverId && isMongoId(excludeMoverId)) {
    params.set("excludeMoverId", excludeMoverId);
  }
  const q = params.toString();
  if (!q) return [];
  const result = await api.get<{ conflicts: MoverDuplicateConflict[] }>(
    `/movers/check-duplicates?${q}`,
  );
  return result.conflicts ?? [];
}

export async function listMovingMissions(): Promise<MovingMission[]> {
  return api.get<MovingMission[]>("/moving-missions");
}

function toMovingMissionPayload(m: MovingMission) {
  const { id: _id, ...payload } = m;
  return payload;
}

export async function upsertMovingMission(m: MovingMission): Promise<MovingMission> {
  const payload = toMovingMissionPayload(m);
  return isMongoId(m.id)
    ? api.put<MovingMission>(`/moving-missions/${m.id}`, payload)
    : api.post<MovingMission>("/moving-missions", payload);
}

export async function listBusyMoverIds(
  scheduledAt: string,
  excludeMissionId?: string,
): Promise<string[]> {
  const params = new URLSearchParams();
  if (scheduledAt) params.set("scheduledAt", scheduledAt);
  if (excludeMissionId) params.set("excludeMissionId", excludeMissionId);
  const q = params.toString() ? `?${params.toString()}` : "";
  return api.get<string[]>(`/moving-missions/busy-movers${q}`);
}

export async function deleteMovingMission(id: string): Promise<void> {
  await api.del(`/moving-missions/${id}`);
}

export const MOVING_MISSION_STATUS_LABELS: Record<MovingMissionStatus, string> = {
  a_affecter: "À affecter",
  en_cours: "En cours",
  terminee: "Terminée",
};

export const MOVING_MISSION_STATUS_COLORS: Record<MovingMissionStatus, string> = {
  a_affecter: "bg-amber-500/15 text-amber-700",
  en_cours: "bg-blue-500/15 text-blue-700",
  terminee: "bg-emerald-500/15 text-emerald-700",
};

export const MOVING_MISSION_TYPE_LABELS: Record<MovingMissionType, string> = {
  emballage: "Emballage",
  transport: "Transport",
  montage: "Montage / installation",
  complet: "Déménagement complet",
};
