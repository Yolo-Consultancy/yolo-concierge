/* eslint-disable prettier/prettier */
import { format } from "date-fns";

export type OccupiedDateRange = { startDate: string; endDate: string };

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Déplie les plages réservées en liste de jours (une Date par jour occupé). */
export function expandOccupiedDates(ranges: OccupiedDateRange[]): Date[] {
  const seen = new Set<string>();
  const result: Date[] = [];

  for (const range of ranges) {
    const cur = parseLocalDate(range.startDate);
    const end = parseLocalDate(range.endDate);
    while (cur <= end) {
      const key = format(cur, "yyyy-MM-dd");
      if (!seen.has(key)) {
        seen.add(key);
        result.push(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  return result;
}
