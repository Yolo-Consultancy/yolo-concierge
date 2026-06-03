/* eslint-disable prettier/prettier */
// Configuration des options de réservation du BookingModal.
// Modifiez ces valeurs pour changer le numéro WhatsApp ou les textes des boutons
// sans avoir à toucher au composant BookingModal.

export const bookingConfig = {
  // Numéro WhatsApp au format international SANS le "+" (ex: "243828863897")
  whatsappNumber: "243828863897",

  // Bouton WhatsApp
  whatsapp: {
    label: "Envoyer sur WhatsApp",
  },

  // Bouton "Payer en ligne"
  payOnline: {
    label: "Payer en ligne",
    // Message affiché quand le paiement en ligne n'est pas encore disponible
    unavailableMessage:
      "Le paiement en ligne sera disponible prochainement. Veuillez utiliser WhatsApp pour finaliser votre réservation.",
  },
};
