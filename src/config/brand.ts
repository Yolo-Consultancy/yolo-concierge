/* eslint-disable prettier/prettier */
/** Charte graphique YOLO Le Concierge */
export const BRAND = {
  orBronze: "#B6812C",
  charbon: "#2B2B2B",
  orVif: "#EDB32B",
} as const;

export type BrandColor = keyof typeof BRAND;
