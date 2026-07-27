import { loadNumbers } from '../data/index.js';
import { buildNumberCard } from '../lib/cards.js';
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

const RANGES = [
  { label: '1–20', value: '1-20' },
  { label: '1–50', value: '1-50' },
  { label: '1–100', value: '1-100' },
  { label: '100s', value: '100s' },
  { label: 'All', value: 'all' },
];

export async function numbersView(app) {
  const settings = getSettings();
  const numbers = await loadNumbers(settings.lang);

  renderSetup({
    app,
    title: 'Numbers',
    subtitle: `${numbers.numberPool('all').length} numbers · auto-graded`,
    chips: [
      {
        key: 'direction',
        label: 'Direction',
        value: settings.numbers.direction,
        options: [
          { label: '123 → ES', value: 'num-word' },
          { label: 'ES → 123', value: 'word-num' },
          { label: 'Mixed', value: 'mixed' },
        ],
      },
      { key: 'range', label: 'Range', value: settings.numbers.range, options: RANGES },
      { key: 'size', label: 'Session size', value: settings.numbers.size, options: SIZES },
    ],
    links: [{ label: 'Legend →', path: '/numbers/legend' }],
    onBack: () => navigate('/'),
    onStart: (values) => {
      updateDrillSettings('numbers', values);
      const pool = numbers.numberPool(values.range);
      startSession(
        app,
        sample(pool, values.size).map((n) => buildNumberCard(n, values, numbers)),
      );
    },
  });
}

function startSession(app, cards) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Numbers',
    autoGrade: true,
    trackHard: false,
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed),
  });
}
