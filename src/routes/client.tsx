/* eslint-disable prettier/prettier */
import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Compass,
} from "lucide-react";
import { getCurrentClient, registerClient, loginClient, logoutClient, type ClientAccount } from "@/lib/client/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Espace Client — YOLO Le Concierge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClientShell,
});

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#7dd3fc]/50 transition-all";
const selectCls = `${inputCls} bg-[#0f0f0f] text-white [color-scheme:dark]`;
const SELECT_OPTION_CLS = "bg-[#0f0f0f] text-white";

// ─── CLIENT CONTEXT FOR CHILD ROUTES ─────────────────────────────────────────
export const ClientContext = createContext<{ account: ClientAccount | null }>({ account: null });

export function useClientAccount() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClientAccount must be used within a ClientContext.Provider");
  }
  return context;
}

function ClientShell() {
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register inputs
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

  useEffect(() => {
    const current = getCurrentClient();
    setAccount(current);
    setReady(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    const result = loginClient(loginEmail, loginPassword);
    setLoading(false);
    if (result.ok) {
      setAccount(result.account);
      toast.success(`Ravi de vous revoir, ${result.account.firstName} !`);
    } else {
      setLoginError(result.error);
      toast.error(result.error);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (reg.password !== reg.confirmPassword) {
      setRegError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const result = registerClient(reg);
    setLoading(false);
    if (result.ok) {
      setAccount(result.account);
      toast.success("Votre compte client a été créé avec succès !");
    } else {
      setRegError(result.error);
      toast.error(result.error);
    }
  };

  const handleLogout = () => {
    logoutClient();
    setAccount(null);
    toast.success("Vous avez été déconnecté.");
    navigate({ to: "/client" });
  };

  if (!ready) return null;

  // ─── AUTHENTICATION GATE ───────────────────────────────────────────────────
  if (!account) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#7dd3fc]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7dd3fc]/5 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <span className="font-display text-3xl font-bold text-white tracking-tight">
                YOLO<span className="text-[#7dd3fc]">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">
                Le Concierge
              </span>
            </Link>
            <p className="text-sm text-white/60">Votre portail conciergerie premium</p>
          </div>

          <div className="bg-[#0f0f11]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex border-b border-white/10 mb-6 pb-2">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setLoginError("");
                }}
                className={`flex-1 text-center pb-2.5 text-sm font-semibold transition-all relative ${
                  authMode === "login" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
                }`}
              >
                Connexion
                {authMode === "login" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7dd3fc] rounded-full" />
                )}
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setRegError("");
                }}
                className={`flex-1 text-center pb-2.5 text-sm font-semibold transition-all relative ${
                  authMode === "register" ? "text-[#7dd3fc]" : "text-white/40 hover:text-white/60"
                }`}
              >
                Créer un compte
                {authMode === "register" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7dd3fc] rounded-full" />
                )}
              </button>
            </div>

            {/* LOGIN FORM */}
            {authMode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
                    Adresse e-mail
                  </label>
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
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
                    Mot de passe
                  </label>
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

                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-[#7dd3fc] text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50 cursor-pointer shadow-lg shadow-[#7dd3fc]/10"
                >
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {authMode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
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
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
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

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="email"
                      required
                      value={reg.email}
                      onChange={(e) => setReg({ ...reg, email: e.target.value })}
                      placeholder="vous@exemple.com"
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
                    Téléphone (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={reg.countryCode}
                      onChange={(e) => setReg({ ...reg, countryCode: e.target.value })}
                      className={`${selectCls} w-24`}
                    >
                      <option className={SELECT_OPTION_CLS} value="+243">🇨🇩 +243</option>
                      <option className={SELECT_OPTION_CLS} value="+221">🇸🇳 +221</option>
                      <option className={SELECT_OPTION_CLS} value="+225">🇨🇮 +225</option>
                      <option className={SELECT_OPTION_CLS} value="+33">🇫🇷 +33</option>
                      <option className={SELECT_OPTION_CLS} value="+32">🇧🇪 +32</option>
                      <option className={SELECT_OPTION_CLS} value="+1">🇺🇸 +1</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={reg.phone}
                      onChange={(e) => setReg({ ...reg, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="9 à 10 chiffres"
                      className={`${inputCls} flex-1`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={reg.password}
                      onChange={(e) => setReg({ ...reg, password: e.target.value })}
                      placeholder="Min. 6 car."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">
                      Confirmation
                    </label>
                    <input
                      type="password"
                      required
                      value={reg.confirmPassword}
                      onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
                      placeholder="Répétez"
                      className={inputCls}
                    />
                  </div>
                </div>

                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-[#7dd3fc] text-black text-sm font-semibold hover:bg-white transition disabled:opacity-50 cursor-pointer shadow-lg shadow-[#7dd3fc]/10"
                >
                  {loading ? "Création du compte..." : "Créer mon compte"}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-[#7dd3fc] transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour au site principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── CLIENT PORTAL LAYOUT SHELL ───────────────────────────────────────────
  const navigation = [
    { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { to: "/client/reservations", label: "Mes Réservations", icon: CalendarCheck },
    { to: "/client/support", label: "Chat Support", icon: MessageSquare },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(`${to}/`);

  return (
    <ClientContext.Provider value={{ account }}>
      <div className="min-h-screen bg-[#070708] text-white flex flex-col lg:flex-row font-sans">
        {/* Mobile Topbar */}
        <header className="lg:hidden shrink-0 sticky top-0 z-30 bg-[#0f0f11]/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 h-16">
          <Link to="/client" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              YOLO<span className="text-[#7dd3fc]">.</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#7dd3fc]">Client</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Sidebar navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0c0c0e] border-r border-white/5 flex flex-col transition-transform duration-300 lg:sticky lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="h-20 px-8 flex items-center justify-between border-b border-white/5">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-white">
                  YOLO<span className="text-[#7dd3fc]">.</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7dd3fc]">Client</span>
              </Link>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Client User Profile Info Card */}
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#7dd3fc]/10 border border-[#7dd3fc]/20 flex items-center justify-center text-[#7dd3fc] font-bold">
                {account.firstName[0].toUpperCase()}
                {account.lastName[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {account.firstName} {account.lastName}
                </p>
                <p className="text-xs text-white/40 truncate">{account.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/client"}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#7dd3fc] text-black shadow-lg shadow-[#7dd3fc]/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/5 space-y-1.5">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <Compass className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Backdrop mobile sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content page area */}
        <main className="flex-1 min-w-0 p-6 lg:p-10 flex flex-col bg-[#070708] relative overflow-y-auto">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#7dd3fc]/2.5 blur-[120px] pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </ClientContext.Provider>
  );
}
