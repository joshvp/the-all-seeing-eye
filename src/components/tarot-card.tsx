import type { TarotCard as Card } from "@/lib/tarot-deck";

export function TarotCard({
  card,
  reversed,
  up,
  label,
  name,
  orientation,
  faceDown,
  onWhisper,
}: {
  card: Card;
  reversed: boolean;
  up: boolean;
  label: string;
  name: string;
  orientation: string;
  faceDown: string;
  onWhisper?: () => void;
}) {
  return (
    <figure
      className="min-w-0"
      aria-label={up ? `${label}. ${name}, ${orientation}.` : `${label}. ${faceDown}`}
      onPointerEnter={onWhisper}
    >
      <div className="card-stage">
        <div className={up ? "card-flip is-up" : "card-flip"}>
          <div className="card-back overflow-hidden border border-brass/50">
            <img
              src="/cards/back.jpg"
              alt=""
              width={550}
              height={950}
              draggable={false}
              className="card-photo"
            />
          </div>
          <div className="card-face overflow-hidden border border-brass/70">
            <div className={reversed ? "card-turn" : "h-full"}>
              <img
                src={`/cards/${card.id}.jpg`}
                alt=""
                width={560}
                height={969}
                draggable={false}
                className="card-photo"
              />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center">
        <span className="block font-display text-lg leading-tight text-bone">{label}</span>
        <span className="mt-1 block text-sm break-words text-ash">{up ? `${name}, ${orientation}` : faceDown}</span>
      </figcaption>
    </figure>
  );
}
