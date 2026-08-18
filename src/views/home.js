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
          <span class="tile-title">Flashcards <span class="tile-es">Tarjetas</span></span>
          <span class="tile-sub">Vocabulary, both directions</span>
        </button>
        <button class="tile" data-go="/conjugation">
          <span class="tile-icon">🔀</span>
          <span class="tile-title">Conjugation <span class="tile-es">Conjugación</span></span>
          <span class="tile-sub">Verbs by pronoun and tense</span>
        </button>
        <button class="tile" data-go="/numbers">
          <span class="tile-icon">🔢</span>
          <span class="tile-title">Numbers <span class="tile-es">Números</span></span>
          <span class="tile-sub">1–100 and hundreds</span>
        </button>
        <button class="tile" data-go="/colors">
          <span class="tile-icon">🎨</span>
          <span class="tile-title">Colors <span class="tile-es">Colores</span></span>
          <span class="tile-sub">The 11 core colours</span>
        </button>
        <button class="tile" data-go="/positions">
          <span class="tile-icon">📦</span>
          <span class="tile-title">Positions <span class="tile-es">Posiciones</span></span>
          <span class="tile-sub">Prepositions of place</span>
        </button>
        <button class="tile" data-go="/calendar">
          <span class="tile-icon">📅</span>
          <span class="tile-title">Calendar <span class="tile-es">Calendario</span></span>
          <span class="tile-sub">Days of the week and months</span>
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
