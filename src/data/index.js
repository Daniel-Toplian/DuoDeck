const vocabLoaders = import.meta.glob('./*/vocab.json');
const conjugationLoaders = import.meta.glob('./*/conjugations.json');

const cache = new Map();

async function load(loaders, lang, kind) {
  const key = `${kind}:${lang}`;
  if (cache.has(key)) return cache.get(key);
  const loader = loaders[`./${lang}/${kind}.json`];
  if (!loader) throw new Error(`No ${kind} data for language "${lang}"`);
  const data = (await loader()).default;
  cache.set(key, data);
  return data;
}

export function loadVocab(lang) {
  return load(vocabLoaders, lang, 'vocab');
}

export function loadConjugations(lang) {
  return load(conjugationLoaders, lang, 'conjugations');
}
