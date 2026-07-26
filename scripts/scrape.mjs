import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import * as cheerio from 'cheerio';

const NOUNS_URL =
  'https://frequencylists.blogspot.com/2015/12/the-2000-most-frequently-used-spanish.html';
const VERB_INDEX_URL = 'https://ellaverbs.com/spanish-verbs/';
const VERB_LIMIT = Number(process.env.VERB_LIMIT ?? 400);
const USER_AGENT = 'LingifyScraper/1.0 (personal Spanish study project; single pass, cached)';
const DELAY_MS = 1000;
const CACHE_DIR = new URL('../.cache/', import.meta.url);
const OUT_DIR = new URL('../src/data/es/', import.meta.url);

const TENSE_KEYS = ['present', 'preterite', 'imperfect', 'future'];

const PRONOUN_PATTERNS = [
  ['yo', /^yo$/i],
  ['tu', /^(t[uú]|vos)$/i],
  ['el', /^(él|el|ella|usted)([\s/]*(él|el|ella|usted))*$/i],
  ['nosotros', /^nosotr[oa]s([\s/]*nosotr[oa]s)*$/i],
  ['vosotros', /^vosotr[oa]s([\s/]*vosotr[oa]s)*$/i],
  ['ellos', /^(ellos|ellas|ustedes)([\s/]*(ellos|ellas|ustedes))*$/i],
];

const FREQUENT_VERBS = [
  'ser', 'estar', 'haber', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar',
  'saber', 'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'creer', 'hablar',
  'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar', 'salir', 'volver', 'tomar',
  'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar', 'buscar', 'entrar',
  'trabajar', 'escribir', 'perder', 'entender', 'pedir', 'recibir', 'recordar', 'terminar', 'permitir', 'aparecer',
  'conseguir', 'comenzar', 'servir', 'sacar', 'necesitar', 'mantener', 'resultar', 'leer', 'caer', 'cambiar',
  'presentar', 'crear', 'abrir', 'considerar', 'oír', 'acabar', 'convertir', 'ganar', 'formar', 'traer',
  'partir', 'morir', 'aceptar', 'realizar', 'suponer', 'comprender', 'lograr', 'explicar', 'preguntar', 'tocar',
  'reconocer', 'estudiar', 'alcanzar', 'nacer', 'dirigir', 'correr', 'utilizar', 'pagar', 'ayudar', 'gustar',
  'jugar', 'escuchar', 'cumplir', 'ofrecer', 'descubrir', 'levantar', 'intentar', 'usar', 'decidir', 'repetir',
  'olvidar', 'comer', 'beber', 'dormir', 'comprar', 'vender', 'viajar', 'bailar', 'cantar', 'cocinar',
  'caminar', 'enseñar', 'aprender', 'responder', 'romper', 'subir', 'bajar', 'cerrar', 'andar', 'elegir',
  'reír', 'sentar', 'despertar', 'vestir', 'casar', 'bañar', 'quitar', 'echar', 'dudar', 'evitar',
  'apoyar', 'obtener', 'mover', 'notar', 'importar', 'valer', 'salvar', 'soler', 'construir', 'incluir',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cacheFile(url) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  return new URL(`${hash}.html`, CACHE_DIR);
}

const robotsByOrigin = new Map();

async function loadRobots(origin) {
  if (robotsByOrigin.has(origin)) return robotsByOrigin.get(origin);
  const rules = [];
  robotsByOrigin.set(origin, rules);
  try {
    const response = await fetch(`${origin}/robots.txt`, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) return rules;
    const text = await response.text();
    let applies = false;
    for (const raw of text.split('\n')) {
      const [rawKey, ...rest] = raw.split('#')[0].split(':');
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(':').trim();
      if (key === 'user-agent') applies = value === '*';
      else if (applies && key === 'disallow' && value) rules.push(value);
    }
  } catch {
    return rules;
  }
  return rules;
}

async function assertAllowed(url) {
  const parsed = new URL(url);
  const rules = await loadRobots(parsed.origin);
  const blocked = rules.find((rule) => parsed.pathname.startsWith(rule));
  if (blocked) throw new Error(`robots.txt disallows ${parsed.pathname} (rule: ${blocked})`);
}

async function fetchCached(url) {
  const file = cacheFile(url);
  if (existsSync(file)) return readFile(file, 'utf8');

  await assertAllowed(url);

  let delay = DELAY_MS;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
    if (response.ok) {
      const html = await response.text();
      await writeFile(file, html);
      await sleep(DELAY_MS + Math.random() * 400);
      return html;
    }
    if (response.status === 404) throw new Error(`404 ${url}`);
    if (![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`${response.status} ${url}`);
    }
    console.warn(`  ${response.status} on ${url} — retry ${attempt} in ${delay}ms`);
    await sleep(delay);
    delay *= 2;
  }
  throw new Error(`giving up on ${url}`);
}

function textLines(html) {
  const $ = cheerio.load(html);
  $('script, style, nav, footer').remove();
  $('br').replaceWith('\n');
  $('p, div, li, tr, h1, h2, h3, h4').append('\n');
  return $('body')
    .text()
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const NOUN_ENTRY = /^(\d{1,4})[.)]\s+(.+)$/;
const NOUN_GENDER =
  /^(masculine\s*(?:\/|and|or)\s*feminine|feminine\s*(?:\/|and|or)\s*masculine|masculine|feminine|both|either)\b/i;

function parseNouns(html) {
  const blob = textLines(html).join(' ').replace(/\s+/g, ' ');
  const seen = new Set();
  const nouns = [];

  for (const chunk of blob.split(/(?=\b\d{1,4}[.)]\s)/)) {
    const entry = NOUN_ENTRY.exec(chunk.trim());
    if (!entry) continue;
    const [, rank, rest] = entry;
    const parts = rest.split(/\s*[-–—]\s+|\s+[-–—]\s*/);
    const genderAt = parts.findIndex((text) => NOUN_GENDER.test(text));
    if (genderAt < 2) continue;

    const genderRaw = NOUN_GENDER.exec(parts[genderAt])[1].toLowerCase();
    const en = parts.slice(0, genderAt - 1).join(' - ').toLowerCase().trim();
    const es = parts[genderAt - 1].toLowerCase().trim();
    if (!en || !es || seen.has(es)) continue;

    seen.add(es);
    nouns.push({
      es,
      en,
      pos: 'noun',
      gender: /^masculine$/.test(genderRaw) ? 'm' : /^feminine$/.test(genderRaw) ? 'f' : 'mf',
      rank: Number(rank),
    });
  }

  return nouns;
}

function verbClass(label, infinitive) {
  if (/^irregular$/i.test(label)) return 'irregular';
  const suffix = /^regular\s+([aei]r)$/i.exec(label)?.[1] ?? infinitive.slice(-2);
  return `regular-${suffix.toLowerCase()}`;
}

function parseVerbIndex(html) {
  const $ = cheerio.load(html);
  const verbs = [];
  const seen = new Set();

  $('tr').each((_, row) => {
    const href = $(row).find('a[href*="-conjugation"]').first().attr('href') ?? '';
    const match = /(?:^|\/)([a-záéíóúüñ]+)-conjugation\/?$/i.exec(href);
    if (!match) return;

    const infinitive = match[1].toLowerCase();
    if (seen.has(infinitive) || /[aei]rse$/.test(infinitive)) return;
    seen.add(infinitive);

    const cells = $(row)
      .find('td')
      .toArray()
      .map((cell) => $(cell).text().replace(/\s+/g, ' ').trim());
    const label = cells.find((text) => /^(ir)?regular( [aei]r)?$/i.test(text)) ?? '';
    const gloss = cells.find((text) => /^to\s+\S/i.test(text));

    verbs.push({
      infinitive,
      class: verbClass(label, infinitive),
      en: gloss ? gloss.split(/[,;(]/)[0].trim().toLowerCase() : `to ${infinitive}`,
      url: new URL(href, VERB_INDEX_URL).href,
    });
  });

  return verbs;
}

function byUsefulness(verbs) {
  const priority = new Map(FREQUENT_VERBS.map((infinitive, position) => [infinitive, position]));
  return [...verbs].sort(
    (a, b) => (priority.get(a.infinitive) ?? Infinity) - (priority.get(b.infinitive) ?? Infinity),
  );
}

function matchLabel(patterns, text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  for (const [key, pattern] of patterns) if (pattern.test(clean)) return key;
  return null;
}

function parseTenseTable($, section) {
  const forms = {};
  $(section)
    .find('table')
    .first()
    .find('tbody tr')
    .each((_, row) => {
      const cells = $(row).find('td');
      const slot = matchLabel(PRONOUN_PATTERNS, cells.first().text());
      const form = cells.filter('.spanish-conjugation').first().text().replace(/\s+/g, ' ').trim();
      if (!slot || !form || form === '-') return;
      forms[slot] ??= form.toLowerCase();
    });
  return forms;
}

function parseVerbPage(html, infinitive) {
  const $ = cheerio.load(html);
  const merged = {};

  for (const tense of TENSE_KEYS) {
    const section = $(`#${tense}-indicative`).first();
    if (!section.length) continue;
    const forms = parseTenseTable($, section);
    if (Object.keys(forms).length) merged[tense] = forms;
  }

  const tenses = {};
  for (const tense of TENSE_KEYS) {
    const forms = merged[tense];
    if (!forms) throw new Error(`${infinitive}: missing ${tense}`);
    const slots = {};
    for (const slot of ['yo', 'tu', 'el', 'nosotros', 'ellos']) {
      const form = forms[slot];
      if (!form) throw new Error(`${infinitive}: missing ${tense}.${slot}`);
      slots[slot] = form;
    }
    tenses[tense] = slots;
  }

  return tenses;
}

async function readExisting(name) {
  try {
    const parsed = JSON.parse(await readFile(new URL(name, OUT_DIR), 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeBy(field, existing, incoming) {
  const merged = [...existing];
  const positions = new Map(merged.map((entry, position) => [entry[field], position]));

  for (const entry of incoming) {
    const at = positions.get(entry[field]);
    if (at === undefined) {
      positions.set(entry[field], merged.length);
      merged.push(entry);
    } else {
      merged[at] = { ...merged[at], ...entry };
    }
  }

  return merged.map((entry, position) => ({ ...entry, id: position + 1 }));
}

function validate(vocab, conjugations) {
  const problems = [];

  vocab.forEach((item, index) => {
    if (item.id !== index + 1) problems.push(`vocab[${index}] id ${item.id} not contiguous`);
    if (!item.es || !item.en) problems.push(`vocab[${index}] empty es/en`);
    if (item.pos === 'noun' && !['m', 'f', 'mf'].includes(item.gender)) {
      problems.push(`vocab[${index}] "${item.es}" bad gender ${item.gender}`);
    }
  });

  const byInfinitive = new Map(conjugations.map((entry) => [entry.infinitive, entry]));
  vocab
    .filter((item) => item.pos === 'verb')
    .forEach((item) => {
      if (!byInfinitive.has(item.es)) problems.push(`verb "${item.es}" has no conjugation entry`);
    });

  conjugations.forEach((entry, index) => {
    if (entry.id !== index + 1) problems.push(`conjugation[${index}] id not contiguous`);
    if (!entry.class) problems.push(`${entry.infinitive} missing class`);
    for (const tense of TENSE_KEYS) {
      const forms = entry.tenses[tense];
      if (!forms) {
        problems.push(`${entry.infinitive} missing ${tense}`);
        continue;
      }
      for (const slot of ['yo', 'tu', 'el', 'nosotros', 'ellos']) {
        if (!forms[slot]?.trim()) problems.push(`${entry.infinitive} ${tense}.${slot} empty`);
      }
      if ('vosotros' in forms) problems.push(`${entry.infinitive} ${tense} leaked vosotros`);
    }
  });

  if (problems.length) {
    console.error(`\nValidation failed (${problems.length} problems):`);
    problems.slice(0, 25).forEach((problem) => console.error(`  - ${problem}`));
    if (problems.length > 25) console.error(`  … ${problems.length - 25} more`);
    process.exit(1);
  }
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  console.log('Fetching noun frequency list…');
  const nouns = parseNouns(await fetchCached(NOUNS_URL));
  console.log(`  parsed ${nouns.length} nouns`);
  if (nouns.length < 500) throw new Error(`only ${nouns.length} nouns parsed — page format changed?`);

  console.log('Fetching verb index…');
  const index = parseVerbIndex(await fetchCached(VERB_INDEX_URL));
  console.log(`  found ${index.length} verbs, taking ${Math.min(VERB_LIMIT, index.length)}`);
  if (index.length < 100) throw new Error(`only ${index.length} verbs found — page format changed?`);

  const known = new Set(index.map((verb) => verb.infinitive));
  const missing = FREQUENT_VERBS.filter((infinitive) => !known.has(infinitive));
  if (missing.length) console.warn(`  not in index: ${missing.join(', ')}`);

  const conjugations = [];
  const failures = [];
  const targets = byUsefulness(index).slice(0, VERB_LIMIT);

  for (const [position, verb] of targets.entries()) {
    process.stdout.write(`  [${position + 1}/${targets.length}] ${verb.infinitive.padEnd(24)}\r`);
    try {
      const tenses = parseVerbPage(await fetchCached(verb.url), verb.infinitive);
      conjugations.push({
        id: conjugations.length + 1,
        infinitive: verb.infinitive,
        en: verb.en,
        class: verb.class,
        tenses,
      });
    } catch (error) {
      failures.push(`${verb.infinitive}: ${error.message}`);
    }
  }

  console.log(`\n  built ${conjugations.length} conjugation tables, ${failures.length} failures`);
  failures.slice(0, 10).forEach((failure) => console.warn(`  ! ${failure}`));
  if (conjugations.length < targets.length * 0.9) {
    throw new Error('too many verb pages failed to parse — aborting without writing');
  }

  const nounWords = new Set(nouns.map((noun) => noun.es));
  const verbVocab = conjugations
    .filter((entry) => !nounWords.has(entry.infinitive))
    .map((entry, position) => ({
      es: entry.infinitive,
      en: entry.en,
      pos: 'verb',
      gender: null,
      rank: position + 1,
    }));

  const [oldVocab, oldConjugations] = await Promise.all([
    readExisting('vocab.json'),
    readExisting('conjugations.json'),
  ]);

  const vocab = mergeBy('es', oldVocab, [...nouns, ...verbVocab]);
  const merged = mergeBy('infinitive', oldConjugations, conjugations);

  validate(vocab, merged);

  await writeFile(new URL('vocab.json', OUT_DIR), `${JSON.stringify(vocab, null, 1)}\n`);
  await writeFile(new URL('conjugations.json', OUT_DIR), `${JSON.stringify(merged, null, 1)}\n`);

  console.log(
    `\nWrote ${vocab.length} vocab entries (+${vocab.length - oldVocab.length}) and ` +
      `${merged.length} conjugation tables (+${merged.length - oldConjugations.length}).`,
  );
}

main().catch((error) => {
  console.error(`\nScrape aborted: ${error.message}`);
  process.exit(1);
});
