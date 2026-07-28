import { loadConjugations, loadVocab } from '../data/index.js';
import { buildConjugationCard, buildVocabCard } from '../lib/cards.js';
import { createSession, shuffle } from '../lib/deck.js';
import { navigate } from '../router.js';
import { getSettings, hardKeys, removeHard } from '../state.js';
import { bindSay, sayButton } from '../lib/speak.js';
import { escapeHtml } from '../lib/text.js';
import { runSession } from './session.js';

async function resolveCards() {
  const settings = getSettings();
  const keys = hardKeys();
  const needsVocab = keys.some((key) => key.startsWith('v:'));
  const needsVerbs = keys.some((key) => key.startsWith('c:'));

  const vocab = needsVocab ? await loadVocab(settings.lang) : [];
  const entries = needsVerbs ? await loadConjugations(settings.lang) : [];
  const byWord = new Map(vocab.map((item) => [item.es, item]));
  const byInfinitive = new Map(entries.map((entry) => [entry.infinitive, entry]));

  return keys
    .map((key) => {
      const value = key.slice(2);
      if (key.startsWith('v:')) {
        const item = byWord.get(value);
        return item ? buildVocabCard(item, settings.flashcards) : null;
      }
      const entry = byInfinitive.get(value);
      return entry ? buildConjugationCard(entry, settings.conjugation) : null;
    })
    .filter(Boolean);
}

export async function hardView(app) {
  const cards = await resolveCards();

  if (!cards.length) {
    app.innerHTML = `
      <section class="panel">
        <button class="ghost back" data-act="back">← Home</button>
        <h1>Challenging</h1>
        <p class="muted">Nothing here yet. Cards you grade wrong (or star with ★) land in this list.</p>
      </section>`;
    app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/'));
    return;
  }

  app.innerHTML = `
    <section class="panel">
      <button class="ghost back" data-act="back">← Home</button>
      <h1>Challenging (${cards.length})</h1>
      <p class="muted">Items leave this list after two correct answers in a row.</p>
      <button class="btn primary big" data-act="practise">Practise these</button>
      <ul class="hard-list">
        ${cards
          .map(
            (card) => `<li>
              <span>${escapeHtml(card.key.slice(2))}<em>${card.kind === 'vocab' ? 'word' : 'verb'}</em>${sayButton(card.key.slice(2))}</span>
              <button class="ghost" data-remove="${escapeHtml(card.key)}" aria-label="Remove">✕</button>
            </li>`,
          )
          .join('')}
      </ul>
    </section>`;

  app.querySelector('[data-act="back"]').addEventListener('click', () => navigate('/'));
  app.querySelector('[data-act="practise"]').addEventListener('click', () => {
    startSession(app, shuffle(cards));
  });
  app.querySelectorAll('[data-remove]').forEach((el) => {
    el.addEventListener('click', () => {
      removeHard(el.dataset.remove);
      hardView(app);
    });
  });
  bindSay(app);
}

function startSession(app, cards) {
  runSession({
    app,
    session: createSession(cards),
    title: 'Challenging',
    onExit: () => navigate('/'),
    onPractiseMissed: (missed) => startSession(app, missed),
  });
}
