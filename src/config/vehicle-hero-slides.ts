/* eslint-disable prettier/prettier */
import hero1 from "@/assets/hero_v/hero1.jpg";
import hero2 from "@/assets/hero_v/hero2.jpg";
import hero3 from "@/assets/hero_v/hero3.jpg";
import hero4 from "@/assets/hero_v/hero4.jpg";
import hero5 from "@/assets/hero_v/hero5.jpg";
import hero6 from "@/assets/hero_v/hero6.jpg";
import desk1 from "@/assets/hero_v/desk1.png";
import desk2 from "@/assets/hero_v/desk2.png";
import desk3 from "@/assets/hero_v/desk3.png";
import desk4 from "@/assets/hero_v/desk4.png";

export const VEHICLE_HERO_MOBILE_SLIDES = [
  { id: "hero-1", src: hero1 },
  { id: "hero-2", src: hero2 },
  { id: "hero-3", src: hero3 },
  { id: "hero-4", src: hero4 },
  { id: "hero-5", src: hero5 },
  { id: "hero-6", src: hero6 },
] as const;

export const VEHICLE_HERO_DESKTOP_SLIDES = [
  { id: "desk-1", src: desk1 },
  { id: "desk-2", src: desk2 },
  { id: "desk-3", src: desk3 },
  { id: "desk-4", src: desk4 },
] as const;

export const VEHICLE_HERO_SLIDE_MS = 6000;
