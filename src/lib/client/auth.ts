/* eslint-disable prettier/prettier */
import { clientApi, publicApi, setClientAccessToken, getClientAccessToken } from "@/lib/api/client";

export type ClientAccount = {
  id: string;
  civility?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  portalScope?: "vehicules" | "demenagement" | "sur_mesure" | "all";
  createdAt: string;
};

type AuthResponse = { accessToken: string; account: ClientAccount };

let cachedAccount: ClientAccount | null = null;

/** Compte client en mémoire (hydraté via API, pas de localStorage). */
export function getCurrentClient(): ClientAccount | null {
  return cachedAccount;
}

export async function hydrateCurrentClient(): Promise<ClientAccount | null> {
  if (!getClientAccessToken()) {
    cachedAccount = null;
    return null;
  }
  try {
    cachedAccount = await clientApi.get<ClientAccount>("/auth/client/me");
    return cachedAccount;
  } catch {
    setClientAccessToken(null);
    cachedAccount = null;
    return null;
  }
}

export async function registerClient(data: {
  civility?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  portal?: string;
}): Promise<{ ok: true; account: ClientAccount } | { ok: false; error: string }> {
  try {
    const result = await publicApi.post<AuthResponse>("/auth/client/register", data);
    setClientAccessToken(result.accessToken);
    cachedAccount = result.account;
    return { ok: true, account: result.account };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Inscription impossible" };
  }
}

export async function loginClient(
  email: string,
  password: string,
): Promise<{ ok: true; account: ClientAccount } | { ok: false; error: string }> {
  try {
    const result = await publicApi.post<AuthResponse>("/auth/client/login", { email, password });
    setClientAccessToken(result.accessToken);
    cachedAccount = result.account;
    return { ok: true, account: result.account };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Connexion impossible" };
  }
}

export function logoutClient() {
  setClientAccessToken(null);
  cachedAccount = null;
}
