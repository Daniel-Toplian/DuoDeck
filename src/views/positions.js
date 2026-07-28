import { loadPositions } from '../data/index.js';
import { buildPositionCard } from '../lib/cards.js';
import { createSession, shuffle } from '../lib/deck.js';
import { navigate } from '../router.js';
import { getSettings, updateDrillSettings } from '../state.js';
import { renderSetup } from './setup.js';
import { runSession } from './session.js';

export async function positionsView(app) {
  const settings = getSettings();
  const { positions } = await loadPositions(settings.lang);

  renderSetup({
    app,
    title: 'Positions · Posiciones',
    subtitle: `${positions.length} positions · multiple choice · auto-graded`,
    chips: [
      {
        key: 'direction',
        label: 'Direction',
        value: settings.positions.direction,
        options: [
          { label: '🖼 → ES', value: 'pic-word' },
          { label: 'ES → 🖼', value: 'word-pic' },
          { label: 'Mixed', value: 'mixed' },
        ],
      },
      {
        key: 'answerMode',
        label: 'Answer mode',
        value: settings.positions.answerMode,
        options: [
          { label: 'Multiple choice', value: 'choice' },
          { label: 'Type (🖼 → ES)', value: 'type' },
        ],
      },
    ],
    links: [{ label: 'Legend →', path: '/positions/legend' }],
    onBack: () => navigate('/'),
    onStart: (values) => {
      updateDrillSettings('positions', values);
      startSession(
        app,
        shuffle(positions).map((item) => buildPositionCard(item, values, positions)),
      );
    },
  });
}

function startSession(app, cards) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Positions · Posiciones',
    autoGrade: true,
    trackHard: false,
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed),
  });
}
