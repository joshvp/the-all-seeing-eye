import { isLocale, type LocaleId } from "@/lib/locales";

export type ThemeName = "day" | "night";

export type EyePrefs = {
  locale: LocaleId;
  theme: ThemeName;
};

export function prefsFromCookie(cookie: string): EyePrefs {
  const themeMatch = cookie.match(/(?:^|; )eye-theme=(day|night)(?:;|$)/);
  const localeMatch = cookie.match(/(?:^|; )eye-locale=([a-z]{2})(?:;|$)/);
  const localeRaw = localeMatch?.[1] ?? "en";
  return {
    theme: themeMatch?.[1] === "day" ? "day" : "night",
    locale: isLocale(localeRaw) ? localeRaw : "en",
  };
}
