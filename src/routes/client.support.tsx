/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Sparkles,
  Check,
  PhoneCall,
  Loader2,
} from "lucide-react";
import type { ClientAccount } from "@/lib/client/auth";
import { toast } from "sonner";
import { useClientAccount } from "./client";

export const Route = createFileRoute("/client/support")({
  component: ClientSupport,
});

type ChatMessage = {
  id: string;
  sender: "client" | "agent";
  text: string;
  timestamp: string;
};

const MESSAGES_KEY = "yolo.client.support.messages";

function ClientSupport() {
  const { account } = useClientAccount() as { account: ClientAccount };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage or initialize with seed messages
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (raw) {
      try {
        setMessages(JSON.parse(raw) as ChatMessage[]);
      } catch {
        initializeSeedMessages();
      }
    } else {
      initializeSeedMessages();
    }
  }, []);

  const initializeSeedMessages = () => {
    const seed: ChatMessage[] = [
      {
        id: "m-init-1",
        sender: "agent",
        text: `Bonjour ${account.firstName} ! Je suis votre assistant concierge YOLO dédié. Comment puis-je vous accompagner aujourd'hui ?`,
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: "m-init-2",
        sender: "agent",
        text: "Vous pouvez me poser des questions sur votre location en cours, demander des modifications d'horaires, ou requérir un service sur mesure (chauffeur additionnel, garde du corps, traiteur, navette, etc.).",
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(seed);
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(seed));
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const saveMessages = (list: ChatMessage[]) => {
    setMessages(list);
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-client-${Date.now()}`,
      sender: "client",
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setInputText("");

    // Trigger Agent Simulated Response
    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("heure") || lower.includes("modifier") || lower.includes("horaire") || lower.includes("date")) {
        replyText = `Certainement, nous pouvons modifier cela pour vous. Veuillez m'indiquer la référence de votre réservation (ex. b-001) ainsi que les nouveaux horaires souhaités. Notre équipe de chauffeurs et logisticiens ajustera le planning immédiatement.`;
      } else if (lower.includes("sur-mesure") || lower.includes("mesure") || lower.includes("vip") || lower.includes("evenement") || lower.includes("garde") || lower.includes("securite")) {
        replyText = `YOLO s'occupe de vos exigences les plus exclusives. Nous proposons des services de gardes du corps, assistants personnels bilingues, chefs à domicile, traiteurs de luxe et réservations dans les clubs sélects de Kinshasa. Quelle prestation souhaitez-vous planifier et pour quelle date ?`;
      } else if (lower.includes("paiement") || lower.includes("payer") || lower.includes("stripe") || lower.includes("carte") || lower.includes("facture")) {
        replyText = `Je comprends. Si vous rencontrez un problème pour finaliser le règlement en ligne, vous pouvez opter pour un paiement par virement ou directement en agence (Showroom Gombe). Veuillez me spécifier le numéro de réservation concerné pour que nos services financiers vérifient son statut.`;
      } else if (lower.includes("chauffeur") || lower.includes("driver")) {
        replyText = `Nos chauffeurs YOLO sont formés aux standards VIP internationaux (conduite défensive, discrétion, multilinguisme). Si vous souhaitez ajouter un chauffeur à votre location existante, le tarif est de $80/jour. Souhaitez-vous que je l'ajoute à l'une de vos réservations ?`;
      } else {
        replyText = `J'ai bien reçu votre message : "${textToSend.trim()}". Un concierge YOLO étudie votre demande. Nous reprenons contact avec vous dans quelques minutes par chat ou directement par téléphone au ${account.countryCode} ${account.phone} si une intervention rapide est requise.`;
      }

      const agentMsg: ChatMessage = {
        id: `m-agent-${Date.now()}`,
        sender: "agent",
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      saveMessages([...updated, agentMsg]);
    }, 1500 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleClearHistory = () => {
    if (window.confirm("Voulez-vous réinitialiser l'historique du chat de support ?")) {
      initializeSeedMessages();
      toast.success("Historique du chat réinitialisé.");
    }
  };

  // Suggestion chips
  const suggestions = [
    "Modifier l'heure d'une réservation",
    "Demander un service sur mesure",
    "Problème de paiement en ligne",
    "Ajouter un chauffeur privé",
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-10rem)] max-h-[800px] min-h-[500px]">
      {/* Support Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 shrink-0">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Support Conciergerie</h1>
          <p className="text-xs text-white/50 mt-1">Discutez en direct avec votre assistant YOLO dédié.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Concierge en ligne
          </div>
          <button
            onClick={handleClearHistory}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Effacer l'historique
          </button>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((msg) => {
          const isAgent = msg.sender === "agent";
          const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 max-w-[85%] sm:max-w-[75%] ${
                isAgent ? "" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                isAgent 
                  ? "bg-[#7dd3fc]/10 border border-[#7dd3fc]/30 text-[#7dd3fc]" 
                  : "bg-white/10 border border-white/10 text-white"
              }`}>
                {isAgent ? "Y" : account.firstName[0].toUpperCase()}
              </div>

              {/* Bubble & Timestamp */}
              <div className="space-y-1.5">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                  isAgent 
                    ? "bg-[#0f0f12] border-white/10 text-white" 
                    : "bg-[#7dd3fc] border-[#7dd3fc]/20 text-black shadow-lg shadow-[#7dd3fc]/5"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className={`text-[10px] text-white/30 flex items-center gap-1 ${
                  isAgent ? "" : "justify-end"
                }`}>
                  <Clock className="h-2.5 w-2.5" />
                  {time}
                  {!isAgent && <Check className="h-2.5 w-2.5 text-[#7dd3fc]" />}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3.5 max-w-[75%]">
            <div className="h-8 w-8 rounded-full bg-[#7dd3fc]/10 border border-[#7dd3fc]/30 flex items-center justify-center text-[#7dd3fc] text-xs font-bold">
              Y
            </div>
            <div className="space-y-1.5">
              <div className="rounded-2xl px-5 py-3.5 bg-[#0f0f12] border border-white/10 text-white flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips & Chat Input panel */}
      <div className="pt-4 border-t border-white/5 space-y-4 shrink-0 bg-[#070708]">
        {/* Suggestion chips (only show if typing or inactive to keep layout clean) */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs bg-white/3 border border-white/5 hover:border-[#7dd3fc]/40 hover:bg-white/5 text-white/70 hover:text-white px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex gap-3 items-center"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Saisissez votre message au concierge..."
              className="w-full bg-[#0f0f12] border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#7dd3fc]/30 transition"
            />
            <button
              type="button"
              onClick={() => {
                window.location.href = `tel:${account.countryCode}${account.phone}`;
                toast.success("Lancement de l'appel téléphonique...");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-[#7dd3fc] transition-colors"
              title="Appeler par téléphone"
            >
              <PhoneCall className="h-4 w-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-12 w-12 rounded-2xl bg-[#7dd3fc] text-black hover:bg-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
