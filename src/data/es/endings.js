export const ENDINGS = [
  {
    tense: 'Presente',
    ar: ['-o', '-as', '-a', '-amos', '-an'],
    er: ['-o', '-es', '-e', '-emos', '-en'],
    ir: ['-o', '-es', '-e', '-imos', '-en'],
  },
  {
    tense: 'Pretérito',
    ar: ['-é', '-aste', '-ó', '-amos', '-aron'],
    er: ['-í', '-iste', '-ió', '-imos', '-ieron'],
    ir: ['-í', '-iste', '-ió', '-imos', '-ieron'],
  },
  {
    tense: 'Imperfecto',
    ar: ['-aba', '-abas', '-aba', '-ábamos', '-aban'],
    er: ['-ía', '-ías', '-ía', '-íamos', '-ían'],
    ir: ['-ía', '-ías', '-ía', '-íamos', '-ían'],
  },
  {
    tense: 'Futuro',
    note: 'Endings attach to the full infinitive: hablar + é → hablaré.',
    ar: ['-é', '-ás', '-á', '-emos', '-án'],
    er: ['-é', '-ás', '-á', '-emos', '-án'],
    ir: ['-é', '-ás', '-á', '-emos', '-án'],
  },
];

export const GERUND_ENDING = {
  tense: 'Gerundio',
  note: 'One form per verb, no pronoun.',
  ar: '-ando',
  er: '-iendo',
  ir: '-iendo',
};

export const EXAMPLE_VERBS = { ar: 'hablar', er: 'comer', ir: 'vivir' };
