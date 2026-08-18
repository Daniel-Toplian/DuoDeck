import { loadVocab } from '../data/index.js';
import { bindSay, sayButton } from '../lib/speak.js';
import { escapeHtml, normalize } from '../lib/text.js';
import { navigate } from '../router.js';
import { getSettings } from '../state.js';

const ARTICLE = { m: 'el', f: 'la', mf: 'el / la' };

function rowMarkup(item) {
  const article = item.pos === 'noun' ? ARTICLE[item.gender] : null;
  const spanish = article ? `${article} ${item.es}` : item.es;
  return `
    <div class="legend-cell colour-cell">
      <div class="colour-text">
        <span class="legend-word">${escapeHtml(spanish)}</span>
        <span class="colour-en">${escapeHtml(item.en)}</span>
      </div>
      ${sayButton(item.es)}
      <span class="colour-agreement">${item.pos === 'noun' ? 'noun' : 'verb'}</span>
    </div>`;
}

export async function wordsView(app) {
  const settings = getSettings();
  const vocab = await loadVocab(settings.lang);
  const state = { query: '', pos: 'all' };

  function matches(item) {
    if (state.pos !== 'all' && item.pos !== state.pos) return false;
    if (!state.query) return true;
    return normalize(item.es).includes(state.query) || normalize(item.en).includes(state.query);
  }

  function listMarkup() {
    const filtered = vocab.filter(matches);
    if (!filtered.length) return '<p class="muted">No words match.</p>';
    return `
      <p class="muted">${filtered.length} of ${vocab.length} words</p>
      <div class="legend-grid colour-grid">
        ${filtered.map(rowMarkup).join('')}
      </div>`;
  }

  function renderList() {
    app.querySelector('#word-list').innerHTML = listMarkup();
    bindSay(app.querySelector('#word-list'));
  }

  app.innerHTML = `
    <section class="panel legend">
      <button class="ghost back" data-act="back">← Flashcards</button>
      <h1>Word list · Palabras</h1>
      <div class="word-controls">
        <input id="word-search" type="search" placeholder="search español or English…"
               autocomplete="off" spellcheck="false" />
        <div class="chips">
          ${['all', 'noun', 'verb']
            .map(
              (pos) => `<button class="chip ${state.pos === pos ? 'on' : ''}" data-pos="${pos}">
                ${pos === 'all' ? 'All' : pos === 'noun' ? 'Nouns' : 'Verbs'}</button>`,
            )
            .join('')}
        </div>
      </div>
      <div id="word-list"></div>
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/flashcards'));
  app.querySelector('#word-search').addEventListener('input', (event) => {
    state.query = normalize(event.target.value);
    renderList();
  });
  app.querySelectorAll('[data-pos]').forEach((el) => {
    el.addEventListener('click', () => {
      state.pos = el.dataset.pos;
      app.querySelectorAll('[data-pos]').forEach((b) => b.classList.toggle('on', b === el));
      renderList();
    });
  });
  renderList();
}
