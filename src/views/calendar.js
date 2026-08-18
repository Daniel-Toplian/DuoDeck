import { loadCalendar } from '../data/index.js';
import { buildCalendarCard } from '../lib/cards.js';
import { createSession, shuffle } from '../lib/deck.js';
import { navigate } from '../router.js';
import { getSettings, updateDrillSettings } from '../state.js';
import { renderSetup } from './setup.js';
import { runSession } from './session.js';

function filterItems(items, scope) {
  if (scope === 'days') return items.filter((item) => item.kind === 'day');
  if (scope === 'months') return items.filter((item) => item.kind === 'month');
  return items;
}

export async function calendarView(app) {
  const settings = getSettings();
  const calendar = await loadCalendar(settings.lang);

  renderSetup({
    app,
    title: 'Calendar · Calendario',
    subtitle: '7 days · 12 months · auto-graded',
    chips: [
      {
        key: 'scope',
        label: 'Scope',
        value: settings.calendar.scope,
        options: [
          { label: 'Days', value: 'days' },
          { label: 'Months', value: 'months' },
          { label: 'Both', value: 'both' },
        ],
      },
      {
        key: 'mode',
        label: 'Card type',
        value: settings.calendar.mode,
        options: [
          { label: 'Translate', value: 'translate' },
          { label: 'Order (mes 3, next day)', value: 'order' },
          { label: 'Mixed', value: 'mixed' },
        ],
      },
      {
        key: 'direction',
        label: 'Direction (translate)',
        value: settings.calendar.direction,
        options: [
          { label: 'ES → EN', value: 'es-en' },
          { label: 'EN → ES', value: 'en-es' },
          { label: 'Mixed', value: 'mixed' },
        ],
      },
    ],
    links: [{ label: 'Legend →', path: '/calendar/legend' }],
    onBack: () => navigate('/'),
    onStart: (values) => {
      updateDrillSettings('calendar', values);
      const pool = filterItems(calendar, values.scope);
      startSession(
        app,
        shuffle(pool).map((item) => buildCalendarCard(item, values, calendar)),
      );
    },
  });
}

function startSession(app, cards) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Calendar · Calendario',
    autoGrade: true,
    trackHard: false,
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed),
  });
}
