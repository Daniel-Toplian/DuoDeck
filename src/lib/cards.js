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
