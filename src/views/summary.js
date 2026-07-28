import { sceneMarkup } from '../lib/scenes.js';
import { swatchMarkup } from '../lib/swatch.js';
import { escapeHtml } from '../lib/text.js';

export function renderSummary({ app, session, title, onExit, onPractiseMissed }) {
  const missed = session.missed;
  const accuracy = session.right + session.wrong
    ? Math.round((session.right / (session.right + session.wrong)) * 100)
    : 0;

  app.innerHTML = `
    <section class="panel summary">
      <h1>${escapeHtml(title)} — done</h1>
      <div class="score">
        <div><strong>${session.right}</strong><span>right</span></div>
        <div><strong>${session.wrong}</strong><span>wrong</span></div>
        <div><strong>${accuracy}%</strong><span>accuracy</span></div>
      </div>
      ${missed.length
        ? `<h2>Missed (${missed.length})</h2>
           <ul class="missed">
             ${missed
               .map(
                 (card) => `<li>
                   <span class="missed-prompt">${
                     card.prompt
                       ? escapeHtml(card.prompt)
                       : swatchMarkup(card.promptSwatch, 'swatch-sm') ||
                         sceneMarkup(card.promptScene, { size: 'sm' })
                   }${card.tag ? ` <em>${escapeHtml(card.tag)}</em>` : ''}</span>
                   <span class="missed-answer">${escapeHtml(card.answer)}</span>
                   ${session.hinted.has(card.key) ? '<span class="pill">hinted</span>' : ''}
                 </li>`,
               )
               .join('')}
           </ul>`
        : '<p class="all-clear">Nothing missed. 🎉</p>'}
      <div class="actions-row">
        ${missed.length ? '<button class="btn primary" data-act="practise">Practise missed</button>' : ''}
        <button class="btn" data-act="home">Home</button>
      </div>
    </section>`;

  app.querySelector('[data-act="practise"]')?.addEventListener('click', () => onPractiseMissed(missed));
  app.querySelector('[data-act="home"]')?.addEventListener('click', onExit);
}
