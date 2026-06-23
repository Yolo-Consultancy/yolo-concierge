/* eslint-disable prettier/prettier */
import { publicApi } from "@/lib/api/client";

export async function getMovingBusyDates(): Promise<string[]> {
  return publicApi.get<string[]>("/moving-missions/busy-dates");
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
