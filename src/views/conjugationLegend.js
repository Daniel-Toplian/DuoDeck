import { loadEndings } from '../data/index.js';
import { PRONOUN_LABEL, PRONOUN_SLOTS } from '../lib/hint.js';
import { escapeHtml } from '../lib/text.js';
import { navigate } from '../router.js';
import { getSettings } from '../state.js';

function tableMarkup(block, examples) {
  return `
    <div class="legend-band">
      <h2>${escapeHtml(block.tense)}</h2>
      ${block.note ? `<p class="muted">${escapeHtml(block.note)}</p>` : ''}
      <div class="table-wrap">
        <table class="endings-table">
          <thead>
            <tr>
              <th></th>
              <th>-AR <em>${escapeHtml(examples.ar)}</em></th>
              <th>-ER <em>${escapeHtml(examples.er)}</em></th>
              <th>-IR <em>${escapeHtml(examples.ir)}</em></th>
            </tr>
          </thead>
          <tbody>
            ${PRONOUN_SLOTS.map(
              (slot, i) => `<tr>
                <th>${escapeHtml(PRONOUN_LABEL[slot])}</th>
                <td>${escapeHtml(block.ar[i])}</td>
                <td>${escapeHtml(block.er[i])}</td>
                <td>${escapeHtml(block.ir[i])}</td>
              </tr>`,
            ).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function gerundMarkup(block) {
  return `
    <div class="legend-band">
      <h2>${escapeHtml(block.tense)}</h2>
      <p class="muted">${escapeHtml(block.note)}</p>
      <div class="table-wrap">
        <table class="endings-table">
          <thead>
            <tr><th>-AR</th><th>-ER</th><th>-IR</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(block.ar)}</td>
              <td>${escapeHtml(block.er)}</td>
              <td>${escapeHtml(block.ir)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

export async function conjugationLegendView(app) {
  const settings = getSettings();
  const { ENDINGS, GERUND_ENDING, EXAMPLE_VERBS } = await loadEndings(settings.lang);

  app.innerHTML = `
    <section class="panel legend">
      <button class="ghost back" data-act="back">← Conjugation</button>
      <h1>Regular endings · Terminaciones</h1>
      <p class="muted">Drop -ar / -er / -ir from the infinitive, add the ending. No vosotros.</p>
      ${ENDINGS.map((block) => tableMarkup(block, EXAMPLE_VERBS)).join('')}
      ${gerundMarkup(GERUND_ENDING)}
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/conjugation'));
}
