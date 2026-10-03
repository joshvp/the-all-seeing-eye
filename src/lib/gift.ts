import type { LocaleId } from "@/lib/locales";

const AMOUNTS = ["4.44", "7.77", "8.88"] as const;

const HREFS: Record<LocaleId, readonly [string, string, string]> = {
  en: [
    "https://donate.stripe.com/fZu5kE4QT4H83A86DYbwk01",
    "https://donate.stripe.com/eVq6oI5UX7Tk2w4e6qbwk02",
    "https://donate.stripe.com/8x25kE5UX7Tk2w49Qabwk03",
  ],
  sq: [
    "https://donate.stripe.com/fZu28s9797Tk1s0bYibwk04",
    "https://donate.stripe.com/28EdRa4QTddEc6E2nIbwk05",
    "https://donate.stripe.com/dRm6oI1EH2z01s05zUbwk06",
  ],
  zh: [
    "https://donate.stripe.com/00w4gA0AD2z08Us8M6bwk07",
    "https://donate.stripe.com/5kQ4gAdnpb5w2w4geybwk08",
    "https://donate.stripe.com/7sY3cw835ehI7Qo2nIbwk09",
  ],
  hi: [
    "https://donate.stripe.com/00wbJ21EH3D4gmU4vQbwk0a",
    "https://donate.stripe.com/3cI3cwfvx6Pg4Ec9Qabwk0b",
    "https://donate.stripe.com/fZu6oI1EHddEgmU4vQbwk0c",
  ],
  es: [
    "https://donate.stripe.com/cNi7sM8355LceeM3rMbwk0d",
    "https://donate.stripe.com/4gM14o6Z10qS2w41jEbwk0e",
    "https://donate.stripe.com/aFadRa5UXehIgmU4vQbwk0f",
  ],
  fr: [
    "https://donate.stripe.com/fZu5kEdnp0qS1s0faubwk0g",
    "https://donate.stripe.com/28EcN6dnp0qS5IgaUebwk0h",
    "https://donate.stripe.com/9B64gA835gpQc6E4vQbwk0i",
  ],
  ar: [
    "https://donate.stripe.com/5kQ4gA0AD0qS5Ig2nIbwk0j",
    "https://donate.stripe.com/00waEY6Z1gpQeeM3rMbwk0k",
    "https://donate.stripe.com/14A14ocjlddEb2A0fAbwk0l",
  ],
  bn: [
    "https://donate.stripe.com/14AdRafvxddEb2Ae6qbwk0m",
    "https://donate.stripe.com/eVq6oIcjlb5w5Igd2mbwk0n",
    "https://donate.stripe.com/aFacN65UX8Xo4Ece6qbwk0o",
  ],
  pt: [
    "https://donate.stripe.com/8x2fZi1EH8Xo0nW6DYbwk0p",
    "https://donate.stripe.com/8x23cwbfh7Tk9Yw7I2bwk0q",
    "https://donate.stripe.com/cNi8wQ3MPb5w4Ec8M6bwk0r",
  ],
  ru: [
    "https://donate.stripe.com/fZudRa4QT0qSeeMgeybwk0s",
    "https://donate.stripe.com/14A00k4QTgpQfiQ1jEbwk0t",
    "https://donate.stripe.com/28E00k8351uW3A81jEbwk0u",
  ],
  ur: [
    "https://donate.stripe.com/5kQaEYbfhflM5IgbYibwk0v",
    "https://donate.stripe.com/7sY00kcjl0qS2w40fAbwk0w",
    "https://donate.stripe.com/00w00kcjlehI2w45zUbwk0x",
  ],
  id: [
    "https://donate.stripe.com/8x2eVednp5Lc6Mk8M6bwk0y",
    "https://donate.stripe.com/5kQ8wQ6Z1ddE5Ige6qbwk0z",
    "https://donate.stripe.com/3cIdRa4QTa1sdaI4vQbwk0A",
  ],
  de: [
    "https://donate.stripe.com/5kQ9AUbfhc9A8UsbYibwk0B",
    "https://donate.stripe.com/9B65kE979b5w5Igfaubwk0C",
    "https://donate.stripe.com/dRm8wQ5UX0qS7Qoe6qbwk0D",
  ],
  ja: [
    "https://donate.stripe.com/cNi00kdnp5LcdaI4vQbwk0E",
    "https://donate.stripe.com/00waEYertflM5Igfaubwk0F",
    "https://donate.stripe.com/dRm5kE5UXehIdaIgeybwk0G",
  ],
  ko: [
    "https://donate.stripe.com/14A7sM6Z12z05IgaUebwk0H",
    "https://donate.stripe.com/dRm28s5UXflM2w4bYibwk0I",
    "https://donate.stripe.com/14A5kE6Z17Tk0nWaUebwk0J",
  ],
  it: [
    "https://donate.stripe.com/fZudRa1EHa1sgmUfaubwk0K",
    "https://donate.stripe.com/8x200k9796PggmUe6qbwk0L",
    "https://donate.stripe.com/5kQdRaert2z0b2Ae6qbwk0M",
  ],
  la: [
    "https://donate.stripe.com/00w8wQ4QT7Tk8Us2nIbwk0N",
    "https://donate.stripe.com/9B63cwgzB3D4b2Ae6qbwk0O",
    "https://donate.stripe.com/6oU00kfvx7Tk3A89Qabwk0P",
  ],
};

/** Stripe’s own checkout words. The other tongues keep our lines, and Stripe follows the browser. */
const STRIPE_LOCALE: Partial<Record<LocaleId, string>> = {
  en: "en",
  zh: "zh",
  es: "es",
  fr: "fr",
  pt: "pt",
  ru: "ru",
  id: "id",
  de: "de",
  ja: "ja",
  ko: "ko",
  it: "it",
};

export const GIFT_HREF = HREFS.en[0];

export function giftsFor(locale: LocaleId) {
  const hrefs = HREFS[locale] ?? HREFS.en;
  const stripe = STRIPE_LOCALE[locale];
  return AMOUNTS.map((amount, index) => {
    const href = hrefs[index];
    if (!stripe) return { amount, href };
    const url = new URL(href);
    url.searchParams.set("locale", stripe);
    return { amount, href: url.toString() };
  });
}
