import {
  countryOptions,
  formatPhoneInput,
  getFlagEmoji,
  phoneDigitsOnly,
  phoneMaxLength,
  phonePlaceholder,
  PRIORITY_COUNTRY_ISOS,
} from "@/lib/phone-field";

type ContactPhoneFieldProps = {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  inputCls?: string;
  required?: boolean;
  id?: string;
};

export function ContactPhoneField({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  inputCls = "yolo-form-input",
  required = false,
  id = "contact-phone",
}: ContactPhoneFieldProps) {
  const displayPhone = formatPhoneInput(phone, countryCode);
  const maxLen = phoneMaxLength(countryCode);

  return (
    <div>
      <label className="yolo-form-label" htmlFor={id}>
        Numéro de téléphone{required ? " *" : ""}
      </label>
      <div className="yolo-phone-field flex overflow-hidden rounded-lg border border-black/12 bg-white shadow-sm transition focus-within:border-or-vif focus-within:ring-2 focus-within:ring-or-vif/20">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="yolo-form-select shrink-0 border-0 border-r border-black/10 bg-[var(--yolo-cream)] py-3.5 pl-3 pr-2 text-sm font-semibold text-charbon w-[6.5rem] rounded-none focus:outline-none focus:ring-0"
          aria-label="Indicatif pays"
        >
          {countryOptions.map((country) => {
            const dial = `+${country.dialCode}`;
            const isPriority = PRIORITY_COUNTRY_ISOS.includes(
              country.iso2 as (typeof PRIORITY_COUNTRY_ISOS)[number],
            );
            return (
              <option key={`${country.iso2}-${country.dialCode}`} value={dial}>
                {getFlagEmoji(country.iso2)} {dial}
                {isPriority ? ` · ${country.name}` : ""}
              </option>
            );
          })}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          maxLength={countryCode === "+243" ? 12 : maxLen}
          value={displayPhone}
          onChange={(e) => onPhoneChange(phoneDigitsOnly(e.target.value).slice(0, maxLen))}
          placeholder={phonePlaceholder(countryCode)}
          className={`${inputCls} min-w-0 flex-1 rounded-none border-0 shadow-none focus:ring-0`}
        />
      </div>
      <p className="mt-1.5 text-xs yolo-form-muted">
        {countryCode === "+243"
          ? "RDC : 9 chiffres sans le 0 initial (ex. 812 345 678)"
          : "Saisissez votre numéro sans l'indicatif pays"}
      </p>
    </div>
  );
}
