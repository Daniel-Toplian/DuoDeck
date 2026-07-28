import { loadColors } from '../data/index.js';
import { bindSay, sayButton } from '../lib/speak.js';
import { swatchMarkup } from '../lib/swatch.js';
import { escapeHtml } from '../lib/text.js';
import { navigate } from '../router.js';
import { getSettings } from '../state.js';

function cellMarkup(item) {
  return `
    <div class="legend-cell colour-cell">
      ${swatchMarkup(item.hex, 'swatch-sm')}
      <div class="colour-text">
        <span class="legend-word">${escapeHtml(item.es)}</span>
        <span class="colour-en">${escapeHtml(item.en)}</span>
      </div>
      ${sayButton(item.es)}
      <span class="colour-agreement">${escapeHtml(item.agreement)}</span>
    </div>`;
}

export async function colorsLegendView(app) {
  const settings = getSettings();
  const colors = await loadColors(settings.lang);

  app.innerHTML = `
    <section class="panel legend">
      <button class="ghost back" data-act="back">← Colors</button>
      <h1>Colours legend · Colores</h1>
      <p class="muted">The ${colors.length} core colours · masculine singular</p>
      <div class="legend-grid colour-grid">
        ${colors.map(cellMarkup).join('')}
      </div>
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/colors'));
  bindSay(app);
}
