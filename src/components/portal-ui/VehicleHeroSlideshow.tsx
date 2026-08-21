/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import {
  VEHICLE_HERO_DESKTOP_SLIDES,
  VEHICLE_HERO_MOBILE_SLIDES,
  VEHICLE_HERO_SLIDE_MS,
} from "@/config/vehicle-hero-slides";

type HeroSlide = { id: string; src: string };

function HeroSlideshow({ slides }: { slides: readonly HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, VEHICLE_HERO_SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      {slides.map((slide, index) => {
        const isActive = index === active;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1400 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              key={isActive ? `zoom-${active}` : slide.id}
              src={slide.src}
              alt=""
              width={1920}
              height={1080}
              loading={index === 0 ? "eager" : "lazy"}
              className={`h-full w-full object-cover object-center ${
                isActive ? "vehicle-hero-slide-zoom" : ""
              }`}
            />
          </div>
        );
      })}
    </>
  );
}

export function VehicleHeroSlideshow() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden md:hidden" aria-hidden>
        <HeroSlideshow slides={VEHICLE_HERO_MOBILE_SLIDES} />
      </div>
      <div className="absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
        <HeroSlideshow slides={VEHICLE_HERO_DESKTOP_SLIDES} />
      </div>
    </>
  );
}
