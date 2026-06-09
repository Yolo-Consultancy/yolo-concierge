/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Car,
  Calendar,
  MapPin,
  User,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { listBookings, listVehicles, updateBookingStatus, type Booking } from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";
import type { ClientAccount } from "@/lib/client/auth";
import { toast } from "sonner";
import { useClientAccount } from "./client";

export const Route = createFileRoute("/client/reservations")({
  component: ClientReservations,
});

function ClientReservations() {
  const { account } = useClientAccount() as { account: ClientAccount };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const loadData = () => {
    setBookings(listBookings());
    setVehicles(listVehicles());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter bookings for this client
  const clientBookings = useMemo(() => {
    const email = account.email.trim().toLowerCase();
    const phoneClean = account.phone.replace(/\D/g, "");
    
    return bookings.filter((b) => {
      const bEmail = b.clientEmail?.trim().toLowerCase();
      const bPhoneClean = b.clientPhone.replace(/\D/g, "");
      
      const emailMatch = email && bEmail === email;
      const phoneMatch = phoneClean && bPhoneClean.includes(phoneClean);
      
      const nameMatch = b.clientName.toLowerCase().includes(account.firstName.toLowerCase()) && 
                        b.clientName.toLowerCase().includes(account.lastName.toLowerCase());
                        
      return emailMatch || phoneMatch || nameMatch;
    });
  }, [bookings, account]);

  // Split into active and history
  const { activeBookings, historyBookings } = useMemo(() => {
    const active = clientBookings.filter((b) => ["en_attente", "confirmee", "payee"].includes(b.status));
    const history = clientBookings.filter((b) => ["terminee", "annulee"].includes(b.status));
    
    // Sort active by date ascending, history by date descending
    return {
      activeBookings: active.sort((a, b) => a.startDate.localeCompare(b.startDate)),
      historyBookings: history.sort((a, b) => b.startDate.localeCompare(a.startDate)),
    };
  }, [clientBookings]);

  const displayedBookings = activeTab === "active" ? activeBookings : historyBookings;

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.")) {
      updateBookingStatus(bookingId, "annulee");
      toast.success("Votre demande de réservation a été annulée.");
      loadData(); // reload store data
    }
  };

  const getVehicleData = (vehicleId: string) => {
    return vehicles.find((v) => v.id === vehicleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Mes Réservations</h1>
          <p className="text-xs text-white/50 mt-1">Consultez, suivez et gérez l'état de vos réservations de services.</p>
        </div>
        <Link
          to="/location-vehicules"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7dd3fc] px-5 py-2.5 text-xs font-semibold text-black hover:bg-white transition cursor-pointer self-start"
        >
          <Car className="h-4 w-4" />
          Réserver un véhicule
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 space-x-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 text-sm font-semibold tracking-wide transition-all relative ${
            activeTab === "active" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
          }`}
        >
          Réservations actives ({activeBookings.length})
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7dd3fc] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 text-sm font-semibold tracking-wide transition-all relative ${
            activeTab === "history" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
          }`}
        >
          Historique des commandes ({historyBookings.length})
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7dd3fc] rounded-full" />
          )}
        </button>
      </div>

      {/* Bookings List */}
      {displayedBookings.length > 0 ? (
        <div className="space-y-6">
          {displayedBookings.map((b) => {
            const vehicle = getVehicleData(b.vehicleId);
            return (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-[#0f0f12] overflow-hidden flex flex-col md:flex-row"
              >
                {/* Vehicle Thumbnail Column */}
                <div className="w-full md:w-80 h-48 md:h-auto bg-black shrink-0 relative">
                  {vehicle ? (
                    <img
                      src={vehicle.image}
                      alt={b.vehicleName}
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-white/5">
                      <Car className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 md:hidden">
                    <StatusBadge status={b.status} />
                  </div>
                </div>

                {/* Details Column */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block">Réf : {b.id}</span>
                        <h3 className="text-xl font-semibold text-white mt-0.5">{b.vehicleName}</h3>
                        {vehicle && (
                          <p className="text-xs text-white/50">
                            {vehicle.category} · {vehicle.specs.hp} HP · {vehicle.specs.transmission}
                          </p>
                        )}
                      </div>
                      <div className="hidden md:block">
                        <StatusBadge status={b.status} />
                      </div>
                    </div>

                    {/* Meta info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 border-t border-white/5 pt-4 text-xs leading-relaxed">
                      <div className="space-y-1">
                        <span className="text-white/40 uppercase tracking-wider block font-medium">Dates & Durée</span>
                        <div className="flex items-center gap-1.5 text-white/90">
                          <Calendar className="h-3.5 w-3.5 text-[#7dd3fc]" />
                          <span>{b.startDate} au {b.endDate}</span>
                        </div>
                        <span className="text-white/60 block pl-5">{b.days} jour{b.days > 1 ? "s" : ""} de location</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-white/40 uppercase tracking-wider block font-medium">Lieu de livraison</span>
                        <div className="flex items-center gap-1.5 text-white/90">
                          <MapPin className="h-3.5 w-3.5 text-[#7dd3fc]" />
                          <span className="truncate">{b.pickupLocation}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-white/40 uppercase tracking-wider block font-medium">Option Chauffeur</span>
                        <div className="flex items-center gap-1.5 text-white/90">
                          <User className="h-3.5 w-3.5 text-[#7dd3fc]" />
                          <span>
                            {b.withChauffeur ? (
                              b.driverName ? `Chauffeur : ${b.driverName}` : "Chauffeur YOLO affecté"
                            ) : (
                              "Sans chauffeur"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Actions footer */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-white/5 pt-4">
                    <div>
                      <span className="text-xs text-white/40 block">Détail du prix</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-white">${formatPrice(b.totalPrice)}</span>
                        {b.withChauffeur && (
                          <span className="text-xs text-white/50">
                            (incl. chauffeur : ${formatPrice(b.days * 80)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* Only allow cancelling pending reservations */}
                      {b.status === "en_attente" && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition cursor-pointer"
                        >
                          Annuler ma demande
                        </button>
                      )}
                      <Link
                        to="/client/support"
                        className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        Support Concierge
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f0f12]/30 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Car className="h-12 w-12 text-white/20" />
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-semibold text-lg text-white">Aucune réservation trouvée</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              {activeTab === "active"
                ? "Vous n'avez aucune réservation active ou en attente. Louez un véhicule ou composez un service sur mesure pour démarrer."
                : "Votre historique de réservations passées est vide."}
            </p>
          </div>
          <Link
            to="/location-vehicules"
            className="px-6 py-3 rounded-full bg-[#7dd3fc] text-black text-xs font-semibold hover:bg-white transition shadow-lg shadow-[#7dd3fc]/10"
          >
            Découvrir notre flotte de luxe
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Status Badge helper component ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "en_attente":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25">
          <Clock className="h-3 w-3" />
          En attente
        </span>
      );
    case "confirmee":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/25">
          <CheckCircle2 className="h-3 w-3" />
          Confirmée
        </span>
      );
    case "payee":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          <CheckCircle2 className="h-3 w-3" />
          Payée & Validée
        </span>
      );
    case "terminee":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/60 border border-white/10">
          <CheckCircle2 className="h-3 w-3" />
          Terminée
        </span>
      );
    case "annulee":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
          <XCircle className="h-3 w-3" />
          Annulée
        </span>
      );
    default:
      return null;
  }
}
