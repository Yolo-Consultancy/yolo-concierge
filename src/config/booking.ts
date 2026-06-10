/* eslint-disable prettier/prettier */
// Configuration des options de réservation du BookingModal.

export const bookingConfig = {
  currencySymbol: "$",

  // Email destinataire pour les notifications de nouvelles réservations
  adminNotificationEmail: "admin@yolo.cd",

  // Option "Chauffeur"
  chauffeur: {
    enabled: true,
    label: "Ajouter un chauffeur",
    helper: "Recommandé si vous ne souhaitez pas conduire vous-même.",
    pricePerDay: 80,
  },

  reservation: {
    label: "Confirmer la réservation",
    // POST {apiBaseUrl}/api/notifications/new-booking
    notifyAdminPath: "/api/notifications/new-booking",
  },

  missions: {
    // POST {apiBaseUrl}/api/notifications/mission-assigned
    notifyDriverPath: "/api/notifications/mission-assigned",
  },
};
