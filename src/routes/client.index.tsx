/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Car,
  Calendar,
  DollarSign,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { listBookings, listVehicles, type Booking } from "@/lib/admin/store";
import { formatPrice } from "@/lib/vehicles";
import type { ClientAccount } from "@/lib/client/auth";
import { useClientAccount } from "./client";
import { useConciergeChat } from "@/components/ConciergeChatWidget";

export const Route = createFileRoute("/client/")({
  component: ClientDashboard,
});

function ClientDashboard() {
  const { account } = useClientAccount() as { account: ClientAccount };
  const { openChat } = useConciergeChat();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    listBookings({ clientEmail: account.email, clientPhone: account.phone }).then(setBookings);
    listVehicles().then(setVehicles);
  }, [account.id]);

  // Filter bookings for this client
  const clientBookings = useMemo(() => {
    const email = account.email.trim().toLowerCase();
    const phoneClean = account.phone.replace(/\D/g, "");
    
    return bookings.filter((b) => {
      const bEmail = b.clientEmail?.trim().toLowerCase();
      const bPhoneClean = b.clientPhone.replace(/\D/g, "");
      
      const emailMatch = email && bEmail === email;
      const phoneMatch = phoneClean && bPhoneClean.includes(phoneClean);
      
      // Also fallback to names if email/phone are missing (just in case)
      const nameMatch = b.clientName.toLowerCase().includes(account.firstName.toLowerCase()) && 
                        b.clientName.toLowerCase().includes(account.lastName.toLowerCase());
                        
      return emailMatch || phoneMatch || nameMatch;
    });
  }, [bookings, account]);

  // Calculations
  const stats = useMemo(() => {
    const active = clientBookings.filter((b) => ["en_attente", "confirmee", "payee"].includes(b.status));
    const paidOrDone = clientBookings.filter((b) => ["payee", "terminee"].includes(b.status));
    const totalSpent = paidOrDone.reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      activeCount: active.length,
      historyCount: clientBookings.length,
      totalSpent,
    };
  }, [clientBookings]);

  // Find next upcoming booking
  const nextBooking = useMemo(() => {
    const active = clientBookings.filter((b) => ["en_attente", "confirmee", "payee"].includes(b.status));
    if (active.length === 0) return null;
    
    // Sort by start date ascending
    return active.sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  }, [clientBookings]);

  const nextBookingVehicle = useMemo(() => {
    if (!nextBooking) return null;
    return vehicles.find((v) => v.id === nextBooking.vehicleId);
  }, [nextBooking, vehicles]);

  // Quick Action lists
  const actions = [
    {
      bookTo: "/location-vehicules" as const,
      manageTo: "/client/reservations" as const,
      title: "Location de Véhicules",
      description: "Louez des supercars et berlines de prestige.",
      icon: Car,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20",
    },
    {
      bookTo: "/demenagement" as const,
      manageTo: "/client/demenagement" as const,
      title: "Déménagement",
      description: "Demandez un devis logistique clé en main.",
      icon: Truck,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20",
    },
    {
      bookTo: "/services-sur-mesure" as const,
      manageTo: "/client/sur-mesure" as const,
      title: "Services Sur Mesure",
      description: "Votre concierge dédié s'occupe de tout.",
      icon: Sparkles,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-charbon to-charbon/80 p-6 md:p-8">
        <div className="absolute right-0 top-0 w-80 h-full bg-or-vif/5 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="text-xs uppercase tracking-widest text-or-vif font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-or-vif animate-ping" />
            Espace Membre YOLO
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
            Bonjour, {account.firstName} !
          </h1>
          <p className="text-sm text-white/60">
            Ravi de vous accueillir sur votre espace personnel. Suivez vos commandes en cours, accédez à vos historiques et gérez vos réservations de conciergerie 24/7.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-white/5 bg-charbon p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Réservations Actives</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.activeCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-charbon p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Total Dépensé</p>
            <p className="text-2xl font-bold text-white mt-0.5">${formatPrice(stats.totalSpent)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-charbon p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Total Commandes</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.historyCount}</p>
          </div>
        </div>
      </div>

      {/* Upcoming booking & Support Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Booking Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white/80">Prochaine réservation</h2>
          {nextBooking ? (
            <div className="rounded-xl border border-white/10 bg-charbon overflow-hidden group hover:border-or-vif/40 transition-colors">
              {nextBookingVehicle && (
                <div className="relative h-48 bg-black">
                  <img
                    src={nextBookingVehicle.image}
                    alt={nextBooking.vehicleName}
                    className="h-full w-full object-cover opacity-80 group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charbon via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                      nextBooking.status === "payee"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : nextBooking.status === "confirmee"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {nextBooking.status === "payee"
                        ? "Payée"
                        : nextBooking.status === "confirmee"
                        ? "Confirmée"
                        : "En attente de validation"}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{nextBooking.vehicleName}</h3>
                  <p className="text-xs text-white/40 mt-1">ID Réservation : {nextBooking.id}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 text-sm">
                  <div>
                    <span className="block text-xs text-white/40">Début</span>
                    <span className="font-medium mt-0.5 block">{nextBooking.startDate}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-white/40">Fin</span>
                    <span className="font-medium mt-0.5 block">{nextBooking.endDate} ({nextBooking.days} j)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/40 block">Montant</span>
                    <span className="text-lg font-bold text-or-vif">${formatPrice(nextBooking.totalPrice)}</span>
                  </div>
                  <Link
                    to="/client/reservations"
                    className="inline-flex items-center gap-1.5 text-xs text-or-vif hover:text-white transition-colors"
                  >
                    Voir le détail
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-charbon/30 p-8 text-center flex flex-col items-center justify-center space-y-4 h-64">
              <Car className="h-10 w-10 text-white/20" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Aucune réservation active</p>
                <p className="text-xs text-white/40 max-w-xs">
                  Vous n'avez pas de location de voiture ou de service planifié pour le moment.
                </p>
              </div>
              <Link
                to="/location-vehicules"
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors"
              >
                Découvrir la flotte
              </Link>
            </div>
          )}
        </div>

        {/* Support Card Column */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white/80">Concierge YOLO</h2>
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-charbon to-charbon/80 p-6 space-y-6 flex flex-col justify-between h-[21.5rem]">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-lg bg-or-vif/10 flex items-center justify-center text-or-vif">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Une question, une modification ?</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Utilisez le chat concierge en bas à droite de l&apos;écran — disponible sur toutes les pages du site.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] text-white/40 bg-white/3 border border-white/5 p-2.5 rounded-lg">
                💡 Réponse instantanée 24/7 via le bouton « Concierge ».
              </div>
              <button
                type="button"
                onClick={openChat}
                className="w-full py-3 rounded-xl bg-or-vif text-charbon text-xs font-semibold hover:bg-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Ouvrir le chat
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services shortcuts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white/80">Réserver un nouveau service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.title}
                className="rounded-xl border border-white/5 bg-charbon p-5 flex flex-col justify-between group hover:border-or-vif/20 transition-all"
              >
                <div className="space-y-4">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${act.color} flex items-center justify-center border`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{act.title}</h3>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{act.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-5">
                  <Link
                    to={act.bookTo}
                    className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-white font-medium px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    Nouvelle demande
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to={act.manageTo}
                    className="inline-flex items-center gap-1 text-[11px] text-or-vif font-medium px-3 py-1.5 rounded-lg bg-or-vif/10 hover:bg-or-vif/20 transition-colors"
                  >
                    Mes demandes
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
