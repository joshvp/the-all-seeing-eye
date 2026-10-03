import { DECK, type TarotCard } from "@/lib/tarot-deck";

export type Drawn = {
  card: TarotCard;
  reversed: boolean;
};

function below(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export function drawCards(count: number): Drawn[] {
  const order = DECK.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = below(i + 1);
    const swap = order[i];
    order[i] = order[j] ?? 0;
    order[j] = swap ?? 0;
  }
  return order.slice(0, count).map((idx) => {
    const card = DECK[idx];
    if (!card) throw new Error("deck");
    return { card, reversed: below(2) === 1 };
  });
}
