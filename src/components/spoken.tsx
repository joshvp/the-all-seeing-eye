import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { speakReading } from "@/lib/speak.functions";
import { setBedQuiet, voiceInput } from "@/lib/sound";

const VOICE = "lux";

export function SpokenRead({
  script,
  locale,
  label,
}: {
  script: string;
  locale: string;
  label: string;
}) {
  const speak = useServerFn(speakReading);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);
  const token = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  function release() {
    const node = audio.current;
    if (node) {
      node.pause();
      node.src = "";
    }
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    audio.current = null;
    setPlaying(false);
    setProgress(0);
    setBedQuiet(false);
  }

  useEffect(() => {
    return () => {
      token.current += 1;
      release();
    };
  }, [script, VOICE]);

  function bind(node: HTMLAudioElement) {
    node.ontimeupdate = () => {
      if (!node.duration || !Number.isFinite(node.duration)) return;
      setProgress(node.currentTime / node.duration);
    };
    node.onended = () => {
      setPlaying(false);
      setProgress(1);
      setBedQuiet(false);
    };
    node.onpause = () => {
      if (!node.ended) setPlaying(false);
    };
    node.onplay = () => setPlaying(true);
  }

  async function toggle() {
    if (busy) return;
    const current = audio.current;
    if (current && url.current) {
      if (!current.paused) {
        current.pause();
        setBedQuiet(false);
        return;
      }
      setBedQuiet(true);
      try {
        await current.play();
      } catch {
        setBedQuiet(false);
      }
      return;
    }

    const mine = token.current + 1;
    token.current = mine;
    setBusy(true);
    try {
      const result = await speak({ data: { text: script, locale } });
      if (token.current !== mine) return;
      if (!result.ok) return;
      const bytes = Uint8Array.from(atob(result.audio), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const next = URL.createObjectURL(blob);
      if (token.current !== mine) {
        URL.revokeObjectURL(next);
        return;
      }
      const node = new Audio(next);
      node.volume = 1;
      node.preload = "auto";
      const input = voiceInput();
      if (input) (input.context as AudioContext).createMediaElementSource(node).connect(input);
      url.current = next;
      audio.current = node;
      bind(node);
      setBedQuiet(true);
      await node.play();
    } catch {
      setBedQuiet(false);
    } finally {
      if (token.current === mine) setBusy(false);
    }
  }

  return (
    <div className="mt-8 flex w-full flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-pressed={playing}
        aria-busy={busy}
        disabled={busy}
        className="min-h-11 border border-brass/80 px-6 font-display text-lg text-bone transition-colors duration-200 hover:bg-brass/10 disabled:opacity-50"
      >
        {label}
      </button>
      <div className="h-px w-full max-w-xs bg-bone/20" aria-hidden="true">
        <div className="h-px bg-brass" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
