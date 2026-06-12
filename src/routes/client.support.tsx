/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Send,
  Clock,
  Check,
  PhoneCall,
} from "lucide-react";
import type { ClientAccount } from "@/lib/client/auth";
import { toast } from "sonner";
import { useClientAccount } from "./client";
import {
  listSupportMessages,
  sendSupportMessage,
  resetSupportMessages,
  type ChatMessage,
} from "@/lib/client/support";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export const Route = createFileRoute("/client/support")({
  component: ClientSupport,
});

function ClientSupport() {
  const { ask, dialog } = useConfirmDialog();
  const { account } = useClientAccount() as { account: ClientAccount };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listSupportMessages()
      .then(setMessages)
      .catch(() => toast.error("Impossible de charger le chat support."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setIsTyping(true);
    try {
      const updated = await sendSupportMessage(textToSend.trim());
      setMessages(updated);
      setInputText("");
    } catch {
      toast.error("Envoi du message impossible.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    ask({
      title: "Effacer l'historique du chat ?",
      description: "Tous vos messages de support seront supprimés. Le concierge vous enverra un nouveau message de bienvenue.",
      confirmLabel: "Effacer",
      variant: "warning",
      onConfirm: async () => {
        try {
          const updated = await resetSupportMessages();
          setMessages(updated);
          toast.success("Historique du chat réinitialisé.");
        } catch {
          toast.error("Réinitialisation impossible.");
        }
      },
    });
  };

  const suggestions = [
    "Modifier l'heure d'une réservation",
    "Demander un service sur mesure",
    "Problème de paiement en ligne",
    "Ajouter un chauffeur privé",
  ];

  if (loading) {
    return <p className="text-white/50 text-sm">Chargement du support...</p>;
  }

  return (
    <>
    <div className="flex-1 flex flex-col h-[calc(100vh-10rem)] max-h-[800px] min-h-[500px]">
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
          <button onClick={handleClearHistory} className="text-xs text-white/40 hover:text-white transition-colors">
            Effacer l'historique
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((msg) => {
          const isAgent = msg.sender === "agent";
          const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={msg.id} className={`flex items-start gap-3.5 max-w-[85%] sm:max-w-[75%] ${isAgent ? "" : "ml-auto flex-row-reverse"}`}>
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${isAgent ? "bg-[#7dd3fc]/10 border border-[#7dd3fc]/30 text-[#7dd3fc]" : "bg-white/10 border border-white/10 text-white"}`}>
                {isAgent ? "Y" : account.firstName[0].toUpperCase()}
              </div>
              <div className="space-y-1.5">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border ${isAgent ? "bg-[#0f0f12] border-white/10 text-white" : "bg-[#7dd3fc] border-[#7dd3fc]/20 text-black"}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className={`text-[10px] text-white/30 flex items-center gap-1 ${isAgent ? "" : "justify-end"}`}>
                  <Clock className="h-2.5 w-2.5" />
                  {time}
                  {!isAgent && <Check className="h-2.5 w-2.5 text-[#7dd3fc]" />}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-start gap-3.5 max-w-[75%]">
            <div className="h-8 w-8 rounded-full bg-[#7dd3fc]/10 border border-[#7dd3fc]/30 flex items-center justify-center text-[#7dd3fc] text-xs font-bold">Y</div>
            <div className="rounded-2xl px-5 py-3.5 bg-[#0f0f12] border border-white/10 text-white flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-white/5 space-y-4 shrink-0 bg-[#070708]">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button key={suggestion} onClick={() => handleSend(suggestion)} className="text-xs bg-white/3 border border-white/5 hover:border-[#7dd3fc]/40 hover:bg-white/5 text-white/70 hover:text-white px-3 py-1.5 rounded-full transition cursor-pointer">
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void handleSend(inputText); }} className="flex gap-3 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Saisissez votre message au concierge..."
              className="w-full bg-[#0f0f12] border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#7dd3fc]/30 transition"
            />
            <button type="button" onClick={() => { window.location.href = `tel:${account.countryCode}${account.phone}`; toast.success("Lancement de l'appel téléphonique..."); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-[#7dd3fc] transition-colors" title="Appeler par téléphone">
              <PhoneCall className="h-4 w-4" />
            </button>
          </div>
          <button type="submit" disabled={!inputText.trim() || isTyping} className="h-12 w-12 rounded-2xl bg-[#7dd3fc] text-black hover:bg-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
    {dialog}
    </>
  );
}
