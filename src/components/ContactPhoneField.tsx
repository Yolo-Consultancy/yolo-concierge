import {
  countryOptions,
  formatCountryOptionLabel,
  formatPhoneInput,
  getCountryByDialCode,
  getCountryNameByDialCode,
  phoneDigitsOnly,
  phoneMaxLength,
  phonePlaceholder,
} from "@/lib/phone-field";

type ContactPhoneFieldProps = {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  inputCls?: string;
  required?: boolean;
  id?: string;
  variant?: "light" | "dark";
  label?: string;
};

const DARK_SELECT_OPTION_CLS = "bg-charbon text-white";

export function ContactPhoneField({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  inputCls = "yolo-form-input",
  required = false,
  id = "contact-phone",
  variant = "light",
  label,
}: ContactPhoneFieldProps) {
  const isDark = variant === "dark";
  const displayPhone = formatPhoneInput(phone, countryCode);
  const maxLen = phoneMaxLength(countryCode);
  const countryName = getCountryNameByDialCode(countryCode);
  const selectedCountry = getCountryByDialCode(countryCode);

  return (
    <div>
      <label
        className={isDark ? "block text-sm font-medium text-white mb-2" : "yolo-form-label"}
        htmlFor={id}
        data-required={required || undefined}
      >
        {label ?? "Numéro de téléphone"}
      </label>
      <div
        className={
          isDark
            ? "flex overflow-hidden rounded-lg border border-white/15 bg-white/5 transition focus-within:border-or-vif focus-within:ring-1 focus-within:ring-or-vif/50"
            : "yolo-phone-field flex overflow-hidden rounded-lg border border-black/12 bg-white shadow-sm transition focus-within:border-or-vif focus-within:ring-2 focus-within:ring-or-vif/20"
        }
      >
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className={
            isDark
              ? "shrink-0 min-w-[11rem] max-w-[13rem] border-0 border-r border-white/15 bg-charbon py-3.5 pl-3 pr-2 text-sm font-semibold text-white rounded-none focus:outline-none focus:ring-0 scheme-dark"
              : "yolo-form-select shrink-0 min-w-[11rem] max-w-[13rem] border-0 border-r border-black/10 bg-[var(--yolo-cream)] py-3.5 pl-3 pr-2 text-sm font-semibold text-charbon rounded-none focus:outline-none focus:ring-0"
          }
          aria-label="Indicatif pays"
        >
          {countryOptions.map((country) => {
            const dial = `+${country.dialCode}`;
            return (
              <option
                key={`${country.iso2}-${country.dialCode}`}
                value={dial}
                className={isDark ? DARK_SELECT_OPTION_CLS : undefined}
              >
                {formatCountryOptionLabel(country)}
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
      <p className={isDark ? "mt-1.5 text-xs text-white/45" : "mt-1.5 text-xs yolo-form-muted"}>
        {countryName ? (
          <>
            Pays : <span className="font-medium">{countryName}</span> ({countryCode})
            {countryCode === "+243" ? " — 9 chiffres sans le 0 initial" : ""}
          </>
        ) : (
          "Sélectionnez un indicatif pays"
        )}
        {selectedCountry && phone ? (
          <span className="sr-only">
            {countryName} {countryCode} {displayPhone}
          </span>
        ) : null}
      </p>
    </div>
  );
}
