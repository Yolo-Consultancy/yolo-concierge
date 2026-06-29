/* eslint-disable prettier/prettier */
import { useState } from "react";
import { registerClient, loginClient, type ClientAccount } from "@/lib/client/auth";
import type { PortalId } from "@/config/portals";
import { ContactPhoneField } from "@/components/ContactPhoneField";
import { phoneDigitsOnly, phoneMaxLength } from "@/lib/phone-field";

type Mode = "choice" | "login" | "register";

interface Props {
  onSuccess: (account: ClientAccount) => void;
  onClose: () => void;
  onContinueAsGuest: () => void;
  portal?: PortalId;
}

const inputCls =
  "w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-or-vif";
const SELECT_OPTION_CLS = "bg-charbon text-white";

export function ClientAuthModal({ onSuccess, onClose, onContinueAsGuest, portal }: Props) {
  const [mode, setMode] = useState<Mode>("choice");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
    password: "",
    confirmPassword: "",
  });
  const [regError, setRegError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    const result = await loginClient(loginEmail, loginPassword);
    setLoading(false);
    if (result.ok) {
      onSuccess(result.account);
    } else {
      setLoginError(result.error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (reg.password !== reg.confirmPassword) {
      setRegError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const result = await registerClient({ ...reg, ...(portal ? { portal } : {}) });
    setLoading(false);
    if (result.ok) {
      onSuccess(result.account);
    } else {
      setRegError(result.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-charbon border border-white/10 rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            {mode !== "choice" && (
              <button
                onClick={() => setMode("choice")}
                className="text-white/50 hover:text-white"
                aria-label="Retour"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h3 className="font-display text-xl text-white">
                {mode === "choice"
                  ? "Votre espace YOLO"
                  : mode === "login"
                  ? "Connexion"
                  : "Créer un compte"}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                {mode === "choice"
                  ? "Connectez-vous ou créez un compte pour réserver"
                  : mode === "login"
                  ? "Accédez à votre espace personnel"
                  : "Rejoignez YOLO en quelques secondes"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-t border-white/10" />

        <div className="p-6">
          {/* ── Mode Choix ── */}
          {mode === "choice" && (
            <div className="space-y-3">
              {/* Benefits */}
              <div className="rounded-xl bg-or-vif/5 border border-or-vif/20 p-4 mb-5">
                <p className="text-xs font-medium text-or-vif mb-2 uppercase tracking-wider">
                  Avantages d'un compte
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Historique de vos réservations",
                    "Coordonnées pré-remplies à chaque réservation",
                    "Offres exclusives et tarifs préférentiels",
                    "Suivi de vos demandes en temps réel",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/70">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setMode("register")}
                className="w-full py-3.5 rounded-xl bg-or-vif text-black text-sm font-medium hover:bg-white transition flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11h-6" />
                </svg>
                Créer mon compte YOLO
              </button>

              <button
                onClick={() => setMode("login")}
                className="w-full py-3.5 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 text-white flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
                J'ai déjà un compte
              </button>

              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={onContinueAsGuest}
                className="w-full py-3 rounded-xl text-sm text-white/50 hover:text-white/70 transition"
              >
                Continuer sans compte →
              </button>
            </div>
          )}

          {/* ── Mode Connexion ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2" data-required>Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="claudinekakesa@gmail.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2" data-required>Mot de passe</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-or-vif text-black text-sm font-medium hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <p className="text-center text-xs text-white/40">
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-or-vif hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            </form>
          )}

          {/* ── Mode Inscription ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-2" data-required>Prénom</label>
                  <input
                    required
                    value={reg.firstName}
                    onChange={(e) => setReg({ ...reg, firstName: e.target.value })}
                    placeholder="Prénom"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2" data-required>Nom</label>
                  <input
                    required
                    value={reg.lastName}
                    onChange={(e) => setReg({ ...reg, lastName: e.target.value })}
                    placeholder="Nom"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2" data-required>Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={reg.email}
                  onChange={(e) => setReg({ ...reg, email: e.target.value })}
                  placeholder="claudinekakesa@gmail.com"
                  className={inputCls}
                />
              </div>

              <ContactPhoneField
                required
                variant="dark"
                countryCode={reg.countryCode}
                phone={reg.phone}
                onCountryCodeChange={(countryCode) =>
                  setReg((prev) => ({
                    ...prev,
                    countryCode,
                    phone: phoneDigitsOnly(prev.phone).slice(0, phoneMaxLength(countryCode)),
                  }))
                }
                onPhoneChange={(phone) => setReg({ ...reg, phone })}
                inputCls={inputCls}
              />


              <div>
                <label className="block text-sm font-medium text-white mb-2" data-required>Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  placeholder="6 caractères minimum"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2" data-required>Confirmer le mot de passe</label>
                <input
                  type="password"
                  required
                  value={reg.confirmPassword}
                  onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
                  placeholder="Répétez votre mot de passe"
                  className={inputCls}
                />
              </div>

              {regError && (
                <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {regError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-or-vif text-black text-sm font-medium hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>

              <p className="text-center text-xs text-white/40">
                Déjà inscrit ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-or-vif hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
