/* eslint-disable prettier/prettier */
import type { ReactNode } from "react";

type Variant = "primary" | "outline-light" | "dark" | "outline-dark";

const styles: Record<Variant, string> = {
  primary:
    "bg-or-vif text-charbon border border-or-vif hover:bg-charbon hover:text-white hover:border-charbon",
  "outline-light":
    "border-2 border-white/90 text-white hover:bg-white hover:text-charbon",
  dark: "bg-charbon text-white border border-charbon hover:bg-or-vif hover:text-charbon hover:border-or-vif",
  "outline-dark":
    "border border-charbon/20 text-charbon bg-transparent hover:bg-charbon hover:text-white",
};

export function PortalButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`yolo-portal-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
