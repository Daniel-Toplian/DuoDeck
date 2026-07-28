import { sample, shuffle } from './deck.js';
import { PRONOUN_LABEL, PRONOUN_SLOTS, TENSE_LABEL, conjugationMeta, vocabMeta } from './hint.js';

const TENSES = Object.keys(TENSE_LABEL);
const ARTICLE = { m: 'el', f: 'la', mf: 'el / la' };

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function vocabKey(item) {
  return `v:${item.es}`;
}

export function conjugationKey(entry) {
  return `c:${entry.infinitive}`;
}

export function numberKey(n) {
  return `n:${n}`;
}

export function colorKey(item) {
  return `col:${item.es}`;
}

export function positionKey(item) {
  return `p:${item.es}`;
}

export function buildPositionCard(item, { direction }, pool) {
  const resolved = direction === 'mixed' ? pick(['pic-word', 'word-pic']) : direction;
  const distractors = sample(
    pool.filter((p) => p.es !== item.es),
    3,
  );
  const choices = shuffle([item, ...distractors]).map((p) => ({
    label: resolved === 'pic-word' ? p.es : null,
    scene: resolved === 'word-pic' ? p.scene : null,
    correct: p.es === item.es,
  }));

  return {
    key: positionKey(item),
    kind: 'position',
    tag: resolved === 'pic-word' ? '🖼 → ES' : 'ES → 🖼',
    prompt: resolved === 'word-pic' ? item.es : null,
    promptSub: null,
    promptScene: resolved === 'pic-word' ? item.scene : null,
    answer: item.es,
    answerNote: item.en,
    typed: false,
    choices,
    meta: item.en,
  };
}

export function buildColorCard(item, { direction }) {
  const resolved = direction === 'mixed' ? pick(['swatch-es', 'es-en']) : direction;
  const meta = `Color · ${item.agreement}`;

  if (resolved === 'es-en') {
    return {
      key: colorKey(item),
      kind: 'color',
      tag: 'ES → EN',
      prompt: item.es,
      promptSub: null,
      answer: item.en,
      accept: item.accept ?? [],
      answerNote: item.agreement,
      answerSwatch: item.hex,
      typed: true,
      meta,
      inputMode: 'text',
      accents: false,
    };
  }

  return {
    key: colorKey(item),
    kind: 'color',
    tag: '🎨 → ES',
    prompt: null,
    promptSub: null,
    answer: item.es,
    answerNote: item.agreement,
    promptSwatch: item.hex,
    typed: true,
    meta,
    inputMode: 'text',
    accents: true,
  };
}

function numberMeta(n, band) {
  if (n > 20 && n < 30) return `${band} · veinti-`;
  if (n > 30 && n < 100 && n % 10 !== 0) return `${band} · decenas + y`;
  if (n > 100) return `${band} · cientos`;
  return band;
}

export function buildNumberCard(n, { direction }, { numberToWords, numberBand }) {
  const resolved = direction === 'mixed' ? pick(['num-word', 'word-num']) : direction;
  const word = numberToWords(n);
  const band = numberBand(n);

  if (resolved === 'word-num') {
    return {
      key: numberKey(n),
      kind: 'number',
      tag: 'ES → 123',
      prompt: word,
      promptSub: null,
      answer: String(n),
      answerNote: null,
      typed: true,
      meta: band,
      inputMode: 'numeric',
      accents: false,
    };
  }

  return {
    key: numberKey(n),
    kind: 'number',
    tag: '123 → ES',
    prompt: String(n),
    promptSub: null,
    answer: word,
    answerNote: null,
    typed: true,
    meta: numberMeta(n, band),
    inputMode: 'text',
    accents: true,
  };
}

export function buildVocabCard(item, { direction, answerMode }) {
  const resolved = direction === 'mixed' ? pick(['es-en', 'en-es']) : direction;
  const article = item.pos === 'noun' ? ARTICLE[item.gender] : null;
  const spanish = article ? `${article} ${item.es}` : item.es;

  if (resolved === 'es-en') {
    return {
      key: vocabKey(item),
      kind: 'vocab',
      tag: 'ES → EN',
      prompt: item.es,
      promptSub: null,
      answer: item.en,
      answerNote: article ? spanish : null,
      typed: false,
      meta: vocabMeta(item),
    };
  }

  return {
    key: vocabKey(item),
    kind: 'vocab',
    tag: 'EN → ES',
    prompt: item.en,
    promptSub: null,
    answer: item.es,
    answerNote: article ? spanish : null,
    typed: answerMode === 'type',
    meta: vocabMeta(item),
  };
}

export function buildConjugationCard(entry, { tense }) {
  const resolvedTense = tense === 'random' ? pick(TENSES) : tense;
  const slot = pick(PRONOUN_SLOTS);
  return {
    key: conjugationKey(entry),
    kind: 'conjugation',
    tag: `${PRONOUN_LABEL[slot]} · ${TENSE_LABEL[resolvedTense]}`,
    prompt: entry.infinitive,
    promptSub: entry.en,
    answer: entry.tenses[resolvedTense][slot],
    answerNote: null,
    typed: true,
    meta: conjugationMeta(entry, resolvedTense),
  };
}
