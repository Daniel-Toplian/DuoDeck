import { loadCalendar } from '../data/index.js';
import { bindSay, sayButton } from '../lib/speak.js';
import { escapeHtml } from '../lib/text.js';
import { navigate } from '../router.js';
import { getSettings } from '../state.js';

function cellMarkup(item) {
  return `
    <div class="legend-cell colour-cell">
      <span class="legend-digit">${item.order}</span>
      <div class="colour-text">
        <span class="legend-word">${escapeHtml(item.es)}</span>
        <span class="colour-en">${escapeHtml(item.en)}</span>
      </div>
      ${sayButton(item.es)}
    </div>`;
}

function bandMarkup(label, items) {
  return `
    <div class="legend-band">
      <h2>${escapeHtml(label)}</h2>
      <div class="legend-grid colour-grid">
        ${items.map(cellMarkup).join('')}
      </div>
    </div>`;
}

export async function calendarLegendView(app) {
  const settings = getSettings();
  const calendar = await loadCalendar(settings.lang);
  const days = calendar.filter((item) => item.kind === 'day');
  const months = calendar.filter((item) => item.kind === 'month');

  app.innerHTML = `
    <section class="panel legend">
      <button class="ghost back" data-act="back">← Calendar</button>
      <h1>Calendar legend · Calendario</h1>
      <p class="muted">Days of the week and months of the year · lowercase in Spanish</p>
      ${bandMarkup('Días de la semana', days)}
      ${bandMarkup('Meses del año', months)}
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/calendar'));
  bindSay(app);
}
