/* eslint-disable prettier/prettier */
// Gestion des comptes clients côté front-end (localStorage).
// À remplacer par des appels API quand le backend sera prêt.

export type ClientAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  createdAt: string;
};

const ACCOUNTS_KEY = "yolo.client.accounts";
const SESSION_KEY = "yolo.client.session"; // stocke l'id du compte connecté

// ─── Helpers ────────────────────────────────────────────────────────────────

function readAccounts(): ClientAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as ClientAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(list: ClientAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Retourne le compte actuellement connecté, ou null. */
export function getCurrentClient(): ClientAccount | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readAccounts().find((a) => a.id === id) ?? null;
}

/** Crée un compte et ouvre une session. Retourne le compte ou une erreur. */
export function registerClient(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
}): { ok: true; account: ClientAccount } | { ok: false; error: string } {
  const accounts = readAccounts();
  const email = data.email.trim().toLowerCase();

  if (!email || !data.firstName || !data.lastName) {
    return { ok: false, error: "Veuillez remplir tous les champs obligatoires." };
  }

  if (accounts.find((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: "Un compte existe déjà avec cet e-mail." };
  }

  if (data.password.length < 6) {
    return { ok: false, error: "Le mot de passe doit comporter au moins 6 caractères." };
  }

  const id = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const account: ClientAccount = {
    id,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email,
    phone: data.phone.trim(),
    countryCode: data.countryCode,
    createdAt: new Date().toISOString(),
  };

  // Store password separately (hashed in production — here just prefixed for demo)
  window.localStorage.setItem(`yolo.client.pwd.${id}`, `sha:${data.password}`);

  writeAccounts([...accounts, account]);
  window.localStorage.setItem(SESSION_KEY, id);
  return { ok: true, account };
}

/** Tente une connexion. Retourne le compte ou une erreur. */
export function loginClient(
  email: string,
  password: string
): { ok: true; account: ClientAccount } | { ok: false; error: string } {
  const accounts = readAccounts();
  const match = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!match) return { ok: false, error: "Aucun compte trouvé avec cet e-mail." };

  const storedPwd = window.localStorage.getItem(`yolo.client.pwd.${match.id}`);
  if (storedPwd !== `sha:${password}`) {
    return { ok: false, error: "Mot de passe incorrect." };
  }

  window.localStorage.setItem(SESSION_KEY, match.id);
  return { ok: true, account: match };
}

/** Déconnecte le client. */
export function logoutClient() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
