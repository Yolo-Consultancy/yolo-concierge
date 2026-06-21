/* eslint-disable prettier/prettier */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircle, X, Send, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import {
  listSupportMessages,
  resetSupportMessages,
  sendSupportMessage,
  type ChatMessage,
} from "@/lib/client/support";
import { getCurrentClient, hydrateCurrentClient, type ClientAccount } from "@/lib/client/auth";
import {
  appendGuestExchange,
  clearGuestMessages,
  CONCIERGE_SUGGESTIONS,
  loadGuestMessages,
} from "@/lib/concierge-chat";
import { subscribeAuth } from "@/lib/auth/session";

type ConciergeChatContextValue = {
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  isOpen: boolean;
};

const ConciergeChatContext = createContext<ConciergeChatContextValue | null>(null);

export function useConciergeChat() {
  const ctx = useContext(ConciergeChatContext);
  if (!ctx) {
    throw new Error("useConciergeChat must be used within ConciergeChatProvider");
  }
  return ctx;
}

function clientInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "V";
}

function ConciergeChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [account, setAccount] = useState<ClientAccount | null>(() => getCurrentClient());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshAccount = useCallback(() => {
    setAccount(getCurrentClient());
  }, []);

  const loadMessages = useCallback(async (client: ClientAccount | null) => {
    setLoading(true);
    try {
      if (client) {
        setMessages(await listSupportMessages());
      } else {
        setMessages(loadGuestMessages());
      }
    } catch {
      if (client) {
        toast.error("Impossible de charger le chat.");
      } else {
        setMessages(loadGuestMessages());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateCurrentClient().then((acc) => {
      setAccount(acc);
      void loadMessages(acc);
    });
    return subscribeAuth(() => {
      refreshAccount();
      void hydrateCurrentClient().then((acc) => {
        setAccount(acc);
        void loadMessages(acc);
      });
    });
  }, [loadMessages, refreshAccount]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, open]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;
    setIsTyping(true);
    try {
      if (account) {
        const updated = await sendSupportMessage(textToSend.trim());
        setMessages(updated);
      } else {
        setMessages((prev) =>
          appendGuestExchange(prev, textToSend, undefined),
        );
      }
      setInputText("");
    } catch {
      toast.error("Envoi du message impossible.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    try {
      if (account) {
        setMessages(await resetSupportMessages());
      } else {
        setMessages(clearGuestMessages());
      }
      toast.success("Conversation réinitialisée.");
    } catch {
      toast.error("Réinitialisation impossible.");
    }
  };

  if (!open) return null;

  const displayName = account?.firstName || "Visiteur";

  return (
    <div
      className="fixed bottom-24 right-4 z-[60] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-charbon shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]"
      style={{ height: "min(520px, calc(100vh - 7rem))" }}
      role="dialog"
      aria-label="Chat concierge YOLO"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#1f1f1f] px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-white">Concierge YOLO</p>
          <p className="text-[10px] text-white/45 truncate">
            {account ? `Connecté · ${displayName}` : "Posez vos questions — réponse instantanée"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void handleReset()}
            className="rounded-lg px-2 py-1 text-[10px] text-white/40 hover:text-white"
            title="Nouvelle conversation"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Fermer le chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-4 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] uppercase tracking-wider text-emerald-400/90">Concierge disponible</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <p className="text-center text-xs text-white/40 py-8">Chargement...</p>
        ) : (
          messages.map((msg) => {
            const isAgent = msg.sender === "agent";
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 max-w-[92%] ${isAgent ? "" : "ml-auto flex-row-reverse"}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isAgent
                      ? "bg-or-vif/15 text-or-vif border border-or-vif/30"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {isAgent ? "Y" : clientInitial(displayName)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div
                    className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed border ${
                      isAgent
                        ? "bg-[#1a1a1a] border-white/10 text-white"
                        : "bg-or-vif border-or-vif/20 text-charbon"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[9px] text-white/30 ${isAgent ? "" : "justify-end"}`}
                  >
                    <Clock className="h-2 w-2" />
                    {time}
                    {!isAgent && <Check className="h-2 w-2 text-or-vif" />}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-or-vif/15 text-or-vif text-[10px] font-bold border border-or-vif/30">
              Y
            </div>
            <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 bg-charbon p-3 space-y-2">
        {!account && (
          <Link
            to="/connexion"
            className="block text-center text-[10px] text-or-vif hover:underline"
            onClick={onClose}
          >
            Se connecter pour un suivi personnalisé →
          </Link>
        )}
        <div className="flex flex-wrap gap-1.5">
          {CONCIERGE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void handleSend(suggestion)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/65 hover:border-or-vif/40 hover:text-white transition cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(inputText);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Votre question au concierge..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-or-vif focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-or-vif text-charbon hover:bg-white transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function ConciergeChatProvider({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/driver");

  const value: ConciergeChatContextValue = {
    openChat: () => setOpen(true),
    closeChat: () => setOpen(false),
    toggleChat: () => setOpen((v) => !v),
    isOpen: open,
  };

  return (
    <ConciergeChatContext.Provider value={value}>
      {children}
      {!hidden && (
        <>
          <ConciergeChatPanel open={open} onClose={() => setOpen(false)} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-lg transition-all cursor-pointer ${
              open
                ? "border-white/20 bg-charbon text-white"
                : "border-or-vif/40 bg-or-vif text-charbon hover:bg-white hover:border-white"
            }`}
            aria-expanded={open}
            aria-label={open ? "Fermer le concierge" : "Ouvrir le concierge"}
          >
            {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            <span className="hidden sm:inline">{open ? "Fermer" : "Concierge"}</span>
          </button>
        </>
      )}
    </ConciergeChatContext.Provider>
  );
}
