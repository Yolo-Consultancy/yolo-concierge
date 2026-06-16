/* eslint-disable prettier/prettier */
import { driverApi, publicApi, setDriverAccessToken, getDriverAccessToken } from "@/lib/api/client";

export type DriverAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string;
  availability: string;
  active: boolean;
};

type AuthResponse = { accessToken: string; account: DriverAccount };

let cachedAccount: DriverAccount | null = null;

export function setCachedDriverAccount(account: DriverAccount | null) {
  cachedAccount = account;
}

export function getCurrentDriver(): DriverAccount | null {
  return cachedAccount;
}

export async function hydrateCurrentDriver(): Promise<DriverAccount | null> {
  if (!getDriverAccessToken()) {
    cachedAccount = null;
    return null;
  }
  try {
    cachedAccount = await driverApi.get<DriverAccount>("/auth/driver/me");
    return cachedAccount;
  } catch {
    setDriverAccessToken(null);
    cachedAccount = null;
    return null;
  }
}

export async function loginDriver(
  email: string,
  password: string,
): Promise<{ ok: true; account: DriverAccount } | { ok: false; error: string }> {
  try {
    const result = await publicApi.post<AuthResponse>("/auth/driver/login", { email, password });
    setDriverAccessToken(result.accessToken);
    cachedAccount = result.account;
    return { ok: true, account: result.account };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Connexion impossible" };
  }
}

export function logoutDriver() {
  setDriverAccessToken(null);
  cachedAccount = null;
}
