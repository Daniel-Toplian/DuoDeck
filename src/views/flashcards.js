import { loadVocab } from '../data/index.js';
import { buildVocabCard } from '../lib/cards.js';
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

const FREQ = [
  { label: 'Top 200', value: 200 },
  { label: 'Top 500', value: 500 },
  { label: 'Top 1000', value: 1000 },
  { label: 'All', value: 'all' },
];

function filterItems(vocab, { pos, freq }) {
  const limit = freq === 'all' ? Infinity : Number(freq);
  return vocab.filter((item) => {
    if (pos === 'nouns' && item.pos !== 'noun') return false;
    if (pos === 'verbs' && item.pos !== 'verb') return false;
    return (item.rank ?? Infinity) <= limit;
  });
}

export async function flashcardsView(app) {
  const settings = getSettings();
  const vocab = await loadVocab(settings.lang);

  renderSetup({
    app,
    title: 'Flashcards',
    subtitle: `${vocab.length} words · self-graded`,
    chips: [
      {
        key: 'direction',
        label: 'Direction',
        value: settings.flashcards.direction,
        options: [
          { label: 'ES → EN', value: 'es-en' },
          { label: 'EN → ES', value: 'en-es' },
          { label: 'Mixed', value: 'mixed' },
        ],
      },
      {
        key: 'answerMode',
        label: 'Answer mode',
        value: settings.flashcards.answerMode,
        options: [
          { label: 'Reveal', value: 'reveal' },
          { label: 'Type (EN → ES)', value: 'type' },
        ],
      },
      { key: 'size', label: 'Session size', value: settings.flashcards.size, options: SIZES },
    ],
    advanced: [
      { key: 'freq', label: 'Frequency range', value: settings.flashcards.freq, options: FREQ },
      {
        key: 'pos',
        label: 'Word type',
        value: settings.flashcards.pos,
        options: [
          { label: 'Nouns', value: 'nouns' },
          { label: 'Verbs', value: 'verbs' },
          { label: 'Both', value: 'both' },
        ],
      },
    ],
    onBack: () => navigate('/'),
    onStart: (values) => {
      updateDrillSettings('flashcards', values);
      const pool = filterItems(vocab, values);
      if (!pool.length) {
        app.querySelector('.setup').insertAdjacentHTML(
          'beforeend',
          '<p class="error">No words match those filters.</p>',
        );
        return;
      }
      startSession(app, sample(pool, values.size).map((item) => buildVocabCard(item, values)));
    },
  });
}

function startSession(app, cards) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Flashcards',
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed),
  });
}
