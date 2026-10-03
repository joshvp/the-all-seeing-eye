export const LOCALES = [
  { id: "en", name: "English", english: "English", dir: "ltr" },
  { id: "sq", name: "Shqip", english: "Albanian", dir: "ltr" },
  { id: "zh", name: "中文", english: "Chinese", dir: "ltr" },
  { id: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr" },
  { id: "es", name: "Español", english: "Spanish", dir: "ltr" },
  { id: "fr", name: "Français", english: "French", dir: "ltr" },
  { id: "ar", name: "العربية", english: "Arabic", dir: "rtl" },
  { id: "bn", name: "বাংলা", english: "Bengali", dir: "ltr" },
  { id: "pt", name: "Português", english: "Portuguese", dir: "ltr" },
  { id: "ru", name: "Русский", english: "Russian", dir: "ltr" },
  { id: "ur", name: "اردو", english: "Urdu", dir: "rtl" },
  { id: "id", name: "Indonesia", english: "Indonesian", dir: "ltr" },
  { id: "de", name: "Deutsch", english: "German", dir: "ltr" },
  { id: "ja", name: "日本語", english: "Japanese", dir: "ltr" },
  { id: "ko", name: "한국어", english: "Korean", dir: "ltr" },
  { id: "it", name: "Italiano", english: "Italian", dir: "ltr" },
  { id: "la", name: "Latina", english: "Latin", dir: "ltr" },
] as const;

export type LocaleId = (typeof LOCALES)[number]["id"];

const IDS = new Set<string>(LOCALES.map((locale) => locale.id));

export function isLocale(value: string): value is LocaleId {
  return IDS.has(value);
}

export function localeMeta(id: LocaleId) {
  const found = LOCALES.find((locale) => locale.id === id);
  return found ?? LOCALES[0];
}
