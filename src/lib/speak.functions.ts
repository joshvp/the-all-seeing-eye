import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LocaleId } from "@/lib/locales";

const inputSchema = z.object({
  text: z.string().min(8).max(8000),
  locale: z.string().min(2).max(8),
});

/**
 * Lux can be told these codes. Albanian, Urdu, and Latin are not on that list,
 * so those three are left on auto and he follows the script in front of him.
 * An unknown code is rejected, so anything else also falls to auto.
 */
const LANG: Record<LocaleId, string> = {
  en: "en",
  sq: "auto",
  zh: "zh",
  hi: "hi",
  es: "es-ES",
  fr: "fr",
  ar: "ar-SA",
  bn: "bn",
  pt: "pt-PT",
  ru: "ru",
  ur: "auto",
  id: "id",
  de: "de",
  ja: "ja",
  ko: "ko",
  it: "it",
  la: "auto",
};

function speechLanguage(locale: string): string {
  if (Object.prototype.hasOwnProperty.call(LANG, locale)) return LANG[locale as LocaleId];
  return "auto";
}

export const speakReading = createServerFn({ method: "POST" })
  .validator((input: { text: string; locale: string }) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const };

    try {
      const res = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          text: data.text,
          voice_id: "lux",
          language: speechLanguage(data.locale),
          speed: 0.94,
          text_normalization: true,
          output_format: {
            codec: "mp3",
            sample_rate: 48000,
            bit_rate: 192000,
          },
        }),
      });
      if (!res.ok) {
        console.error("speech status", res.status);
        return { ok: false as const };
      }
      const audio = Buffer.from(await res.arrayBuffer()).toString("base64");
      if (!audio) return { ok: false as const };
      return { ok: true as const, audio };
    } catch (error) {
      console.error("speech failed", error instanceof Error ? error.message : "error");
      return { ok: false as const };
    }
  });
