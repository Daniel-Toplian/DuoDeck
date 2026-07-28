import { loadConjugations, loadGerunds } from '../data/index.js';
import { buildConjugationCard } from '../lib/cards.js';
import { createSession, sample } from '../lib/deck.js';
import { navigate } from '../router.js';
import { getSettings, updateDrillSettings } from '../state.js';
import { renderSetup } from './setup.js';
import { runSession } from './session.js';

const SIZES = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
];

function filterEntries(entries, { verbs, freq }) {
  const limit = freq === 'all' ? Infinity : Number(freq);
  return entries.filter((entry) => {
    if (verbs === 'regular' && entry.class === 'irregular') return false;
    if (verbs === 'irregular' && entry.class !== 'irregular') return false;
    return entry.id <= limit;
  });
}

export async function conjugationView(app) {
  const settings = getSettings();
  const entries = await loadConjugations(settings.lang);
  const gerunds = await loadGerunds(settings.lang);

  renderSetup({
    app,
    title: 'Conjugation · Conjugación',
    subtitle: `${entries.length} verbs · type the form, grade yourself`,
    chips: [
      {
        key: 'tense',
        label: 'Tense',
        value: settings.conjugation.tense,
        options: [
          { label: 'Presente', value: 'present' },
          { label: 'Pretérito', value: 'preterite' },
          { label: 'Imperfecto', value: 'imperfect' },
          { label: 'Futuro', value: 'future' },
          { label: 'Gerundio (-ndo)', value: 'gerund' },
          { label: 'Random', value: 'random' },
        ],
      },
      {
        key: 'verbs',
        label: 'Verbs',
        value: settings.conjugation.verbs,
        options: [
          { label: 'All', value: 'all' },
          { label: 'Regular', value: 'regular' },
          { label: 'Irregular', value: 'irregular' },
        ],
      },
      { key: 'size', label: 'Session size', value: settings.conjugation.size, options: SIZES },
    ],
    advanced: [
      {
        key: 'freq',
        label: 'Frequency range',
        value: settings.conjugation.freq,
        options: [
          { label: 'Top 50', value: 50 },
          { label: 'Top 100', value: 100 },
          { label: 'Top 200', value: 200 },
          { label: 'All', value: 'all' },
        ],
      },
    ],
    onBack: () => navigate('/'),
    onStart: (values) => {
      updateDrillSettings('conjugation', values);
      const pool = filterEntries(entries, values);
      if (!pool.length) {
        app.querySelector('.setup').insertAdjacentHTML(
          'beforeend',
          '<p class="error">No verbs match those filters.</p>',
        );
        return;
      }
      startSession(
        app,
        sample(pool, values.size).map((entry) => buildConjugationCard(entry, values, gerunds)),
        values.tense === 'gerund',
      );
    },
  });
}

function startSession(app, cards, autoGrade = false) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Conjugation · Conjugación',
    autoGrade,
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed, autoGrade),
  });
}
