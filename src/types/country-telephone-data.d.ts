declare module "country-telephone-data" {
  export interface Country {
    name: string;
    iso2: string;
    dialCode: string;
    priority: number;
    format?: string;
    hasAreaCodes?: boolean;
  }

  export const allCountries: Country[];
  export const iso2Lookup: Record<string, number>;
  export const allCountryCodes: Record<string, string[]>;
}
