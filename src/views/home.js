import { navigate } from '../router.js';
import { hardCount } from '../state.js';

export function homeView(app) {
  const hard = hardCount();

  app.innerHTML = `
    <section class="home">
      <h1 class="hero">Aprende <span>español</span></h1>
      <div class="tiles">
        <button class="tile" data-go="/flashcards">
          <span class="tile-icon">🗂</span>
          <span class="tile-title">Flashcards</span>
          <span class="tile-sub">Vocabulary, both directions</span>
        </button>
        <button class="tile" data-go="/conjugation">
          <span class="tile-icon">🔀</span>
          <span class="tile-title">Conjugation</span>
          <span class="tile-sub">Verbs by pronoun and tense</span>
        </button>
      </div>
      <button class="challenging ${hard ? '' : 'empty'}" data-go="/hard">
        Challenging <strong>${hard}</strong> ${hard ? '→ practise' : ''}
      </button>
    </section>`;

  app.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
}
