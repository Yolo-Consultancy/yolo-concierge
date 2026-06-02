import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-white drop-shadow-lg">
            YOLO<span className="text-gold"> .</span>
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-white/80 hidden sm:inline">
            Le Concierge
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/90">
          <Link to="/location-vehicules" className="hover:text-gold transition-colors">Véhicules</Link>
          <Link to="/demenagement" className="hover:text-gold transition-colors">Déménagement</Link>
          <Link to="/services-sur-mesure" className="hover:text-gold transition-colors">Sur Mesure</Link>
        </nav>
      </div>
    </header>
  );
}
