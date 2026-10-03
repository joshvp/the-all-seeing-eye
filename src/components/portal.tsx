import { useServerFn } from "@tanstack/react-start";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { giftsFor } from "@/lib/gift";
import { DoorQr } from "@/components/door-qr";
import { EyeMark } from "@/components/eye-mark";
import { TarotCard } from "@/components/tarot-card";
import { cardName } from "@/lib/card-names";
import { drawCards, type Drawn } from "@/lib/draw";
import {
  fallbackVoice,
  leanLine,
  localeMeta,
  LOCALES,
  positionLabel,
  spreadLabel,
  t,
  type LocaleId,
} from "@/lib/i18n";
import type { ThemeName } from "@/lib/prefs";
import { readSpread, type ReadInput } from "@/lib/reading.functions";
import { armSound, endSessionSound, playCue, readSoundPref, setSoundEnabled } from "@/lib/sound";
import { spreadFor, type SpreadNameKey, type SpreadPosition } from "@/lib/spreads";
import { SUIT_ELEMENT } from "@/lib/tarot-deck";
import { composeReading, isCrisis, meaningFor, type Voice } from "@/lib/voice";
import { SpokenRead } from "@/components/spoken";

type Lay = {
  seal: number;
  question: string;
  spreadName: string;
  nameKey: SpreadNameKey;
  positions: SpreadPosition[];
  drawn: Drawn[];
  yesNo: boolean;
  locale: LocaleId;
};

function gridClass(count: number): string {
  if (count <= 3) return "grid grid-cols-3 gap-3 sm:gap-6";
  if (count <= 7) return "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4";
  return "grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4";
}

function leanIndex(positions: SpreadPosition[]): number {
  const idx = positions.findIndex(
    (p) => p.family === "future" || p.family === "outcome" || p.family === "card",
  );
  return idx;
}

export function Portal({
  initialLocale,
  initialTheme,
}: {
  initialLocale: LocaleId;
  initialTheme: ThemeName;
}) {
  const voiceFn = useServerFn(readSpread);
  const fieldId = useId();
  const langId = useId();
  const [question, setQuestion] = useState("");
  const [note, setNote] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [lay, setLay] = useState<Lay | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [shown, setShown] = useState(0);
  const [looking, setLooking] = useState(false);
  const [locale, setLocale] = useState(initialLocale);
  const [theme, setTheme] = useState(initialTheme);
  const [sound, setSound] = useState(true);
  const busy = useRef(false);
  const sealRef = useRef(0);
  const tongue = lay?.locale ?? locale;

  useEffect(() => {
    const meta = localeMeta(locale);
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
    document.cookie = `eye-locale=${locale};path=/;max-age=31536000;samesite=lax`;
    document.cookie = `eye-theme=${theme};path=/;max-age=31536000;samesite=lax`;
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.setAttribute("content", theme === "day" ? "#f3efe6" : "#0c0b09");
  }, [locale, theme]);

  useEffect(() => {
    const on = readSoundPref();
    setSound(on);
    if (!on) {
      setSoundEnabled(false);
      return;
    }
    void armSound();
  }, []);

  useEffect(() => {
    if (!lay) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("lay")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    if (reduce) {
      setShown(lay.drawn.length);
      return;
    }
    setShown(0);
    const step = lay.drawn.length > 5 ? 160 : 380;
    const timers = lay.drawn.map((_, i) =>
      window.setTimeout(() => {
        setShown(i + 1);
        playCue("reveal");
      }, 220 + i * step),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [lay]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    const text = question.trim();
    if (!text) {
      setNote(t(locale, "empty"));
      return;
    }
    if (isCrisis(text)) {
      setCrisis(true);
      setLay(null);
      setVoice(null);
      setLooking(false);
      setQuestion("");
      return;
    }
    busy.current = true;
    playCue("draw");
    const seal = Date.now();
    sealRef.current = seal;
    setNote("");
    setCrisis(false);
    const spread = spreadFor(text);
    const drawn = drawCards(spread.positions.length);
    const next: Lay = {
      seal,
      question: text,
      spreadName: spread.name,
      nameKey: spread.nameKey,
      positions: spread.positions,
      drawn,
      yesNo: spread.yesNo,
      locale,
    };
    setVoice(null);
    setLay(next);
    setLooking(true);
    setQuestion("");

    const local =
      locale === "en"
        ? composeReading({
            question: text,
            positions: spread.positions,
            drawn,
            yesNo: spread.yesNo,
          })
        : fallbackVoice({
            locale,
            positions: spread.positions,
            drawn,
            yesNo: spread.yesNo,
          });
    if (locale !== "en") setVoice(local);
    const language = localeMeta(locale).english;
    const payload: ReadInput = {
      question: text,
      spreadName: spread.name,
      yesNo: spread.yesNo,
      locale,
      language,
      cards: drawn.map((item, i) => {
        const position = spread.positions[i];
        return {
          position: position?.label ?? "Card",
          role: position?.role ?? "in the line",
          name: item.card.name,
          displayName: cardName(locale, item.card),
          orientation: item.reversed ? "reversed" : "upright",
          arcana: item.card.arcana,
          suit: item.card.suit,
          element: item.card.suit ? SUIT_ELEMENT[item.card.suit] : null,
          blurb: item.card.blurb,
          keywords: item.reversed ? item.card.reversed : item.card.upright,
          guideYesNo: item.card.yesNo,
        };
      }),
    };

    try {
      const remote = await voiceFn({ data: payload });
      if (sealRef.current !== seal) return;
      if (remote.ok && remote.lines.every((line) => line.here.trim().length > 0) && remote.ask.trim()) {
        setVoice({
          lines: remote.lines,
          spread: remote.spread,
          spoken: remote.spoken || local.spoken,
          ask: remote.ask,
          lean: spread.yesNo ? (remote.lean ?? local.lean) : null,
        });
      } else if (locale === "en") {
        setVoice(local);
      }
    } catch {
      if (sealRef.current === seal && locale === "en") setVoice(local);
    } finally {
      if (sealRef.current === seal) {
        busy.current = false;
        setLooking(false);
      }
    }
  }

  const prompt = voice?.ask ?? t(locale, "carry");
  const allShown = lay ? shown >= lay.drawn.length : false;
  const leanAt = lay ? leanIndex(lay.positions) : -1;
  const leanCard = lay ? lay.drawn[leanAt >= 0 ? leanAt : lay.drawn.length - 1] : undefined;
  const spreadName = lay ? spreadLabel(lay.locale, lay.nameKey) : null;
  const shellDir = localeMeta(locale).dir;

  return (
    <main
      dir={shellDir}
      lang={locale}
      data-theme={theme}
      className="shell mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10"
      onPointerDown={() => {
        void armSound();
      }}
    >
      <div className="room-glow" aria-hidden="true" />

      <nav className="flex w-full flex-nowrap items-center justify-center gap-x-1 pt-[max(0.85rem,env(safe-area-inset-top))] sm:gap-x-3">
        <label className="sr-only" htmlFor={langId}>
          {t(locale, "language")}
        </label>
        <select
          id={langId}
          value={locale}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "en" || LOCALES.some((item) => item.id === next)) {
              setLocale(next as LocaleId);
              playCue("tap");
            }
          }}
          className="min-h-11 max-w-[9.5rem] shrink border border-bone/30 bg-transparent px-2 text-bone sm:px-3"
        >
          {LOCALES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="flex" role="group" aria-label={t(locale, "theme")}>
          <button
            type="button"
            aria-pressed={theme === "day"}
            onClick={() => {
              setTheme("day");
              playCue("tap");
            }}
            className={theme === "day" ? "min-h-11 px-2 text-brass sm:px-3" : "min-h-11 px-2 text-ash sm:px-3"}
          >
            {t(locale, "day")}
          </button>
          <button
            type="button"
            aria-pressed={theme === "night"}
            onClick={() => {
              setTheme("night");
              playCue("tap");
            }}
            className={theme === "night" ? "min-h-11 px-2 text-brass sm:px-3" : "min-h-11 px-2 text-ash sm:px-3"}
          >
            {t(locale, "night")}
          </button>
        </div>
        <button
          type="button"
          aria-pressed={sound}
          onClick={() => {
            const next = !sound;
            setSound(next);
            setSoundEnabled(next);
            if (next) playCue("tap");
          }}
          className={sound ? "min-h-11 shrink-0 px-2 text-brass sm:px-3" : "min-h-11 shrink-0 px-2 text-ash sm:px-3"}
        >
          {sound ? t(locale, "sound") : t(locale, "quiet")}
        </button>
      </nav>

      <div
        className={`flex w-full flex-1 flex-col items-center ${
          lay || crisis ? "gap-16 pb-16 pt-12" : "justify-center gap-14 pb-8"
        }`}
      >
      <header className="flex w-full flex-col items-center gap-5">
        <EyeMark seeing={Boolean(lay && (looking || !voice || !allShown))} />
        <p className="font-display text-sm tracking-widest text-ash">{t(locale, "appName")}</p>
      </header>

      {crisis ? (
        <section className="mx-auto w-full max-w-prose" aria-live="polite">
          <p className="font-display text-3xl leading-tight text-bone">{t(locale, "crisis1")}</p>
          <p className="mt-6 text-lg text-bone">{t(locale, "crisis2")}</p>
          <p className="mt-4 text-ash">{t(locale, "crisis3")}</p>
        </section>
      ) : null}

      {!lay && !crisis ? (
        <section className="mx-auto w-full max-w-prose">
          <p className="font-display text-4xl leading-tight text-bone text-balance">{t(locale, "stumbled")}</p>
          <p className="mt-4 text-lg text-ash">{t(locale, "door")}</p>
        </section>
      ) : null}

      {lay ? (
        <article id="lay" className="mx-auto w-full scroll-mt-8" aria-live="polite">
          <p className="mx-auto max-w-prose font-display text-2xl leading-snug text-bone text-balance italic">{lay.question}</p>
          {spreadName ? <p className="mt-3 text-sm tracking-wide text-ash">{spreadName}</p> : null}
          {!(voice && allShown && !looking) ? (
            <p className="seeing-line mt-6 text-sm tracking-wide text-brass" role="status">
              {t(tongue, "seeing")}
            </p>
          ) : null}
          <div className={lay.drawn.length === 1 ? "mx-auto mt-8 w-36 sm:w-44" : `mt-8 ${gridClass(lay.drawn.length)}`}>
            {lay.drawn.map((item, i) => {
              const position = lay.positions[i];
              const label = position ? positionLabel(lay.locale, position.id, position.family) : t(lay.locale, "theCard");
              return (
                <TarotCard
                  key={`${lay.seal}-${item.card.id}`}
                  card={item.card}
                  reversed={item.reversed}
                  up={shown > i}
                  label={label}
                  name={cardName(lay.locale, item.card)}
                  orientation={item.reversed ? t(lay.locale, "reversed") : t(lay.locale, "upright")}
                  faceDown={t(lay.locale, "unturned")}
                  onWhisper={() => playCue("hover")}
                />
              );
            })}
          </div>

          <div className="mx-auto mt-12 w-full max-w-prose">
            {lay.drawn.map((item, i) => {
              if (shown <= i) return null;
              const position = lay.positions[i];
              const label = position ? positionLabel(lay.locale, position.id, position.family) : t(lay.locale, "theCard");
              const spoken = cardName(lay.locale, item.card);
              const here = voice?.lines[i]?.here;
              const fallbackMeaning = t(lay.locale, item.reversed ? "fallbackDown" : "fallbackUp").replace("{name}", spoken);
              const shownMeaning =
                lay.locale === "en"
                  ? meaningFor(item.card, item.reversed)
                  : voice?.lines[i]?.meaning || (voice ? fallbackMeaning : undefined);
              return (
                <section key={`${lay.seal}-line-${item.card.id}`} className="mt-10 first:mt-0">
                  <h2 className="font-display text-3xl leading-tight text-bone text-balance">
                    {label}. {spoken}, {item.reversed ? t(lay.locale, "reversed") : t(lay.locale, "upright")}.
                  </h2>
                  {shownMeaning ? (
                    <p className="mt-4 text-lg leading-relaxed text-pretty text-ash">{shownMeaning}</p>
                  ) : null}
                  {here ? <p className="mt-4 text-lg leading-relaxed text-pretty text-bone">{here}</p> : null}
                </section>
              );
            })}
          </div>

          {voice && allShown && !looking ? (
            <section className="mx-auto mt-14 w-full max-w-prose">
              {lay.yesNo && voice.lean && leanCard ? (
                <p className="text-lg text-brass">
                  {leanLine(lay.locale, voice.lean, cardName(lay.locale, leanCard.card), leanCard.reversed)}
                </p>
              ) : null}
              <h2 className="mt-8 font-display text-3xl text-bone">{t(lay.locale, "spread")}</h2>
              <p className="mt-4 text-lg leading-relaxed text-pretty text-bone">
                {voice.spread.replace(/\s*\n+\s*/g, " ").trim()}
              </p>
              <SpokenRead
                key={lay.seal}
                script={(voice.spoken || voice.spread).replace(/\s*\n+\s*/g, " ").trim()}
                locale={lay.locale}
                label={t(lay.locale, "hear")}
              />
            </section>
          ) : null}
        </article>
      ) : null}

      {!crisis ? (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-prose">
          <label htmlFor={fieldId} className="block font-display text-3xl leading-tight text-bone text-balance">
            {lay && voice && allShown && !looking ? prompt : t(locale, "carry")}
          </label>
          <div className="mt-6 flex w-full flex-col items-center gap-5">
            <input
              id={fieldId}
              value={question}
              maxLength={500}
              autoComplete="off"
              disabled={looking}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (note) setNote("");
              }}
              className="min-h-11 w-full border-b border-bone/30 bg-transparent py-2 text-center font-display text-2xl text-bone outline-none focus:border-brass disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={looking}
              onPointerEnter={() => playCue("hover")}
              className="min-h-11 border border-brass/80 px-8 font-display text-xl text-bone transition-colors duration-200 hover:bg-brass/10 disabled:opacity-40"
            >
              {looking ? t(locale, "looking") : lay ? t(locale, "again") : t(locale, "look")}
            </button>
          </div>
          {note ? (
            <p className="mt-4 text-ash" role="status">
              {note}
            </p>
          ) : null}
          {!lay ? <p className="mt-8 text-sm leading-relaxed text-ash">{t(locale, "hint")}</p> : null}
        </form>
      ) : null}

      {lay && voice && allShown && !looking ? (
        <footer className="flex w-full flex-col items-center gap-12">
          <DoorQr caption={t(locale, "take")} />
          <button
            type="button"
            onClick={() => {
              endSessionSound(() => {
                window.location.reload();
              });
            }}
            className="min-h-11 px-3 text-ash transition-colors duration-200 hover:text-bone"
          >
            {t(locale, "end")}
          </button>
          <div className="flex flex-col items-center gap-5">
            <p className="text-sm tracking-wide text-ash">{t(locale, "keeper")}</p>
            <p className="max-w-prose font-display text-lg leading-relaxed text-bone text-pretty">{t(locale, "gift")}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {giftsFor(locale).map((gift, i) => (
                <a
                  key={gift.amount}
                  href={gift.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    i === 0
                      ? "min-h-11 min-w-28 border border-brass/70 px-5 font-display text-lg leading-[2.75rem] text-bone transition-colors duration-200 hover:bg-brass/10"
                      : "min-h-11 min-w-28 border border-bone/25 px-5 font-display text-lg leading-[2.75rem] text-ash transition-colors duration-200 hover:border-brass/50 hover:text-bone"
                  }
                >
                  ${gift.amount}
                </a>
              ))}
            </div>
          </div>
        </footer>
      ) : null}
      </div>
    </main>
  );
}
