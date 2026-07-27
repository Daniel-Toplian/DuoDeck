import { loadNumbers } from '../data/index.js';
import { escapeHtml } from '../lib/text.js';
import { navigate } from '../router.js';
import { getSettings } from '../state.js';

function buildBands({ numberToWords, HUNDRED_STEPS }) {
  const bands = [];
  for (let low = 1; low <= 91; low += 10) {
    const high = low + 9;
    bands.push({
      label: `${low}–${high}`,
      entries: Array.from({ length: 10 }, (_, i) => low + i).map((n) => ({
        n,
        word: numberToWords(n),
      })),
    });
  }
  bands.push({
    label: '100s',
    entries: HUNDRED_STEPS.map((n) => ({ n, word: numberToWords(n) })),
  });
  return bands;
}

function bandMarkup(band) {
  return `
    <div class="legend-band">
      <h2>${escapeHtml(band.label)}</h2>
      <div class="legend-grid">
        ${band.entries
          .map(
            ({ n, word }) => `<div class="legend-cell">
              <span class="legend-digit">${n}</span>
              <span class="legend-word">${escapeHtml(word)}</span>
            </div>`,
          )
          .join('')}
      </div>
    </div>`;
}

export async function numbersLegendView(app) {
  const settings = getSettings();
  const numbers = await loadNumbers(settings.lang);
  const bands = buildBands(numbers);

  app.innerHTML = `
    <section class="panel legend">
      <button class="ghost back" data-act="back">← Numbers</button>
      <h1>Numbers legend</h1>
      <p class="muted">1–100 and the round hundreds up to 1000</p>
      ${bands.map(bandMarkup).join('')}
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/numbers'));
}
