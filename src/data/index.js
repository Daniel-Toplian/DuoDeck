const vocabLoaders = import.meta.glob('./*/vocab.json');
const conjugationLoaders = import.meta.glob('./*/conjugations.json');
const numberLoaders = import.meta.glob('./*/numbers.js');
const colorLoaders = import.meta.glob('./*/colors.json');
const positionLoaders = import.meta.glob('./*/positions.js');

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

export function loadColors(lang) {
  return load(colorLoaders, lang, 'colors');
}

async function loadModule(loaders, lang, kind) {
  const key = `${kind}:${lang}`;
  if (cache.has(key)) return cache.get(key);
  const loader = loaders[`./${lang}/${kind}.js`];
  if (!loader) throw new Error(`No ${kind} data for language "${lang}"`);
  const module = await loader();
  cache.set(key, module);
  return module;
}

export function loadNumbers(lang) {
  return loadModule(numberLoaders, lang, 'numbers');
}

export function loadPositions(lang) {
  return loadModule(positionLoaders, lang, 'positions');
}
