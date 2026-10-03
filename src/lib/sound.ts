type Cue = "draw" | "reveal" | "tap" | "hover";

/** A = 432. Just intonation. The score is built from whole-number ratios of this pitch. */
const ROOT = 432;
/** Theta pulse. Left sits 3 Hz under the note, right 3 Hz over, so the heard pitch stays 432. */
const BEAT = 6;
const THIRD = (ROOT * 5) / 4;
const FIFTH = (ROOT * 3) / 2;
/** Master never opens past this. The shaper ceiling sits under it, so the output cannot clip. */
const CEILING = 0.52;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null;
let hall: GainNode | null = null;
let drone: GainNode | null = null;
let want = true;
let bed = false;
let starting = false;
let bell = 0;
let clock = 0;
let phrase = 0;
let horn = 0;
let lastHover = 0;
let phraseStep = 0;
const nodes: AudioNode[] = [];

if (import.meta.hot) {
  const prior = import.meta.hot.data as { wasOn?: boolean };
  import.meta.hot.dispose((data) => {
    data.wasOn = want && bed;
    clearTimers();
    const closing = ctx;
    ctx = null;
    voiceIn = null;
    void closing?.close();
  });
  if (prior.wasOn) queueMicrotask(() => void armSound());
}

function softCurve() {
  const n = 4096;
  const curve = new Float32Array(n);
  const drive = 1.2;
  const limit = 0.8;
  const norm = Math.tanh(drive);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = (Math.tanh(x * drive) / norm) * limit;
  }
  return curve;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;
    bus = ctx.createGain();
    bus.gain.value = 1;

    const dc = ctx.createBiquadFilter();
    dc.type = "highpass";
    dc.frequency.value = 28;
    dc.Q.value = 0.707;

    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -18;
    glue.knee.value = 24;
    glue.ratio.value = 2;
    glue.attack.value = 0.025;
    glue.release.value = 0.4;

    const safety = ctx.createDynamicsCompressor();
    safety.threshold.value = -10;
    safety.knee.value = 8;
    safety.ratio.value = 12;
    safety.attack.value = 0.002;
    safety.release.value = 0.2;

    const shaper = ctx.createWaveShaper();
    shaper.curve = softCurve();
    shaper.oversample = "4x";

    bus.connect(dc);
    dc.connect(glue);
    glue.connect(safety);
    safety.connect(shaper);
    shaper.connect(master);
    master.connect(ctx.destination);

    hall = ctx.createGain();
    hall.gain.value = 1;
    const taps = [
      { time: 0.31, feedback: 0.2, pan: -0.42, level: 0.16 },
      { time: 0.47, feedback: 0.16, pan: 0.46, level: 0.14 },
      { time: 0.73, feedback: 0.1, pan: 0.08, level: 0.1 },
    ];
    for (const tap of taps) {
      const delay = ctx.createDelay(1.6);
      delay.delayTime.value = tap.time;
      const damp = ctx.createBiquadFilter();
      damp.type = "lowpass";
      damp.frequency.value = 1500;
      damp.Q.value = 0.4;
      const feedback = ctx.createGain();
      feedback.gain.value = tap.feedback;
      const pan = ctx.createStereoPanner();
      pan.pan.value = tap.pan;
      const wet = ctx.createGain();
      wet.gain.value = tap.level;
      hall.connect(delay);
      delay.connect(damp);
      damp.connect(feedback);
      feedback.connect(delay);
      damp.connect(pan);
      pan.connect(wet);
      wet.connect(bus);
    }
  }
  return ctx;
}

let speaking = false;
let voiceIn: GainNode | null = null;

/** A limited path for the spoken reading. It does not pass through the room, so the room can dim without taking the voice with it. */
export function voiceInput(): GainNode | null {
  const context = audio();
  if (!context) return null;
  if (context.state === "suspended") void context.resume();
  if (voiceIn) return voiceIn;
  voiceIn = context.createGain();
  voiceIn.gain.value = 0.82;

  const rumble = context.createBiquadFilter();
  rumble.type = "highpass";
  rumble.frequency.value = 36;
  rumble.Q.value = 0.707;

  const glue = context.createDynamicsCompressor();
  glue.threshold.value = -16;
  glue.knee.value = 16;
  glue.ratio.value = 2;
  glue.attack.value = 0.012;
  glue.release.value = 0.28;

  const safety = context.createDynamicsCompressor();
  safety.threshold.value = -6;
  safety.knee.value = 4;
  safety.ratio.value = 20;
  safety.attack.value = 0.002;
  safety.release.value = 0.14;

  const shaper = context.createWaveShaper();
  shaper.curve = softCurve();
  shaper.oversample = "4x";

  voiceIn.connect(rumble);
  rumble.connect(glue);
  glue.connect(safety);
  safety.connect(shaper);
  shaper.connect(context.destination);
  return voiceIn;
}

export function readSoundPref(): boolean {
  try {
    return localStorage.getItem("eye-sound") !== "off";
  } catch {
    return true;
  }
}

export function soundEnabled(): boolean {
  return want;
}

function rampMaster(value: number, seconds: number) {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  const next = Math.min(CEILING, Math.max(0, value));
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(next, now + seconds);
}

function sustain(
  context: AudioContext,
  freq: number,
  level: number,
  dest: AudioNode,
  pan: number | null,
) {
  const fundamental = context.createOscillator();
  const body = context.createGain();
  fundamental.type = "sine";
  fundamental.frequency.value = freq;
  body.gain.value = level;
  fundamental.connect(body);
  if (pan === null) {
    body.connect(dest);
  } else {
    const ear = context.createStereoPanner();
    ear.pan.value = Math.max(-1, Math.min(1, pan));
    body.connect(ear);
    ear.connect(dest);
  }
  fundamental.start();
  nodes.push(fundamental);
}

function binaural(context: AudioContext, center: number, level: number, dest: AudioNode) {
  sustain(context, center - BEAT / 2, level, dest, -0.82);
  sustain(context, center + BEAT / 2, level, dest, 0.82);
}

function droneBed(context: AudioContext, out: GainNode) {
  drone = context.createGain();
  drone.gain.value = 0;
  drone.connect(out);

  const strings = context.createGain();
  strings.gain.value = 1;
  const bow = context.createBiquadFilter();
  bow.type = "lowpass";
  bow.frequency.value = 220;
  bow.Q.value = 0.5;
  strings.connect(bow);
  bow.connect(drone);

  sustain(context, ROOT / 8, 0.055, strings, null);
  sustain(context, ROOT / 4, 0.036, strings, null);
  sustain(context, (ROOT / 8) * 1.5, 0.012, strings, null);

  const cello = context.createOscillator();
  const celloGain = context.createGain();
  const celloFilter = context.createBiquadFilter();
  cello.type = "sawtooth";
  cello.frequency.value = ROOT / 4;
  celloFilter.type = "lowpass";
  celloFilter.frequency.value = 240;
  celloFilter.Q.value = 0.6;
  celloGain.gain.value = 0.007;
  cello.connect(celloFilter);
  celloFilter.connect(celloGain);
  celloGain.connect(drone);
  cello.start();
  nodes.push(cello);

  const bowLfo = context.createOscillator();
  const bowDepth = context.createGain();
  bowLfo.frequency.value = 0.025;
  bowDepth.gain.value = 50;
  bowLfo.connect(bowDepth);
  bowDepth.connect(celloFilter.frequency);
  bowLfo.start();
  nodes.push(bowLfo);

  const pulse = context.createGain();
  pulse.gain.value = 0.7;
  pulse.connect(drone);
  binaural(context, ROOT, 0.009, pulse);
  binaural(context, FIFTH, 0.003, pulse);

  const seconds = 4;
  const length = context.sampleRate * seconds;
  for (const side of [-0.55, 0.55] as const) {
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.99 + white * 0.01;
      data[i] = last * 3.2;
    }
    const src = context.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const airFilter = context.createBiquadFilter();
    airFilter.type = "lowpass";
    airFilter.frequency.value = 240;
    airFilter.Q.value = 0.3;
    const airGain = context.createGain();
    airGain.gain.value = 0.012;
    const place = context.createStereoPanner();
    place.pan.value = side;
    src.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(place);
    place.connect(drone);
    src.start();
    nodes.push(src);
  }

  const now = context.currentTime;
  drone.gain.setValueAtTime(0, now);
  drone.gain.linearRampToValueAtTime(1, now + 6);
}

function clearTimers() {
  window.clearTimeout(bell);
  window.clearTimeout(clock);
  window.clearTimeout(phrase);
  window.clearTimeout(horn);
  bell = 0;
  clock = 0;
  phrase = 0;
  horn = 0;
}

function later(slot: "bell" | "clock" | "phrase" | "horn", ms: number, play: () => void) {
  if (!want || !bed) return;
  const id = window.setTimeout(() => {
    if (slot === "bell") bell = 0;
    if (slot === "clock") clock = 0;
    if (slot === "phrase") phrase = 0;
    if (slot === "horn") horn = 0;
    if (!want) return;
    play();
    if (slot === "bell") later("bell", 14000 + Math.random() * 12000, distantBell);
    if (slot === "clock") later("clock", 1800, clockTick);
    if (slot === "horn") later("horn", 26000 + Math.random() * 14000, brassSwell);
  }, ms);
  if (slot === "bell") bell = id;
  if (slot === "clock") clock = id;
  if (slot === "phrase") phrase = id;
  if (slot === "horn") horn = id;
}

function armScore() {
  if (!bell) later("bell", 9000, distantBell);
  if (!clock) later("clock", 1800, clockTick);
  if (!phrase) later("phrase", 5000, pianoNote);
  if (!horn) later("horn", 16000, brassSwell);
}

function distantBell() {
  const context = audio();
  if (!context || !bus || !hall || !want) return;
  const now = context.currentTime;
  const notes: Array<[number, number]> = [
    [ROOT, 0],
    [THIRD, 0.7],
    [FIFTH, 1.45],
  ];
  for (const [freq, delay] of notes) {
    tone(context, bus, now + delay, freq, 0.008, 5.6, 0.4);
    tone(context, hall, now + delay, freq, 0.014, 6.4, 0.45);
  }
}

function clockTick() {
  const context = audio();
  if (!context || !bus || !want) return;
  const now = context.currentTime;
  tone(context, bus, now, ROOT / 2, 0.007, 0.16, 0.008);
  tone(context, bus, now, ROOT / 8, 0.012, 0.22, 0.012);
}

const FIGURE = [ROOT / 2, (ROOT / 2) * 1.25, (ROOT / 2) * 1.5, ROOT, (ROOT / 2) * 1.5, (ROOT / 2) * 1.25];

function pianoNote() {
  const context = audio();
  if (!context || !bus || !hall || !want) return;
  const note = FIGURE[phraseStep % FIGURE.length];
  phraseStep += 1;
  const now = context.currentTime;
  tone(context, bus, now, note, 0.01, 3.2, 0.03);
  tone(context, hall, now, note, 0.016, 4.4, 0.04);
  const gap = phraseStep % FIGURE.length === 0 ? 8000 + Math.random() * 5000 : 2400;
  later("phrase", gap, pianoNote);
}

function brassSwell() {
  const context = audio();
  if (!context || !bus || !hall || !want) return;
  const now = context.currentTime;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.55;
  filter.frequency.setValueAtTime(70, now);
  filter.frequency.exponentialRampToValueAtTime(380, now + 3.2);
  filter.frequency.exponentialRampToValueAtTime(110, now + 9);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.014, now + 3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 9.2);
  for (const freq of [ROOT / 8, (ROOT / 8) * 1.5, ROOT / 4]) {
    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start(now);
    osc.stop(now + 9.4);
  }
  filter.connect(gain);
  const dry = context.createGain();
  dry.gain.value = 0.35;
  gain.connect(dry);
  dry.connect(bus);
  gain.connect(hall);
}

function tone(
  context: AudioContext,
  out: GainNode,
  when: number,
  freq: number,
  peak: number,
  dur: number,
  attack: number,
) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, when);
  const rise = Math.min(attack, dur * 0.45);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(peak, when + rise);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(dur, rise + 0.05));
  osc.connect(gain);
  gain.connect(out);
  osc.start(when);
  osc.stop(when + dur + 0.08);
}

function rustle(context: AudioContext, out: GainNode, when: number, peak: number, dur: number) {
  const length = Math.floor(context.sampleRate * dur);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.96 + white * 0.04;
    data[i] = last * (1 - i / length) * 2.4;
  }
  const src = context.createBufferSource();
  src.buffer = buffer;
  const band = context.createBiquadFilter();
  band.type = "lowpass";
  band.frequency.value = 320;
  band.Q.value = 0.3;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(peak, when + Math.min(0.06, dur * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(band);
  band.connect(gain);
  gain.connect(out);
  src.start(when);
  src.stop(when + dur + 0.02);
}

export async function armSound() {
  if (!want) return;
  const context = audio();
  if (!context || !master) return;
  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return;
    }
  }
  if (context.state !== "running") return;
  if (bed || starting) {
    rampMaster(CEILING, 0.6);
    armScore();
    return;
  }
  starting = true;
  try {
    bed = true;
    rampMaster(CEILING, 1.6);
    droneBed(context, bus ?? master);
    armScore();
  } finally {
    starting = false;
  }
}

export function setBedQuiet(quiet: boolean) {
  speaking = quiet;
  if (!ctx || !bus) return;
  const now = ctx.currentTime;
  const level = want && quiet ? 0.14 : 1;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setValueAtTime(bus.gain.value, now);
  bus.gain.linearRampToValueAtTime(level, now + (quiet ? 0.75 : 1.05));
}

export function setSoundEnabled(on: boolean) {
  want = on;
  try {
    localStorage.setItem("eye-sound", on ? "on" : "off");
  } catch {
    /* private mode */
  }
  if (!on) {
    clearTimers();
    rampMaster(0, 0.45);
    if (!speaking && ctx?.state === "running") void ctx.suspend();
    return;
  }
  void armSound();
}

export function endSessionSound(done: () => void) {
  if (!ctx || !master || !want || !bus) {
    done();
    return;
  }
  clearTimers();
  const now = ctx.currentTime;
  tone(ctx, bus, now, ROOT / 8, 0.02, 0.7, 0.04);
  rampMaster(0, 0.72);
  window.setTimeout(done, 760);
}

export function playCue(cue: Cue) {
  if (!want) return;
  const context = audio();
  if (!context || !master || !bus) return;
  if (context.state === "suspended") void context.resume();
  if (master.gain.value < 0.12) rampMaster(CEILING, 0.5);
  if (!bed) void armSound();
  const now = context.currentTime;
  const space = hall ?? bus;
  if (cue === "hover") {
    const stamp = performance.now();
    if (stamp - lastHover < 280) return;
    lastHover = stamp;
    rustle(context, bus, now, 0.012, 0.36);
    return;
  }
  if (cue === "tap") {
    tone(context, bus, now, ROOT, 0.012, 1, 0.1);
    tone(context, space, now + 0.05, FIFTH, 0.008, 1.4, 0.14);
    return;
  }
  if (cue === "reveal") {
    tone(context, bus, now, ROOT, 0.014, 2.6, 0.16);
    tone(context, space, now + 0.1, THIRD, 0.01, 3.2, 0.2);
    rustle(context, bus, now, 0.008, 0.45);
    return;
  }
  rustle(context, bus, now, 0.02, 0.6);
  rustle(context, bus, now + 0.22, 0.01, 0.5);
  tone(context, bus, now, ROOT / 4, 0.02, 1.8, 0.12);
  tone(context, space, now + 0.16, (ROOT / 4) * 1.5, 0.012, 2.2, 0.16);
}
