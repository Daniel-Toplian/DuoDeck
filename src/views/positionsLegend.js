import { loadPositions } from '../data/index.js';
import { sceneMarkup } from '../lib/scenes.js';
import { bindSay, sayButton } from '../lib/speak.js';
import { escapeHtml } from '../lib/text.js';
import { navigate } from '../router.js';
import { getSettings } from '../state.js';

function cellMarkup(item) {
  return `
    <div class="legend-cell colour-cell">
      ${sceneMarkup(item.scene, { size: 'sm' })}
      <div class="colour-text">
        <span class="legend-word">${escapeHtml(item.es)}</span>
        <span class="colour-en">${escapeHtml(item.en)}</span>
      </div>
      ${sayButton(item.es)}
    </div>`;
}

export async function positionsLegendView(app) {
  const settings = getSettings();
  const { positions } = await loadPositions(settings.lang);

  app.innerHTML = `
    <section class="panel legend">
      <button class="ghost back" data-act="back">← Positions</button>
      <h1>Positions legend · Posiciones</h1>
      <p class="muted">The ${positions.length} prepositions of place · apple and box</p>
      <div class="legend-grid colour-grid">
        ${positions.map(cellMarkup).join('')}
      </div>
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/positions'));
  bindSay(app);
}
