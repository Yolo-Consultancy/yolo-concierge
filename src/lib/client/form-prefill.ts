/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { parsePhoneWithCountry } from "@/lib/phone-field";
import { getCurrentClient, hydrateCurrentClient, type ClientAccount } from "./auth";

export type ClientContactFormFields = {
  civility: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
};

export const CIVILITY_OPTIONS = [
  { value: "M.", label: "M." },
  { value: "Mme", label: "Mme" },
  { value: "Mlle", label: "Mlle" },
  { value: "Dr", label: "Dr" },
  { value: "Pr", label: "Pr" },
] as const;

export function emptyClientContactFields(): ClientContactFormFields {
  return {
    civility: "M.",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
    password: "",
    confirmPassword: "",
  };
}

export function clientContactFieldsFromAccount(account: ClientAccount): ClientContactFormFields {
  const storedCode = account.countryCode?.trim() || "+243";
  const rawPhone = account.phone?.trim() ?? "";
  const parsed = rawPhone.includes("+")
    ? parsePhoneWithCountry(rawPhone, storedCode)
    : parsePhoneWithCountry(`${storedCode} ${rawPhone}`, storedCode);

  return {
    civility: account.civility?.trim() || "M.",
    firstName: account.firstName?.trim() ?? "",
    lastName: account.lastName?.trim() ?? "",
    email: account.email?.trim() ?? "",
    phone: parsed.phone,
    countryCode: parsed.countryCode || storedCode,
    password: "",
    confirmPassword: "",
  };
}

export function fullNameFromAccount(account: ClientAccount): string {
  return `${account.firstName} ${account.lastName}`.trim();
}

export function phoneWithCountryFromAccount(account: ClientAccount): string {
  const fields = clientContactFieldsFromAccount(account);
  if (!fields.phone) return "";
  return `${fields.countryCode} ${fields.phone}`;
}

/** Session client en cache puis hydratation API. */
export async function resolveClientAccount(): Promise<ClientAccount | null> {
  const cached = getCurrentClient();
  const hydrated = await hydrateCurrentClient();
  return hydrated ?? cached;
}

/** Hook : coordonnées du compte connecté pour préremplir les formulaires. */
export function useClientContactPrefill() {
  const [account, setAccount] = useState<ClientAccount | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = getCurrentClient();
    if (cached && !cancelled) setAccount(cached);
    void resolveClientAccount().then((acc) => {
      if (!cancelled && acc) setAccount(acc);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fields = useMemo(
    () => (account ? clientContactFieldsFromAccount(account) : emptyClientContactFields()),
    [account],
  );

  const fullName = useMemo(
    () => (account ? fullNameFromAccount(account) : ""),
    [account],
  );

  const phoneWithCountry = useMemo(
    () => (account ? phoneWithCountryFromAccount(account) : ""),
    [account],
  );

  return {
    account,
    fields,
    fullName,
    phoneWithCountry,
  };
}
