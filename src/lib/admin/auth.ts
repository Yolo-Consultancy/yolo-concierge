/* eslint-disable prettier/prettier */
import { adminConfig } from "@/config/admin";

const SESSION_KEY  = "yolo.admin.session";
const ACCOUNTS_KEY = "yolo.admin.accounts";

// ─── Types ──────────────────────────────────────────────────────────────────
type AdminAccount = { email: string; passwordHash: string; name: string; createdAt: string };

// ─── Helpers ────────────────────────────────────────────────────────────────
function readAccounts(): AdminAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as AdminAccount[]) : [];
  } catch { return []; }
}
function writeAccounts(list: AdminAccount[]) {
  if (typeof window !== "undefined")
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}
// Simple reversible hash for demo (replace with bcrypt in production)
function hashPwd(pwd: string) { return `yolo::${pwd}`; }

// ─── Public API ──────────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) === "1";
}

/** Connexion : vérifie adminConfig (compte maître) OU les comptes enregistrés. */
export function login(email: string, password: string): boolean {
  const e = email.trim().toLowerCase();

  // Compte maître (adminConfig)
  if (e === adminConfig.username.toLowerCase() && password === adminConfig.password) {
    window.localStorage.setItem(SESSION_KEY, "1");
    return true;
  }

  // Comptes enregistrés
  const found = readAccounts().find(
    (a) => a.email.toLowerCase() === e && a.passwordHash === hashPwd(password)
  );
  if (found) {
    window.localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

/**
 * Inscription d'un nouveau compte admin.
 * Retourne `null` si OK, ou un message d'erreur.
 */
export function register(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {
  if (!data.name.trim() || !data.email.trim() || !data.password)
    return "Veuillez remplir tous les champs.";
  if (data.password.length < 6)
    return "Le mot de passe doit comporter au moins 6 caractères.";
  if (data.password !== data.confirmPassword)
    return "Les mots de passe ne correspondent pas.";

  const e = data.email.trim().toLowerCase();

  // Interdit de recréer le compte maître
  if (e === adminConfig.username.toLowerCase())
    return "Cette adresse e-mail est déjà utilisée.";

  const accounts = readAccounts();
  if (accounts.find((a) => a.email.toLowerCase() === e))
    return "Un compte existe déjà avec cet e-mail.";

  writeAccounts([
    ...accounts,
    {
      email: e,
      passwordHash: hashPwd(data.password),
      name: data.name.trim(),
      createdAt: new Date().toISOString(),
    },
  ]);
  // Connecte automatiquement après inscription
  window.localStorage.setItem(SESSION_KEY, "1");
  return null;
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
