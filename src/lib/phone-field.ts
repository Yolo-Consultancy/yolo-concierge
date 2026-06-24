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

export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
