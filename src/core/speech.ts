/** Lettura ad alta voce in italiano (Web Speech API), solo su richiesta. */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function italianVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'it-IT') ?? voices.find((v) => v.lang.startsWith('it'));
}

export function speak(text: string, onEnd?: () => void): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  u.rate = 0.9;
  const v = italianVoice();
  if (v) u.voice = v;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
