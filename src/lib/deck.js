const WRONG_REINSERT_OFFSET = 4;
const MAX_WRONG_PER_CARD = 3;

export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample(items, size) {
  return shuffle(items).slice(0, Math.min(size, items.length));
}

export function createSession(cards) {
  const queue = [...cards];
  const total = cards.length;
  const missed = new Map();
  const hinted = new Set();
  const wrongCounts = new Map();
  let right = 0;
  let wrong = 0;
  let done = 0;

  const api = {
    get total() {
      return total;
    },
    get done() {
      return done;
    },
    get right() {
      return right;
    },
    get wrong() {
      return wrong;
    },
    get finished() {
      return queue.length === 0;
    },
    get missed() {
      return [...missed.values()];
    },
    get hinted() {
      return hinted;
    },
    current() {
      return queue[0] ?? null;
    },
    markHinted(card) {
      hinted.add(card.key);
    },
    grade(correct) {
      const card = queue.shift();
      if (!card) return;
      if (correct) {
        right += 1;
        done += 1;
        missed.delete(card.key);
        return;
      }
      wrong += 1;
      missed.set(card.key, card);
      const count = (wrongCounts.get(card.key) ?? 0) + 1;
      wrongCounts.set(card.key, count);
      if (count >= MAX_WRONG_PER_CARD) {
        done += 1;
        return;
      }
      queue.splice(Math.min(WRONG_REINSERT_OFFSET, queue.length), 0, card);
    },
    later() {
      const card = queue.shift();
      if (card) queue.push(card);
      return queue[0] ?? null;
    },
  };

  return api;
}
