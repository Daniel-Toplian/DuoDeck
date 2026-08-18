import './styles/tokens.css';
import './styles/app.css';
import { languages } from './data/languages.js';
import { render, route, setFallback, startRouter } from './router.js';
import { getSettings, updateSettings } from './state.js';
import { calendarView } from './views/calendar.js';
import { calendarLegendView } from './views/calendarLegend.js';
import { colorsView } from './views/colors.js';
import { colorsLegendView } from './views/colorsLegend.js';
import { conjugationView } from './views/conjugation.js';
import { conjugationLegendView } from './views/conjugationLegend.js';
import { flashcardsView } from './views/flashcards.js';
import { hardView } from './views/hard.js';
import { homeView } from './views/home.js';
import { numbersView } from './views/numbers.js';
import { wordsView } from './views/words.js';
import { numbersLegendView } from './views/numbersLegend.js';
import { positionsView } from './views/positions.js';
import { positionsLegendView } from './views/positionsLegend.js';

const app = document.querySelector('#app');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function withLoading(view) {
  return async () => {
    app.innerHTML = '<section class="panel loading">Loading…</section>';
    try {
      await view(app);
    } catch (error) {
      app.innerHTML = `<section class="panel error-panel">
        <h1>Couldn't load the data</h1>
        <p class="muted">${error.message}</p>
        <a class="btn" href="#/">Home</a>
      </section>`;
    }
  };
}

function setupShell() {
  const settings = getSettings();
  applyTheme(settings.theme);

  const select = document.querySelector('#lang-select');
  select.innerHTML = languages
    .map((lang) => `<option value="${lang.code}">${lang.flag} ${lang.name}</option>`)
    .join('');
  select.value = settings.lang;
  select.disabled = languages.length < 2;
  select.addEventListener('change', () => {
    updateSettings({ lang: select.value });
    render();
  });

  document.querySelector('#theme-btn').addEventListener('click', () => {
    const next = getSettings().theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
    applyTheme(next);
  });

  const dialog = document.querySelector('#help-dialog');
  document.querySelector('#help-btn').addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
}

route('/', () => homeView(app));
route('/flashcards', withLoading(flashcardsView));
route('/flashcards/legend', withLoading(wordsView));
route('/conjugation', withLoading(conjugationView));
route('/conjugation/legend', withLoading(conjugationLegendView));
route('/numbers', withLoading(numbersView));
route('/numbers/legend', withLoading(numbersLegendView));
route('/colors', withLoading(colorsView));
route('/colors/legend', withLoading(colorsLegendView));
route('/positions', withLoading(positionsView));
route('/positions/legend', withLoading(positionsLegendView));
route('/calendar', withLoading(calendarView));
route('/calendar/legend', withLoading(calendarLegendView));
route('/hard', withLoading(hardView));
setFallback(() => homeView(app));

setupShell();
startRouter();
