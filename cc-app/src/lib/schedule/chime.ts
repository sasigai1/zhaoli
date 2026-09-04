let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export async function unlockAudio() {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") await audio.resume();
}

function tone(
  audio: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gain = 0.08,
) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export async function playChime() {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") await audio.resume();
  const t = audio.currentTime + 0.02;
  tone(audio, 523.25, t, 1.4, 0.07);
  tone(audio, 659.25, t + 0.12, 1.5, 0.05);
  tone(audio, 783.99, t + 0.28, 1.8, 0.045);
}

export function vibrateSoft() {
  try {
    navigator.vibrate?.([40, 60, 40]);
  } catch {
    /* ignore */
  }
}
