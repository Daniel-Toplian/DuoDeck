import { normalize } from './text.js';

function squash(value) {
  return normalize(value).replace(/\s+/g, '');
}

function keepAccents(value) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function checkAnswer(card, typed) {
  const raw = String(typed ?? '').trim();
  if (!raw) return { correct: false, note: null };

  if (card.inputMode === 'numeric') {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return { correct: false, note: null };
    return { correct: Number(digits) === Number(card.answer), note: null };
  }

  const expected = card.answer;
  if (normalize(raw) === normalize(expected)) {
    const note =
      keepAccents(raw) !== keepAccents(expected) ? `watch the accent: ${expected}` : null;
    return { correct: true, note };
  }
  if (squash(raw) === squash(expected)) {
    return { correct: true, note: `mind the spaces: ${expected}` };
  }
  return { correct: false, note: null };
}
