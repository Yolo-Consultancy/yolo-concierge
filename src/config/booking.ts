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

  // Paiement en ligne par carte (Stripe Checkout côté backend Express)
  payOnline: {
    label: "Payer par carte",
    // Endpoint attendu côté backend Node/Express :
    // POST {apiBaseUrl}/api/payments/create-checkout-session
    //   → renvoie { url: string }  (URL Stripe Checkout)
    createSessionPath: "/api/payments/create-checkout-session",
    // Endpoint de notification admin (fallback si paiement indisponible)
    // POST {apiBaseUrl}/api/notifications/new-booking
    notifyAdminPath: "/api/notifications/new-booking",
    // Page de retour après paiement
    successUrl: "/admin",
    cancelUrl: "/location-vehicules",
  },
};
