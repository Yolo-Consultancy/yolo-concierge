import { allCountries } from "country-telephone-data";

export const PRIORITY_COUNTRY_ISOS = ["cd", "fr", "be", "us", "ci", "sn"] as const;

export const countryOptions = (() => {
  const byIso = new Map(allCountries.map((c) => [c.iso2, c]));
  const priority = PRIORITY_COUNTRY_ISOS.map((iso) => byIso.get(iso)).filter(Boolean);
  const prioritySet = new Set(PRIORITY_COUNTRY_ISOS);
  const rest = [...allCountries]
    .filter((c) => !prioritySet.has(c.iso2 as (typeof PRIORITY_COUNTRY_ISOS)[number]))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return [...priority, ...rest];
})();

export function phoneMaxLength(countryCode: string) {
  return countryCode === "+243" ? 10 : 15;
}

export function phonePlaceholder(countryCode: string) {
  return countryCode === "+243" ? "812 345 678" : "Numéro local";
}

export function formatPhoneInput(value: string, countryCode: string) {
  const digits = value.replace(/\D/g, "").slice(0, phoneMaxLength(countryCode));
  if (countryCode !== "+243" || digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function phoneDigitsOnly(display: string) {
  return display.replace(/\D/g, "");
}

export function getFlagEmoji(iso2: string) {
  const codePoints = iso2
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export type PhoneCountry = {
  iso2: string;
  name: string;
  dialCode: string;
};

const dialCodeIndex = (() => {
  const byDial = new Map<string, PhoneCountry>();
  for (const country of countryOptions) {
    const dial = `+${country.dialCode}`;
    if (!byDial.has(dial)) {
      byDial.set(dial, {
        iso2: country.iso2,
        name: country.name,
        dialCode: country.dialCode,
      });
    }
  }
  return byDial;
})();

const dialCodesByLength = [...dialCodeIndex.keys()].sort((a, b) => b.length - a.length);

export function getCountryByDialCode(dialCode: string): PhoneCountry | null {
  const normalized = dialCode.startsWith("+") ? dialCode : `+${dialCode.replace(/\D/g, "")}`;
  return dialCodeIndex.get(normalized) ?? null;
}

export function getCountryNameByDialCode(dialCode: string): string {
  return getCountryByDialCode(dialCode)?.name ?? "";
}

export function formatCountryOptionLabel(country: (typeof countryOptions)[number]) {
  const dial = `+${country.dialCode}`;
  return `${getFlagEmoji(country.iso2)} ${dial} · ${country.name}`;
}

export function parsePhoneWithCountry(raw: string, defaultCode = "+243") {
  const trimmed = raw.trim();
  if (!trimmed) {
    const fallback = getCountryByDialCode(defaultCode);
    return {
      countryCode: defaultCode,
      phone: "",
      countryName: fallback?.name ?? "",
      iso2: fallback?.iso2 ?? "",
    };
  }

  const compact = trimmed.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) {
    for (const dial of dialCodesByLength) {
      if (compact.startsWith(dial)) {
        const country = getCountryByDialCode(dial)!;
        return {
          countryCode: dial,
          phone: compact.slice(dial.length).replace(/\D/g, ""),
          countryName: country.name,
          iso2: country.iso2,
        };
      }
    }
  }

  const digits = trimmed.replace(/\D/g, "");
  for (const dial of dialCodesByLength) {
    const dialDigits = dial.slice(1);
    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length + 4) {
      const country = getCountryByDialCode(dial)!;
      return {
        countryCode: dial,
        phone: digits.slice(dialDigits.length),
        countryName: country.name,
        iso2: country.iso2,
      };
    }
  }

  const fallback = getCountryByDialCode(defaultCode);
  return {
    countryCode: defaultCode,
    phone: digits,
    countryName: fallback?.name ?? "",
    iso2: fallback?.iso2 ?? "",
  };
}

export function formatPhoneSummary(countryCode: string, phone: string) {
  const country = getCountryByDialCode(countryCode);
  const formatted = formatPhoneInput(phone, countryCode);
  if (!formatted) return country ? `${country.name} (${countryCode})` : countryCode;
  const name = country?.name ?? "Pays inconnu";
  return `${name} (${countryCode}) · ${formatted}`;
}
