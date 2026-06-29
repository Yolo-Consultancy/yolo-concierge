import { Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { PORTALS, type PortalId } from "@/config/portals";
import { contactSearch } from "@/lib/auth/redirect";
import { YoloLogo } from "@/components/YoloLogo";

type SiteFooterProps = {
  portalId?: PortalId;
  variant?: "light" | "dark" | "compact";
  className?: string;
};

const portalLinks = Object.values(PORTALS);

export function SiteFooter({ portalId, variant = "light", className = "" }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const currentPortal = portalId ? PORTALS[portalId] : null;

  if (variant === "compact") {
    return (
      <footer
        className={`mt-auto border-t border-white/10 px-6 py-4 text-center text-[11px] text-white/45 ${className}`}
      >
        © {year} YOLO Le Concierge ·{" "}
        <Link to="/" className="text-white/60 hover:text-or-vif transition-colors">
          Tous les portails
        </Link>
        {" · "}
        <Link to="/contact" search={contactSearch()} className="text-white/60 hover:text-or-vif transition-colors">
          Contact
        </Link>
      </footer>
    );
  }

  const isDark = variant === "dark";

  return (
    <footer
      className={`border-t ${
        isDark
          ? "border-white/10 bg-charbon text-white"
          : "border-black/10 bg-[var(--yolo-cream)] text-charbon"
      } ${className}`}
    >
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="text-center md:text-left">
            <YoloLogo
              variant={isDark ? "white" : "black"}
              size="lg"
              className={isDark ? "" : "mx-auto md:mx-0"}
              imgClassName={isDark ? "" : "mx-auto md:mx-0"}
            />
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-white/65" : "text-[var(--yolo-muted)]"}`}>
              Conciergerie premium à Kinshasa — location, déménagement et services sur mesure.
            </p>
          </div>

          <nav className="text-center md:text-left">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 ${
                isDark ? "text-or-vif" : "text-or-bronze"
              }`}
            >
              Nos portails
            </p>
            <ul className={`space-y-2 text-sm ${isDark ? "text-white/75" : "text-charbon/80"}`}>
              {portalLinks.map((portal) => (
                <li key={portal.id}>
                  <Link
                    to={portal.publicPath as "/location-vehicules"}
                    className={`transition-colors ${
                      isDark ? "hover:text-white" : "hover:text-charbon"
                    } ${
                      portalId === portal.id
                        ? isDark
                          ? "text-or-vif font-medium"
                          : "text-or-bronze font-medium"
                        : ""
                    }`}
                  >
                    {portal.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-center md:text-left">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 ${
                isDark ? "text-or-vif" : "text-or-bronze"
              }`}
            >
              Liens utiles
            </p>
            <ul className={`space-y-2 text-sm ${isDark ? "text-white/75" : "text-charbon/80"}`}>
              <li>
                <Link
                  to="/contact"
                  search={portalId ? contactSearch(portalId) : undefined}
                  className="hover:text-or-vif transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/connexion" search={{ mode: "login" }} className="hover:text-or-vif transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={`inline-flex items-center justify-center md:justify-start gap-1.5 hover:text-or-vif transition-colors ${
                    isDark ? "text-white/75" : "text-charbon/80"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 text-or-vif" />
                  Tous les portails
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-8 border-t pt-6 text-center text-xs uppercase tracking-widest ${
            isDark ? "border-white/10 text-white/45" : "border-black/8 text-[var(--yolo-muted)]"
          }`}
        >
          © {year} YOLO Le Concierge
          {currentPortal ? ` · ${currentPortal.name}` : ""}
        </div>
      </div>
    </footer>
  );
}
