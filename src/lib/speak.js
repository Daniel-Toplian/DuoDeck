import { escapeHtml } from './text.js';

let voice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === 'es-ES') ?? voices.find((v) => v.lang.startsWith('es')) ?? null;
}

if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
  pickVoice();
}

export function canSpeak() {
  return 'speechSynthesis' in window;
}

export function speak(text) {
  if (!canSpeak() || !text) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.lang = 'es-ES';
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

export function sayButton(text) {
  if (!canSpeak() || !text) return '';
  return `<button class="say" data-say="${escapeHtml(text)}" aria-label="Pronounce ${escapeHtml(text)}">🔊</button>`;
}

export function bindSay(root) {
  root.querySelectorAll('[data-say]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      speak(el.dataset.say);
    });
  });
}
