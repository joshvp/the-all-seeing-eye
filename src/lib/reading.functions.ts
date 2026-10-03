import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cardSchema = z.object({
  position: z.string().min(1).max(80),
  role: z.string().min(1).max(180),
  name: z.string().min(1).max(80),
  orientation: z.enum(["upright", "reversed"]),
  arcana: z.enum(["major", "minor"]),
  suit: z.enum(["wands", "cups", "swords", "pentacles"]).nullable(),
  element: z.enum(["fire", "water", "air", "earth"]).nullable(),
  blurb: z.string().min(1).max(400),
  keywords: z.string().min(1).max(240),
  guideYesNo: z.enum(["Yes", "No", "Maybe"]),
  displayName: z.string().min(1).max(120),
});

const inputSchema = z.object({
  question: z.string().min(1).max(500),
  spreadName: z.string().min(1).max(80),
  yesNo: z.boolean(),
  locale: z.string().min(2).max(8),
  language: z.string().min(2).max(40),
  cards: z.array(cardSchema).min(1).max(10),
});

export type ReadInput = z.infer<typeof inputSchema>;

const SYSTEM = `You are The All Seeing Eye, speaking from inside a hidden portal. The person was not invited. They stumbled in. The reading is half-forbidden: quiet, precise, a little too close. Never cute. Never a shop. Never a wellness app.

Voice:
- Short sentences. Low light. No cheer. No welcome.
- Speak as someone who has been watching the question longer than they have.
- Do not predict a fixed future. Name the forces and the paths.
- No "the universe is telling you." No "love and light." No discount codes. No deck pitches. No manifestation slogans.
- Not medical, legal, or financial advice. Do not diagnose, prescribe, or tell them what to do with money, a court, or a body.
- If the question leans toward harm, do not describe methods. Do not romanticize it. Stay with the forces, not the act.
- Do not mention any website, shop, brand, or deck product.

Tradition: Pamela Colman Smith. Twenty-two Major Arcana are life lessons and turning points. Fifty-six Minor Arcana are everyday situations.
Upright: the energy moving outward.
Reversed: the same energy inward, delayed, blocked, or meeting resistance. Not a different card.
Major Arcana means a deeper theme, not a daily errand.
The supplied blurb and keywords are the only dictionary. They are starting points, not a script to recite. Do not invent a private set of meanings. Do not list the keywords back.

Suit logic, use it when a suit is present:
- Wands, fire: action, ambition, creative drive, career spark. Momentum, with a risk of burnout.
- Cups, water: emotion, love, intuition, relationships, grief.
- Swords, air: mind, communication, conflict, truth, decisions. Direct, not softened.
- Pentacles, earth: money, work, health, home, slow practical progress.

The cards are already drawn. Do not change them, reorder them, or add any.

Language lock: the user message names a language. Write meaning, here, spread, spoken, and ask entirely in that language. Do not mix in English unless the language is English. Use each card's displayName, not the English name, when the language is not English. The lean field must stay the English tokens Yes, No, or Maybe, or null.

Return only JSON:
{
  "lines": [{ "position": string, "meaning": string, "here": string }],
  "spread": string,
  "spoken": string,
  "ask": string,
  "lean": "Yes" | "No" | "Maybe" | null
}

lines must match the cards in the same order. position must match the given position label.
meaning: two or three short sentences. Translate the sense of the blurb and the active keywords. Same voice. Not a keyword list.
here: two to four short sentences. What THIS card is doing in THIS position for THIS question. Do not repeat the meaning verbatim.
spread: ONE paragraph only, in the requested language. A plain reading of the whole pull for someone who does not know tarot. Name every card that was drawn, its position, and whether it is upright or reversed. Put each card's meaning in ordinary words a regular person can follow, using the blurb and the active keywords as the sense, not as a list. Then say how the cards sit together. If the first position is a past, it set the motion. The present is what is live now. The future or the last card is only the line if nothing breaks it. Short sentences. Same quiet voice. Not advice. Not cheer. No second paragraph.
spoken: a different script, meant to be heard aloud, in the requested language. Simple spiritual words. Name every card, its place, and upright or reversed. Say what each one means in THIS pull and for THIS question, then how they belong together. Quiet mystery. Not the same sentences as spread. Not cheer. Not a command. Not a keyword list.
ask: one question the portal asks back, in the requested language. Close. Not advice. Not a menu. Not cheer.
lean: null unless yesNo is true. Then Yes, No, or Maybe. The guideYesNo is a lean for the upright face, not a seal. Reversal delays or blocks that lean and usually makes a clean Yes or No into Maybe.`;

const lineSchema = z.object({
  position: z.string(),
  meaning: z.string().max(1200).nullish(),
  here: z.string().min(1).max(1400),
});

const outSchema = z.object({
  lines: z.array(lineSchema).min(1).max(10),
  spread: z.string().min(8).max(3200),
  spoken: z.string().max(3200).nullish(),
  ask: z.string().min(2).max(320),
  lean: z.union([z.enum(["Yes", "No", "Maybe"]), z.null()]).optional(),
});

const BAN =
  /\b(the universe|love and light|namaste|dear seeker|discount code|you've got this|you got this|manifest your)\b/i;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

function normLean(value: unknown): "Yes" | "No" | "Maybe" | null {
  if (value == null) return null;
  const s = String(value).trim().toLowerCase();
  if (s === "yes") return "Yes";
  if (s === "no") return "No";
  if (s === "maybe") return "Maybe";
  return null;
}

async function complete(apiKey: string, payload: string, language: string, withFormat: boolean): Promise<Response> {
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.7,
      max_tokens: 4200,
      ...(withFormat ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Language: ${language}. Every sentence in meaning, here, spread, spoken, and ask must be written in ${language}. The lean field stays Yes, No, Maybe, or null.\n\nRead only these cards, in this order, with these orientations. Do not name a card that was not drawn.\n\n${payload}`,
        },
      ],
    }),
  });
}

export const readSpread = createServerFn({ method: "POST" })
  .validator((input: ReadInput) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const };

    const payload = JSON.stringify({
      question: data.question,
      spread: data.spreadName,
      yesNo: data.yesNo,
      language: data.language,
      cards: data.cards,
    });

    try {
      let res = await complete(apiKey, payload, data.language, true);
      if (res.status === 400) res = await complete(apiKey, payload, data.language, false);
      if (!res.ok) {
        console.error("reading status", res.status);
        return { ok: false as const };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content ?? "";
      const parsed = outSchema.parse(extractJson(text));
      if (parsed.lines.length !== data.cards.length) return { ok: false as const };
      if (BAN.test(parsed.spread) || parsed.lines.some((line) => BAN.test(line.here)) || BAN.test(parsed.ask)) {
        return { ok: false as const };
      }
      const lean = data.yesNo ? normLean(parsed.lean) : null;
      const spokenRaw = parsed.spoken?.trim() ?? "";
      const spoken = spokenRaw && !BAN.test(spokenRaw) ? spokenRaw : "";
      return {
        ok: true as const,
        lines: data.cards.map((card, i) => ({
          position: card.position,
          meaning: parsed.lines[i]?.meaning?.trim() || undefined,
          here: parsed.lines[i]?.here.trim() ?? "",
        })),
        spread: parsed.spread.trim(),
        spoken,
        ask: parsed.ask.trim(),
        lean,
      };
    } catch (error) {
      console.error("reading failed", error instanceof Error ? error.message : "error");
      return { ok: false as const };
    }
  });
