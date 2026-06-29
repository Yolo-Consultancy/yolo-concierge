/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import logoWhite from "@/assets/logos/logo-white.svg";
import logoBlack from "@/assets/logos/logo-black.svg";
import logoYellow from "@/assets/logos/logo-yellow.svg";

export type YoloLogoVariant = "white" | "black" | "yellow";
export type YoloLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const SOURCES: Record<YoloLogoVariant, string> = {
  white: logoWhite,
  black: logoBlack,
  yellow: logoYellow,
};

const HEIGHTS: Record<YoloLogoSize, string> = {
  xs: "h-6",
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
  xl: "h-14",
};

type YoloLogoProps = {
  variant?: YoloLogoVariant;
  size?: YoloLogoSize;
  subtitle?: string;
  subtitleClassName?: string;
  to?: string;
  className?: string;
  imgClassName?: string;
  centered?: boolean;
};

export function YoloLogo({
  variant = "white",
  size = "md",
  subtitle,
  subtitleClassName,
  to,
  className = "",
  imgClassName = "",
  centered = false,
}: YoloLogoProps) {
  const defaultSubtitleCls =
    variant === "black"
      ? "text-[10px] uppercase tracking-[0.3em] text-charbon/60"
      : "text-[10px] uppercase tracking-[0.3em] text-white/70";

  const content = (
    <>
      <img
        src={SOURCES[variant]}
        alt="YOLO Le Concierge"
        className={`${HEIGHTS[size]} w-auto max-w-[min(200px,45vw)] object-contain object-left ${imgClassName}`}
      />
      {subtitle ? (
        <span
          className={`${subtitleClassName ?? defaultSubtitleCls} ${centered ? "text-center" : ""}`}
        >
          {subtitle}
        </span>
      ) : null}
    </>
  );

  const wrapperCls = `flex flex-col gap-0.5 min-w-0 shrink-0 ${
    centered ? "items-center" : "items-start"
  } ${className}`;

  if (to) {
    return (
      <Link to={to as "/"} className={`${wrapperCls} hover:opacity-90 transition-opacity`}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperCls}>{content}</div>;
}
