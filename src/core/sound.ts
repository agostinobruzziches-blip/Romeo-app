/** Suoni morbidi generati al volo (nessun file audio). Nessun suono per gli errori. */
let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.2;

export function configureSound(on: boolean, vol: number) {
  enabled = on;
  volume = Math.max(0, Math.min(1, vol));
}

function context(): AudioContext | null {
  if (!enabled || volume === 0) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, gain = 1) {
  const c = context();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  const peak = 0.25 * volume * gain;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sounds = {
  giusto: () => { tone(660, 0, 0.25); tone(880, 0.08, 0.3, 0.7); },
  medaglia: () => { tone(523, 0, 0.3); tone(659, 0.12, 0.3); tone(784, 0.24, 0.45); },
  festa: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.5, 0.8)); },
  tocco: () => tone(440, 0, 0.06, 0.25),
};
