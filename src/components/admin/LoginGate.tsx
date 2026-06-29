/* eslint-disable prettier/prettier */
import { useState, type FormEvent } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle, User, UserPlus } from "lucide-react";
import { login, register } from "@/lib/admin/auth";
import { YoloLogo } from "@/components/YoloLogo";

type Tab = "login" | "register";

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState<Tab>("login");

  // ── Connexion ────────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd]   = useState(false);
  const [loginError, setLoginError]       = useState("");
  const [loginLoading, setLoginLoading]   = useState(false);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const ok = await login(loginEmail, loginPassword);
    if (ok) {
      onSuccess();
    } else {
      setLoginError("Adresse e-mail ou mot de passe incorrect.");
      setLoginLoading(false);
    }
  };

  // ── Inscription ──────────────────────────────────────────────────────────
  const [reg, setReg] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [showRegPwd, setShowRegPwd]   = useState(false);
  const [showRegPwd2, setShowRegPwd2] = useState(false);
  const [regError, setRegError]       = useState("");
  const [regLoading, setRegLoading]   = useState(false);

  const submitRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);
    const err = await register(reg);
    if (err) {
      setRegError(err);
      setRegLoading(false);
    } else {
      onSuccess();
    }
  };

  // ── Style helpers ────────────────────────────────────────────────────────
  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-or-vif/60 focus:ring-2 focus:ring-or-vif/20 transition";
  const inputCls2 = // with right padding for the eye button
    "w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-or-vif/60 focus:ring-2 focus:ring-or-vif/20 transition";

  return (
    <div className="min-h-screen bg-charbon flex items-center justify-center px-4 font-sans" data-yolo-space>
      {/* Background radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(237,179,43,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <YoloLogo variant="white" size="xl" centered className="mx-auto" />
          <p className="mt-3 text-xs uppercase tracking-[0.4em] text-white/40">
            Espace Administrateur
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden">

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/10">
            {([ ["login", "Connexion"], ["register", "Inscription"] ] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setLoginError(""); setRegError(""); }}
                className={`flex-1 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
                  tab === t
                    ? "text-or-vif border-b-2 border-or-vif bg-or-vif/5"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {t === "login"
                  ? <Lock className="h-3.5 w-3.5" />
                  : <UserPlus className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* ────────────────── CONNEXION ────────────────── */}
            {tab === "login" && (
              <>
                <div className="mb-6">
                  <h1 className="font-display text-xl font-semibold text-white">Connexion</h1>
                  <p className="text-sm text-white/40 mt-1">Accès réservé à l'équipe YOLO.</p>
                </div>

                <form onSubmit={submitLogin} className="space-y-4" noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-login-email"
                        type="email"
                        autoComplete="email"
                        required
                        autoFocus
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                        placeholder="admin@yolo.cd"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-login-password"
                        type={showLoginPwd ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                        placeholder="••••••••"
                        className={inputCls2}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowLoginPwd(!showLoginPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                        aria-label={showLoginPwd ? "Masquer" : "Afficher"}
                      >
                        {showLoginPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {loginError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300">{loginError}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginLoading || !loginEmail || !loginPassword}
                    className="w-full mt-2 py-3 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                        Connexion…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Se connecter
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-white/30 pt-1">
                    Pas encore de compte ?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("register")}
                      className="text-or-vif hover:underline"
                    >
                      Créer un compte
                    </button>
                  </p>
                </form>
              </>
            )}

            {/* ────────────────── INSCRIPTION ────────────────── */}
            {tab === "register" && (
              <>
                <div className="mb-6">
                  <h1 className="font-display text-xl font-semibold text-white">Créer un compte</h1>
                  <p className="text-sm text-white/40 mt-1">
                    Accès administrateur YOLO — réservé à l'équipe.
                  </p>
                </div>

                <form onSubmit={submitRegister} className="space-y-4" noValidate>
                  {/* Nom complet */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-reg-name"
                        type="text"
                        autoComplete="name"
                        required
                        autoFocus
                        value={reg.name}
                        onChange={(e) => { setReg({ ...reg, name: e.target.value }); setRegError(""); }}
                        placeholder="Marie Kabasele"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-reg-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={reg.email}
                        onChange={(e) => { setReg({ ...reg, email: e.target.value }); setRegError(""); }}
                        placeholder="marie@yolo.cd"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Mot de passe <span className="text-white/25">(6 car. min.)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-reg-password"
                        type={showRegPwd ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={reg.password}
                        onChange={(e) => { setReg({ ...reg, password: e.target.value }); setRegError(""); }}
                        placeholder="••••••••"
                        className={inputCls2}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowRegPwd(!showRegPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                        aria-label={showRegPwd ? "Masquer" : "Afficher"}
                      >
                        {showRegPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmer mot de passe */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-reg-confirm"
                        type={showRegPwd2 ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={reg.confirmPassword}
                        onChange={(e) => { setReg({ ...reg, confirmPassword: e.target.value }); setRegError(""); }}
                        placeholder="••••••••"
                        className={inputCls2}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowRegPwd2(!showRegPwd2)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                        aria-label={showRegPwd2 ? "Masquer" : "Afficher"}
                      >
                        {showRegPwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {reg.password && (
                    <div className="flex gap-1.5 items-center">
                      {[...Array(4)].map((_, i) => {
                        const strength = Math.min(4, Math.floor(reg.password.length / 3));
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i < strength
                                ? strength <= 1 ? "bg-red-500"
                                : strength <= 2 ? "bg-amber-400"
                                : strength <= 3 ? "bg-yellow-300"
                                : "bg-emerald-400"
                              : "bg-white/10"
                            }`}
                          />
                        );
                      })}
                      <span className="text-[10px] text-white/30 ml-1">
                        {reg.password.length < 6 ? "Trop court"
                          : reg.password.length < 9 ? "Faible"
                          : reg.password.length < 12 ? "Moyen"
                          : "Fort"}
                      </span>
                    </div>
                  )}

                  {/* Error */}
                  {regError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300">{regError}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={regLoading || !reg.name || !reg.email || !reg.password || !reg.confirmPassword}
                    className="w-full mt-2 py-3 rounded-xl bg-or-vif text-black text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {regLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                        Création…
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Créer mon compte
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-white/30 pt-1">
                    Déjà inscrit ?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("login")}
                      className="text-or-vif hover:underline"
                    >
                      Se connecter
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/20">
          © {new Date().getFullYear()} YOLO Le Concierge — Accès sécurisé
        </p>
      </div>
    </div>
  );
}
