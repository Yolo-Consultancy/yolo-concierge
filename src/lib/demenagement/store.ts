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

export type MovingMission = {
  id: string;
  contactMessageId: string;
  assigneeId: string;
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

export async function listBusyMoverIds(excludeMissionId?: string): Promise<string[]> {
  const q = excludeMissionId ? `?excludeMissionId=${excludeMissionId}` : "";
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
