/* eslint-disable prettier/prettier */
import { publicApi } from "@/lib/api/client";

export type MovingBusyMissionSummary = {
  clientName: string;
  moverCount: number;
  moverNames: string[];
  status: "a_affecter" | "en_cours";
};

export type MovingBusyDaySummary = {
  date: string;
  missions: MovingBusyMissionSummary[];
};

export async function getMovingBusyDays(): Promise<MovingBusyDaySummary[]> {
  return publicApi.get<MovingBusyDaySummary[]>("/moving-missions/busy-dates");
}

export function busyDateStringsFromSummaries(days: MovingBusyDaySummary[]): string[] {
  return days.map((d) => d.date);
}

export function parseBusyDateStrings(dates: string[]): Date[] {
  return dates.map((iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
