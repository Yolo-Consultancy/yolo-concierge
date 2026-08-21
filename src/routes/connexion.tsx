/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { registerClient, requestClientPasswordReset, resetClientPassword } from "@/lib/client/auth";
import { CIVILITY_OPTIONS } from "@/lib/client/form-prefill";
import { loginUnified, resolvePostLoginPath, welcomeMessage } from "@/lib/auth/unified-login";
import { notifyAuthChange } from "@/lib/auth/session";
import { toast } from "sonner";
import { z } from "zod";
import { getPortal, type PortalId } from "@/config/portals";
import { SiteFooter } from "@/components/SiteFooter";
import { YoloLogo } from "@/components/YoloLogo";
import { ContactPhoneField } from "@/components/ContactPhoneField";
import { phoneDigitsOnly, phoneMaxLength } from "@/lib/phone-field";

type Mode = "login" | "register" | "forgot" | "reset";

const connexionSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  portal: z.enum(["vehicules", "demenagement", "sur-mesure"]).optional().catch(undefined),
  mode: z.enum(["login", "register", "forgot", "reset"]).optional().catch(undefined),
  token: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — YOLO Le Concierge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: connexionSearchSchema,
  component: ConnexionPage,
});

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-or-vif focus:ring-1 focus:ring-or-vif/50 transition-all";

function ConnexionPage() {
  const { redirect, portal: portalId, mode: initialMode, token: resetToken } = Route.useSearch();
  const portal = portalId ? getPortal(portalId) : null;
  const navigate = useNavigate();
  const initialConnexionMode: Mode =
    initialMode === "reset" && resetToken
      ? "reset"
      : initialMode === "forgot"
        ? "forgot"
        : initialMode === "register"
          ? "register"
          : "login";
  const [mode, setMode] = useState<Mode>(initialConnexionMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [reg, setReg] = useState({
    civility: "M.",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
    password: "",
    confirmPassword: "",
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const result = await requestClientPasswordReset(forgotEmail);
    setLoading(false);
    if (result.ok) {
      setInfo(result.message);
    } else {
      setError(result.error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!resetToken) {
      setError("Lien de réinitialisation invalide.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const result = await resetClientPassword(resetToken, newPassword);
    setLoading(false);

    if (result.ok) {
      toast.success("Mot de passe mis à jour. Vous pouvez vous connecter.");
      navigate({ to: "/connexion", search: { portal: portalId, mode: "login" } });
    } else {
      setError(result.error);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setInfo("");
  };

  const modeTitle =
    mode === "login"
      ? "Connexion"
      : mode === "register"
        ? "Créer un compte client"
        : mode === "forgot"
          ? "Mot de passe oublié"
          : "Nouveau mot de passe";

  const goAfterLogin = (result: Extract<Awaited<ReturnType<typeof loginUnified>>, { ok: true }>) => {
    notifyAuthChange();
    const adminUser = result.role === "admin" ? result.user : undefined;
    const to = resolvePostLoginPath(result.role, redirect, portalId as PortalId | undefined, adminUser);
    navigate({ to });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    const result = await loginUnified(loginEmail, loginPassword, portalId);
    setLoading(false);

    if (result.ok) {
      toast.success(welcomeMessage(result));
      goAfterLogin(result);
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reg.firstName.trim() || !reg.lastName.trim() || !reg.email.trim()) {
      setError("Le prénom, le nom et l'e-mail sont obligatoires.");
      return;
    }

    if (!reg.password.trim() || !reg.confirmPassword.trim()) {
      setError("Le mot de passe et sa confirmation sont obligatoires.");
      return;
    }

    if (reg.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (reg.password !== reg.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const result = await registerClient({
      civility: reg.civility,
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      countryCode: reg.countryCode,
      password: reg.password,
      ...(portalId ? { portal: portalId } : {}),
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Votre compte client a été créé.");
      goAfterLogin({ ok: true, role: "client", account: result.account });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" data-yolo-space>
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-or-vif/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-or-vif/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <YoloLogo variant="yellow" size="lg" to="/" centered className="mx-auto mb-3" />
          <p className="text-sm text-charbon/60">
            {portal
              ? `Connexion — ${portal.name}`
              : "Un compte client pour tous les services YOLO"}
          </p>
        </div>

        <div className="bg-charbon/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          {(mode === "login" || mode === "register") && (
            <div className="flex border-b border-white/10 mb-6 pb-2">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 text-center pb-2 text-sm font-medium ${
                  mode === "login" ? "text-or-vif" : "text-white/40 hover:text-white/60"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 text-center pb-2 text-sm font-medium ${
                  mode === "register" ? "text-or-vif" : "text-white/40 hover:text-white/60"
                }`}
              >
                Créer un compte client
              </button>
            </div>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">{modeTitle}</h2>
              <p className="mt-2 text-xs text-white/50 leading-relaxed">
                {mode === "forgot"
                  ? "Compte client uniquement. Les comptes admin conservent le mot de passe par défaut ou celui défini par l'équipe."
                  : "Choisissez un nouveau mot de passe pour votre compte client."}
              </p>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      switchMode("forgot");
                    }}
                    className="text-xs text-or-vif hover:text-white transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <p className="text-center text-xs text-white/35 pt-1">
                Compte client : accès à la location, au déménagement et au sur mesure.
                {portal ? " Admins et chauffeurs : utilisez vos identifiants portail." : ""}
              </p>
            </form>
          ) : mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">E-mail du compte client</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{error}</div>
              )}
              {info && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs">{info}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-center text-xs text-white/50 hover:text-or-vif transition-colors"
              >
                ← Retour à la connexion
              </button>
            </form>
          ) : mode === "reset" ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6 caractères minimum"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5">
                    Confirmation
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirmer"
                    className={inputCls}
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading || !resetToken}
                className="w-full py-3.5 mt-2 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-center text-xs text-white/50 hover:text-or-vif transition-colors"
              >
                ← Retour à la connexion
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5" data-required>
                  Civilité
                </label>
                <select
                  value={reg.civility}
                  onChange={(e) => setReg({ ...reg, civility: e.target.value })}
                  className={`${inputCls} cursor-pointer`}
                >
                  {CIVILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-charbon text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5" data-required>
                    Prénom
                  </label>
                  <input
                    required
                    value={reg.firstName}
                    onChange={(e) => setReg({ ...reg, firstName: e.target.value })}
                    placeholder="Prénom"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5" data-required>
                    Nom
                  </label>
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
                <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5" data-required>
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    required
                    value={reg.email}
                    onChange={(e) => setReg({ ...reg, email: e.target.value })}
                    placeholder="E-mail"
                    className={`${inputCls} pl-11`}
                  />
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5" data-required>
                    Mot de passe
                  </label>
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
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium mb-1.5" data-required>
                    Confirmation
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={reg.confirmPassword}
                    onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
                    placeholder="Confirmer le mot de passe"
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          {portal && (
            <Link
              to={portal.publicPath as "/demenagement"}
              className="block text-xs text-charbon/50 hover:text-or-vif transition-colors"
            >
              ← Retour au portail {portal.name}
            </Link>
          )}
          <Link to="/" className="block text-xs text-charbon/50 hover:text-or-vif transition-colors">
            Accueil général
          </Link>
        </div>
      </div>
      </div>
      <SiteFooter portalId={portalId} />
    </div>
  );
}
