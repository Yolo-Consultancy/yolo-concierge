/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, UserPlus, Shield } from "lucide-react";
import { loginClient, registerClient } from "@/lib/client/auth";
import { login as loginAdmin, register as registerAdmin } from "@/lib/admin/auth";
import { notifyAuthChange } from "@/lib/auth/session";
import { toast } from "sonner";
import { z } from "zod";

type Espace = "client" | "admin";
type Mode = "login" | "register";

const connexionSearchSchema = z.object({
  espace: z.enum(["client", "admin"]).catch("client"),
  redirect: z.string().optional().catch(undefined),
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
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#7dd3fc]/50 transition-all";

function ConnexionPage() {
  const { espace: initialEspace, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [espace, setEspace] = useState<Espace>(initialEspace);
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [reg, setReg] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
    password: "",
    confirmPassword: "",
  });

  const goAfterLogin = (targetEspace: Espace) => {
    notifyAuthChange();
    const fallback = targetEspace === "admin" ? "/admin" : "/client";
    const to = redirect?.startsWith("/") ? redirect : fallback;
    navigate({ to: to as "/admin" | "/client" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (espace === "admin") {
      const ok = await loginAdmin(loginEmail, loginPassword);
      if (ok) {
        toast.success("Connexion administrateur réussie.");
        goAfterLogin("admin");
      } else {
        setError("Adresse e-mail ou mot de passe incorrect.");
        setLoading(false);
      }
      return;
    }

    const result = await loginClient(loginEmail, loginPassword);
    setLoading(false);
    if (result.ok) {
      toast.success(`Ravi de vous revoir, ${result.account.firstName} !`);
      goAfterLogin("client");
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (reg.password !== reg.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    if (espace === "admin") {
      const err = await registerAdmin({
        name: reg.name,
        email: reg.email,
        password: reg.password,
        confirmPassword: reg.confirmPassword,
      });
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        toast.success("Compte administrateur créé.");
        goAfterLogin("admin");
      }
      return;
    }

    const result = await registerClient({
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      countryCode: reg.countryCode,
      password: reg.password,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Votre compte client a été créé.");
      goAfterLogin("client");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#7dd3fc]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7dd3fc]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="font-display text-3xl font-bold text-white tracking-tight">
              YOLO<span className="text-[#7dd3fc]">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">Le Concierge</span>
          </Link>
          <p className="text-sm text-white/60">Connexion à votre espace</p>
        </div>

        <div className="bg-[#0f0f11]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex border-b border-white/10 mb-6 pb-2">
            <button
              type="button"
              onClick={() => { setEspace("client"); setError(""); }}
              className={`flex-1 text-center pb-2.5 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                espace === "client" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
              }`}
            >
              <User className="h-4 w-4" />
              Client
              {espace === "client" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7dd3fc] rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => { setEspace("admin"); setError(""); }}
              className={`flex-1 text-center pb-2.5 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                espace === "admin" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
              {espace === "admin" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7dd3fc] rounded-full" />}
            </button>
          </div>

          <div className="flex border-b border-white/10 mb-6 pb-2">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 text-center pb-2 text-sm font-medium ${
                mode === "login" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 text-center pb-2 text-sm font-medium ${
                mode === "register" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
              }`}
            >
              {espace === "admin" ? "Inscription équipe" : "Créer un compte"}
            </button>
          </div>

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
                <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">Mot de passe</label>
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
                className="w-full py-3.5 mt-2 rounded-xl bg-[#7dd3fc] text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Connexion..." : espace === "admin" ? "Accéder à l'admin" : "Se connecter"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {espace === "admin" ? (
                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">Nom complet</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      required
                      value={reg.name}
                      onChange={(e) => setReg({ ...reg, name: e.target.value })}
                      placeholder="Nom de l'administrateur"
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    value={reg.firstName}
                    onChange={(e) => setReg({ ...reg, firstName: e.target.value })}
                    placeholder="Prénom"
                    className={inputCls}
                  />
                  <input
                    required
                    value={reg.lastName}
                    onChange={(e) => setReg({ ...reg, lastName: e.target.value })}
                    placeholder="Nom"
                    className={inputCls}
                  />
                </div>
              )}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  placeholder="Mot de passe"
                  className={inputCls}
                />
                <input
                  type="password"
                  required
                  value={reg.confirmPassword}
                  onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
                  placeholder="Confirmation"
                  className={inputCls}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-[#7dd3fc] text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer le compte"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/50 hover:text-[#7dd3fc] transition-colors">
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
