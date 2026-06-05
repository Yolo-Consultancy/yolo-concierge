/* eslint-disable prettier/prettier */
import { useState, type FormEvent } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { login } from "@/lib/admin/auth";
import { adminConfig } from "@/config/admin";

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate a tiny async delay for UX feedback
    setTimeout(() => {
      if (login(email, password)) {
        onSuccess();
      } else {
        setError("Adresse e-mail ou mot de passe incorrect.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background subtle radial */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(125,211,252,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-display text-4xl font-bold text-white">
            YOLO<span className="text-[#7dd3fc]">.</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.4em] text-white/40">
            Espace Administrateur
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="font-display text-xl font-semibold text-white">
              Connexion
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Accès réservé à l'équipe YOLO.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@yolo.cd"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#7dd3fc]/60 focus:ring-2 focus:ring-[#7dd3fc]/20 transition"
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
                  id="admin-password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#7dd3fc]/60 focus:ring-2 focus:ring-[#7dd3fc]/20 transition"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-3 rounded-xl bg-[#7dd3fc] text-black text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
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
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/20">
          © {new Date().getFullYear()} YOLO Le Concierge — Accès sécurisé
        </p>
      </div>
    </div>
  );
}
