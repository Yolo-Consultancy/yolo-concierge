/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { getCurrentClient, hydrateCurrentClient, type ClientAccount } from "./auth";

export type ClientContactFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
};

export function emptyClientContactFields(): ClientContactFormFields {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+243",
  };
}

export function clientContactFieldsFromAccount(account: ClientAccount): ClientContactFormFields {
  return {
    firstName: account.firstName?.trim() ?? "",
    lastName: account.lastName?.trim() ?? "",
    email: account.email?.trim() ?? "",
    phone: account.phone?.replace(/\D/g, "") ?? "",
    countryCode: account.countryCode?.trim() || "+243",
  };
}

export function fullNameFromAccount(account: ClientAccount): string {
  return `${account.firstName} ${account.lastName}`.trim();
}

export function phoneWithCountryFromAccount(account: ClientAccount): string {
  const phone = account.phone?.replace(/\D/g, "") ?? "";
  if (!phone) return "";
  const code = account.countryCode?.trim() || "+243";
  return `${code} ${phone}`;
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
