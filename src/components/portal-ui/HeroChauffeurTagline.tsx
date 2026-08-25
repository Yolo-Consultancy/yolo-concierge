import { cn } from "@/lib/utils";

type HeroChauffeurTaglineProps = {
  className?: string;
};

export function HeroChauffeurTagline({ className }: HeroChauffeurTaglineProps) {
  return (
    <p
      className={cn(
        "yolo-hero-tagline mt-5 max-w-lg text-lg md:text-xl leading-relaxed font-medium",
        className,
      )}
      aria-label="Avec chauffeur"
    >
      <span className="yolo-hero-tagline-word text-white/85">Avec</span>{" "}
      <span className="yolo-hero-tagline-accent">
        chauffeur.
        <span className="yolo-hero-tagline-timer" aria-hidden>
          <span className="yolo-hero-tagline-timer-track" />
          <span className="yolo-hero-tagline-timer-spin" />
        </span>
      </span>
    </p>
  );
}
