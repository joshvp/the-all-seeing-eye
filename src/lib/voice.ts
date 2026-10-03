import type { TarotCard, YesNo } from "@/lib/tarot-deck";
import type { Drawn } from "@/lib/draw";
import type { Family, SpreadPosition } from "@/lib/spreads";

export type VoiceLine = { position: string; here: string; meaning?: string };

export type Voice = {
  lines: VoiceLine[];
  spread: string;
  spoken: string;
  ask: string;
  lean: YesNo | null;
};

const CRISIS =
  /\b(suicid|kill myself|killing myself|end my life|take my life|self[- ]harm|want to die|wanna die|do not want to (?:be alive|live)|don't want to (?:be alive|live)|vetëvras|dua të vdes|quiero morir|matarme|envie de mourir|самоубий|хочу умереть|自杀|自殺したい|死にたい|आत्महत्या|انتحار|أريد أن أموت|আত্মহত্যা|خودکشی|bunuh diri|selbstmord|ich will sterben)\b/i;

export function isCrisis(question: string): boolean {
  return CRISIS.test(question);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function cap(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function wordsOf(list: string): string[] {
  return list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function phrase(list: string): string {
  const parts = wordsOf(list);
  if (parts.length <= 1) return parts[0] ?? list;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function meaningFor(card: TarotCard, reversed: boolean): string {
  const face = reversed ? card.reversed : card.upright;
  const turn = reversed
    ? `Reversed, it is not a different card. The same force turns inward. Delayed, blocked, or meeting resistance: ${phrase(face)}.`
    : `Upright, the force moves outward: ${phrase(face)}.`;
  const depth =
    card.arcana === "major"
      ? " A Major Arcana. A life lesson. A turning point. Not an errand."
      : "";
  return `${card.blurb} ${turn}${depth}`;
}

const OPEN: Record<Family, [string, string]> = {
  past: ["What set this in motion.", "What set this in motion, and then caught."],
  present: ["The live wire.", "The live wire, folded back into the hand."],
  future: ["The line, if nothing breaks it.", "The line, if it snags."],
  cross: ["What lies across the matter.", "What lies across the matter, and knots."],
  root: ["What is underneath. Older than the question.", "What is underneath, and will not surface clean."],
  crown: ["What sits above this. Known, or only hoped.", "What sits above this, and is being withheld."],
  self: ["How you meet it.", "How you meet it when you will not look out."],
  house: ["The people and the place around it.", "The people and the place, pressing in."],
  hope: ["What you want, tangled with what you fear.", "The want, turned into the fear."],
  outcome: ["Where it goes if nothing breaks the line.", "Where it goes if the snag holds."],
  hidden: ["What is working out of sight.", "What is working out of sight, and stuck there."],
  obstacle: ["What stands in the way.", "What stands in the way, and also inside."],
  counsel: ["What the cards offer. Not a command.", "What the cards offer, turned inward. Not a command."],
  environment: ["The field around the question.", "The field around the question, closed in."],
  mind: ["The mind's part in this.", "The mind's part, circling itself."],
  body: ["What the body already knows.", "What the body is holding and not spending."],
  spirit: ["The part that is not strategy.", "The part that is not strategy, and is being refused."],
  situation: ["The matter as it stands.", "The matter, stalled in its own weather."],
  card: ["The single pressure.", "The single pressure, turned inward."],
  reason: ["Why this question is in the room.", "Why this question is here, and why it hesitates."],
};

function hereLine(drawn: Drawn, position: SpreadPosition): string {
  const active = drawn.reversed ? drawn.card.reversed : drawn.card.upright;
  const bits = wordsOf(active);
  const head = bits[0] ?? "the force";
  const second = bits[1] ?? head;
  const open = OPEN[position.family][drawn.reversed ? 1 : 0];
  const n = hash(`${drawn.card.id}:${position.id}:${drawn.reversed ? "r" : "u"}`) % 3;
  const name = drawn.card.name;

  if (!drawn.reversed) {
    if (n === 0) {
      return `${open} ${name} stands upright. ${drawn.card.blurb} It spends itself as ${head}. ${cap(second)} goes with it.`;
    }
    if (n === 1) {
      return `${name}, upright. ${open} ${drawn.card.blurb} The outward edge is ${head}, and ${second} is not waiting for permission.`;
    }
    return `${open} ${name} is not a souvenir. Upright, it moves: ${head}, with ${second} in the same hand. ${drawn.card.blurb}`;
  }

  if (n === 0) {
    return `${open} ${name} is reversed. Same nature. Turned inward. ${drawn.card.blurb} Held there, it is ${head}. ${cap(second)} does not get out.`;
  }
  if (n === 1) {
    return `${name}, reversed. ${open} ${drawn.card.blurb} Delayed, blocked, or met. The inward face is ${head}, and ${second} stays behind it.`;
  }
  return `${open} Reversed, ${name} does not leave the room. ${drawn.card.blurb} It has become ${head}. ${cap(second)} meets the wall.`;
}

function clip(question: string): string {
  const clean = question.replace(/\s+/g, " ").trim();
  const parts = clean.split(" ");
  if (parts.length <= 18) return clean;
  return `${parts.slice(0, 18).join(" ").replace(/[.,;:!?]+$/, "")}…`;
}

function portalAsk(drawn: Drawn[], positions: SpreadPosition[]): string {
  const present =
    drawn.find((_, i) => positions[i]?.family === "present") ??
    drawn[0];
  const future =
    drawn.find((_, i) => {
      const family = positions[i]?.family;
      return family === "future" || family === "outcome";
    }) ?? drawn[drawn.length - 1];
  const snag = drawn.find((d) => d.reversed) ?? present;
  if (!present || !future || !snag) return "What are you still calling unnamed?";
  const head = wordsOf(snag.reversed ? snag.card.reversed : snag.card.upright)[0] ?? "this";
  const options = [
    `What have you already decided, and dressed up as ${head}?`,
    `If ${future.card.name} is only the line, what would you break it for?`,
    `Where is ${present.card.name} already in the room, and which part are you pretending not to see?`,
    `Who benefits if ${snag.card.name} stays ${snag.reversed ? "turned inward" : "in motion"}?`,
    `What would you have to admit for this question to get smaller?`,
  ];
  const key = drawn.map((d) => d.card.id + (d.reversed ? "r" : "u")).join("|");
  return options[hash(key) % options.length] ?? options[0];
}

export function leanOf(drawn: Drawn[], positions: SpreadPosition[], yesNo: boolean): YesNo | null {
  if (!yesNo) return null;
  const idx = positions.findIndex((p) => p.family === "future" || p.family === "outcome" || p.family === "card");
  const card = drawn[idx >= 0 ? idx : drawn.length - 1];
  if (!card) return "Maybe";
  if (card.reversed && card.card.yesNo !== "Maybe") return "Maybe";
  return card.card.yesNo;
}

export function leanSentence(lean: YesNo, name: string, reversed: boolean): string {
  return `Lean: ${lean}. Taken from ${name}${reversed ? ", reversed" : ""}. Not a seal. A direction. Directions break.`;
}

export function composeReading(input: {
  question: string;
  positions: SpreadPosition[];
  drawn: Drawn[];
  yesNo: boolean;
}): Voice {
  const lines = input.drawn.map((drawn, i) => {
    const position = input.positions[i];
    return {
      position: position?.label ?? "Card",
      here: position ? hereLine(drawn, position) : "",
    };
  });

  const echo = clip(input.question);
  const sentences = input.drawn.map((drawn, i) => {
    const position = input.positions[i];
    const label = position?.label ?? "This card";
    const orient = drawn.reversed ? "reversed" : "upright";
    const sense = phrase(drawn.reversed ? drawn.card.reversed : drawn.card.upright);
    const lead = drawn.card.blurb.split(/(?<=\.)\s/)[0] ?? drawn.card.blurb;
    return `${label} is ${drawn.card.name}, ${orient}. In plain words: ${lead} It comes down to ${sense}.`;
  });
  const close =
    input.positions[0]?.family === "past"
      ? "Read them as one pull. The first card is what set this moving. The middle is what is live now. The last is only the line if nothing breaks it."
      : "Read them as one pull, in the order they fell. Together they are the reading. One card pulled out is not.";
  const spread = [`You asked: “${echo}”.`, ...sentences, close].join(" ");
  const spoken = spokenScript(input.positions, input.drawn);

  return {
    lines,
    spread,
    spoken,
    ask: portalAsk(input.drawn, input.positions),
    lean: leanOf(input.drawn, input.positions, input.yesNo),
  };
}

function spokenScript(positions: SpreadPosition[], drawn: Drawn[]): string {
  const parts = drawn.map((item, i) => {
    const place = positions[i]?.label ?? "This card";
    const way = item.reversed ? "turned inward" : "open";
    const sense = phrase(item.reversed ? item.card.reversed : item.card.upright);
    const lead = item.card.blurb.split(/(?<=\.)\s/)[0] ?? item.card.blurb;
    return `${place}. ${item.card.name} is ${way}. ${lead} In spirit, this is ${sense}.`;
  });
  const together =
    positions[0]?.family === "past"
      ? "Hear them as one. What shaped you. What surrounds you. What awaits, if nothing breaks the line."
      : "Hear them in the order they fell. One pull. One spirit. Not a single card alone.";
  return [...parts, together].join(" ");
}
