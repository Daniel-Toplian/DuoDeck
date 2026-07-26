const GENDER_ARTICLE = { m: 'el', f: 'la', mf: 'el / la' };

const CLASS_LABEL = {
  'regular-ar': 'Regular -AR',
  'regular-er': 'Regular -ER',
  'regular-ir': 'Regular -IR',
  irregular: 'Irregular',
};

export const TENSE_LABEL = {
  present: 'Presente',
  preterite: 'Pretérito',
  imperfect: 'Imperfecto',
  future: 'Futuro',
};

export const PRONOUN_LABEL = {
  yo: 'yo',
  tu: 'tú',
  el: 'él / ella / usted',
  nosotros: 'nosotros / nosotras',
  ellos: 'ellos / ellas / ustedes',
};

export const PRONOUN_SLOTS = ['yo', 'tu', 'el', 'nosotros', 'ellos'];

export function vocabMeta(item) {
  if (item.pos === 'verb') return `Verbo · -${item.es.slice(-2).toUpperCase()}`;
  const article = GENDER_ARTICLE[item.gender];
  return article ? `Sustantivo · ${article}` : 'Sustantivo';
}

export function conjugationMeta(entry, tense) {
  return `${CLASS_LABEL[entry.class] ?? entry.class} · ${TENSE_LABEL[tense]}`;
}
