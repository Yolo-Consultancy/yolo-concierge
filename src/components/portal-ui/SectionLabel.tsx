/* eslint-disable prettier/prettier */
import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="yolo-section-label text-[11px] font-semibold uppercase tracking-[0.2em] text-or-bronze mb-3">
      {children}
    </p>
  );
}
