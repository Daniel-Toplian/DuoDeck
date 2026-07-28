import { loadColors } from '../data/index.js';
import { buildColorCard } from '../lib/cards.js';
import { createSession, shuffle } from '../lib/deck.js';
import { navigate } from '../router.js';
import { getSettings, updateDrillSettings } from '../state.js';
import { renderSetup } from './setup.js';
import { runSession } from './session.js';

export async function colorsView(app) {
  const settings = getSettings();
  const colors = await loadColors(settings.lang);

  renderSetup({
    app,
    title: 'Colors',
    subtitle: `${colors.length} colours · auto-graded`,
    chips: [
      {
        key: 'direction',
        label: 'Direction',
        value: settings.colors.direction,
        options: [
          { label: '🎨 → ES', value: 'swatch-es' },
          { label: 'ES → EN', value: 'es-en' },
          { label: 'Mixed', value: 'mixed' },
        ],
      },
    ],
    links: [{ label: 'Legend →', path: '/colors/legend' }],
    onBack: () => navigate('/'),
    onStart: (values) => {
      updateDrillSettings('colors', values);
      startSession(
        app,
        shuffle(colors).map((item) => buildColorCard(item, values)),
      );
    },
  });
}

function startSession(app, cards) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Colors',
    autoGrade: true,
    trackHard: false,
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed),
  });
}
