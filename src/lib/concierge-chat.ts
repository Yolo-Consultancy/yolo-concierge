/* eslint-disable prettier/prettier */
import type { ChatMessage } from "@/lib/client/support";

const GUEST_STORAGE_KEY = "yolo-guest-concierge-chat";

export function guestWelcomeMessages(): ChatMessage[] {
  const now = new Date().toISOString();
  return [
    {
      id: "welcome-1",
      sender: "agent",
      text: "Bonjour ! Je suis le concierge YOLO. Comment puis-je vous renseigner ?",
      timestamp: now,
    },
    {
      id: "welcome-2",
      sender: "agent",
      text: "Location de véhicules, déménagement, services sur mesure — posez votre question.",
      timestamp: now,
    },
  ];
}

export function loadGuestMessages(): ChatMessage[] {
  if (typeof window === "undefined") return guestWelcomeMessages();
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return guestWelcomeMessages();
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : guestWelcomeMessages();
  } catch {
    return guestWelcomeMessages();
  }
}

export function saveGuestMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(messages));
}

export function clearGuestMessages(): ChatMessage[] {
  const welcome = guestWelcomeMessages();
  saveGuestMessages(welcome);
  return welcome;
}

export function buildConciergeAutoReply(
  text: string,
  contact?: { firstName?: string; phone?: string; countryCode?: string },
): string {
  const lower = text.toLowerCase();
  if (lower.includes("heure") || lower.includes("modifier") || lower.includes("horaire") || lower.includes("date")) {
    return "Nous pouvons ajuster vos horaires. Indiquez votre référence de réservation et les nouveaux créneaux souhaités.";
  }
  if (
    lower.includes("sur-mesure") ||
    lower.includes("mesure") ||
    lower.includes("vip") ||
    lower.includes("evenement") ||
    lower.includes("garde") ||
    lower.includes("securite")
  ) {
    return "YOLO propose conciergerie VIP, événementiel et assistance sur mesure. Décrivez votre besoin ou rendez-vous sur « Services sur mesure ».";
  }
  if (lower.includes("demenagement") || lower.includes("déménagement") || lower.includes("devis")) {
    return "Pour un devis déménagement clé en main à Kinshasa, décrivez volume et date souhaitée, ou utilisez notre page Contact.";
  }
  if (lower.includes("location") || lower.includes("voiture") || lower.includes("vehicule") || lower.includes("véhicule")) {
    return "Notre flotte premium est disponible à Kinshasa avec livraison et chauffeur optionnel. Consultez « Location véhicules » pour réserver.";
  }
  if (lower.includes("paiement") || lower.includes("payer") || lower.includes("carte") || lower.includes("facture")) {
    return "Pour une question de paiement, précisez votre numéro de réservation. Notre équipe vérifiera le statut rapidement.";
  }
  if (lower.includes("chauffeur") || lower.includes("driver")) {
    return "Nos chauffeurs VIP sont disponibles en option sur vos locations. Souhaitez-vous en ajouter un à une réservation ?";
  }
  if (lower.includes("humain") || lower.includes("agent") || lower.includes("appeler") || lower.includes("telephone") || lower.includes("téléphone")) {
    return "Un concierge humain peut vous rappeler. Rendez-vous sur la page Contact ou connectez-vous pour un suivi personnalisé.";
  }

  const name = contact?.firstName?.trim();
  const phone =
    contact?.phone && contact?.countryCode
      ? `${contact.countryCode} ${contact.phone}`
      : "";

  if (name && phone) {
    return `Merci ${name}, j'ai bien reçu votre message. Un concierge vous recontactera au ${phone}.`;
  }
  return "Merci pour votre message. Un concierge YOLO vous répondra rapidement. Connectez-vous pour un suivi personnalisé.";
}

export function computeTypingDelay(userText: string, replyText?: string): number {
  const base = 700;
  const perChar = 20;
  const length = (replyText ?? userText).length;
  return Math.min(3000, Math.max(base, length * perChar));
}

export function appendGuestUserMessage(messages: ChatMessage[], userText: string): ChatMessage[] {
  const now = new Date().toISOString();
  const next: ChatMessage[] = [
    ...messages,
    { id: `client-${now}`, sender: "client", text: userText.trim(), timestamp: now },
  ];
  saveGuestMessages(next);
  return next;
}

export function appendGuestAgentReply(
  messages: ChatMessage[],
  userText: string,
  contact?: {
    firstName?: string;
    phone?: string;
    countryCode?: string;
  },
): ChatMessage[] {
  const next: ChatMessage[] = [
    ...messages,
    {
      id: `agent-${Date.now()}`,
      sender: "agent",
      text: buildConciergeAutoReply(userText, contact),
      timestamp: new Date().toISOString(),
    },
  ];
  saveGuestMessages(next);
  return next;
}

export function appendGuestExchange(messages: ChatMessage[], userText: string, contact?: {
  firstName?: string;
  phone?: string;
  countryCode?: string;
}): ChatMessage[] {
  return appendGuestAgentReply(appendGuestUserMessage(messages, userText), userText, contact);
}

export const CONCIERGE_SUGGESTIONS = [
  "Location de véhicule",
  "Devis déménagement",
  "Service sur mesure",
  "Modifier une réservation",
];
