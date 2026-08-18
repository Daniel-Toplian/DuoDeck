import { defaultLanguage } from './data/languages.js';

const KEY = 'DuoDeck.v1';
const CLEAR_HARD_AFTER = 2;

const DEFAULTS = {
  theme: 'dark',
  lang: defaultLanguage,
  flashcards: { direction: 'mixed', size: 20, freq: 'all', pos: 'both' },
  conjugation: { tense: 'present', verbs: 'all', size: 20, freq: 'all' },
  numbers: { direction: 'mixed', range: '1-100', size: 20 },
  colors: { direction: 'mixed' },
  positions: { direction: 'mixed', answerMode: 'choice' },
  calendar: { scope: 'both', mode: 'mixed', direction: 'mixed' },
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { settings: structuredClone(DEFAULTS), hard: {} };
    const parsed = JSON.parse(raw);
    return {
      settings: {
        ...structuredClone(DEFAULTS),
        ...parsed.settings,
        flashcards: { ...DEFAULTS.flashcards, ...parsed.settings?.flashcards },
        conjugation: { ...DEFAULTS.conjugation, ...parsed.settings?.conjugation },
        numbers: { ...DEFAULTS.numbers, ...parsed.settings?.numbers },
        colors: { ...DEFAULTS.colors, ...parsed.settings?.colors },
        positions: { ...DEFAULTS.positions, ...parsed.settings?.positions },
        calendar: { ...DEFAULTS.calendar, ...parsed.settings?.calendar },
      },
      hard: parsed.hard ?? {},
    };
  } catch {
    return { settings: structuredClone(DEFAULTS), hard: {} };
  }
}

const store = read();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

export function getSettings() {
  return store.settings;
}

export function updateSettings(patch) {
  store.settings = { ...store.settings, ...patch };
  persist();
  return store.settings;
}

export function updateDrillSettings(drill, patch) {
  store.settings[drill] = { ...store.settings[drill], ...patch };
  persist();
  return store.settings[drill];
}

export function hardKeys() {
  return Object.keys(store.hard);
}

export function hardCount() {
  return hardKeys().length;
}

export function isHard(key) {
  return Boolean(store.hard[key]);
}

export function markHard(key) {
  store.hard[key] = { streak: 0 };
  persist();
}

export function removeHard(key) {
  delete store.hard[key];
  persist();
}

export function recordResult(key, correct) {
  if (!correct) {
    store.hard[key] = { streak: 0 };
    persist();
    return;
  }
  const entry = store.hard[key];
  if (!entry) return;
  entry.streak += 1;
  if (entry.streak >= CLEAR_HARD_AFTER) delete store.hard[key];
  persist();
}
