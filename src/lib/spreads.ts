export type Family =
  | "past"
  | "present"
  | "future"
  | "cross"
  | "root"
  | "crown"
  | "self"
  | "house"
  | "hope"
  | "outcome"
  | "hidden"
  | "obstacle"
  | "counsel"
  | "environment"
  | "mind"
  | "body"
  | "spirit"
  | "situation"
  | "card"
  | "reason";

export type SpreadPosition = {
  id: string;
  label: string;
  role: string;
  family: Family;
};

export type SpreadNameKey = "three" | "celtic" | "horseshoe" | "one" | "mind" | "trio";

export type Spread = {
  name: string;
  nameKey: SpreadNameKey;
  positions: SpreadPosition[];
  yesNo: boolean;
};

const THREE: SpreadPosition[] = [
  {
    id: "past",
    label: "Past",
    role: "what set this in motion",
    family: "past",
  },
  {
    id: "present",
    label: "Present",
    role: "the live wire, what is touching the question now",
    family: "present",
  },
  {
    id: "future",
    label: "Future",
    role: "the line if nothing breaks it, not a fixed end",
    family: "future",
  },
];

const CELTIC: SpreadPosition[] = [
  {
    id: "heart",
    label: "The heart",
    role: "the present matter, the thing itself",
    family: "present",
  },
  {
    id: "cross",
    label: "The crossing",
    role: "what lies across it",
    family: "cross",
  },
  {
    id: "root",
    label: "The root",
    role: "what lies beneath, older than the asking",
    family: "root",
  },
  {
    id: "recent",
    label: "What is leaving",
    role: "the recent past, already on its way out",
    family: "past",
  },
  {
    id: "crown",
    label: "The crown",
    role: "what is known or hoped above the matter",
    family: "crown",
  },
  {
    id: "near",
    label: "What approaches",
    role: "the near future, still able to turn",
    family: "future",
  },
  {
    id: "self",
    label: "The self",
    role: "how the asker meets this",
    family: "self",
  },
  {
    id: "house",
    label: "The house",
    role: "the people and the place around it",
    family: "house",
  },
  {
    id: "hope",
    label: "Hope and fear",
    role: "what is wanted, tangled with what is feared",
    family: "hope",
  },
  {
    id: "outcome",
    label: "The line",
    role: "where this goes if nothing breaks it",
    family: "outcome",
  },
];

const HORSESHOE: SpreadPosition[] = [
  { id: "h-past", label: "Past", role: "what set this in motion", family: "past" },
  { id: "h-present", label: "Present", role: "the live wire", family: "present" },
  { id: "h-hidden", label: "Hidden", role: "what works out of sight", family: "hidden" },
  { id: "h-obstacle", label: "Obstacle", role: "what stands in the way", family: "obstacle" },
  {
    id: "h-field",
    label: "The field",
    role: "the surrounding people and conditions",
    family: "environment",
  },
  {
    id: "h-counsel",
    label: "Counsel",
    role: "what the cards offer, not a command",
    family: "counsel",
  },
  {
    id: "h-line",
    label: "The line",
    role: "where this goes if nothing breaks it",
    family: "outcome",
  },
];

const ONE: SpreadPosition[] = [
  {
    id: "only",
    label: "The card",
    role: "the single pressure on the question",
    family: "card",
  },
];

const MIND: SpreadPosition[] = [
  { id: "mind", label: "Mind", role: "the mind's part in this", family: "mind" },
  { id: "body", label: "Body", role: "what the body already knows", family: "body" },
  { id: "spirit", label: "Spirit", role: "the part that is not strategy", family: "spirit" },
];

function namedTrio(question: string): SpreadPosition[] | null {
  const advice = question.match(
    /\bsituation\b[\s,:+\-–—/]{0,12}\bobstacle\b[\s,:+\-–—/a-z]{0,16}\b(advice|outcome)\b/i,
  );
  if (!advice) return null;
  const last = advice[1].toLowerCase() === "advice" ? "Advice" : "Outcome";
  const family = last === "Advice" ? "counsel" : "outcome";
  return [
    {
      id: "situation",
      label: "Situation",
      role: "the matter as it stands",
      family: "situation",
    },
    {
      id: "obstacle",
      label: "Obstacle",
      role: "what stands in the way",
      family: "obstacle",
    },
    {
      id: "third",
      label: last,
      role:
        family === "counsel"
          ? "what the cards offer, not a command"
          : "where this goes if nothing breaks it",
      family,
    },
  ];
}

export function spreadFor(question: string): Spread {
  const s = question.toLowerCase();
  const yesNo = /\byes\s*(?:\/|or)\s*no\b/.test(s);

  let name = "Three";
  let nameKey: SpreadNameKey = "three";
  let positions = THREE;

  if (/\bceltic\b/.test(s)) {
    name = "Celtic Cross";
    nameKey = "celtic";
    positions = CELTIC;
  } else if (/\bhorseshoe\b/.test(s)) {
    name = "Horseshoe";
    nameKey = "horseshoe";
    positions = HORSESHOE;
  } else if (/\bmind(?:\s*,\s*|\s+)body(?:\s*,\s*|\s+)(?:and\s+)?spirit\b/.test(s)) {
    name = "Mind, body, spirit";
    nameKey = "mind";
    positions = MIND;
  } else if (/\b(one|single)[- ]card\b/.test(s) || /\bdaily\s+(card|draw)\b/.test(s)) {
    name = "One card";
    nameKey = "one";
    positions = ONE;
  } else {
    const trio = namedTrio(question);
    if (trio) {
      name = trio.map((p) => p.label).join(", ");
      nameKey = "trio";
      positions = trio;
    }
  }

  return { name, nameKey, positions, yesNo };
}
