# DuoDeck

Personal Spanish practice app. Single static site — no backend, no runtime API calls. Vite + vanilla
JS + hand-written CSS.

Four drills:

- **Flashcards** — vocabulary in both directions (ES→EN and EN→ES, or mixed). EN→ES can be typed.
- **Conjugation** — a verb, a tense and one pronoun slot; type the form.
- **Numbers** — 1–100 plus the round hundreds to 1000, digits→Spanish or Spanish→digits, or mixed.
- **Colors** — the 11 core colours, swatch→Spanish or Spanish→English, or mixed.

Two grading models, because the two kinds of drill differ:

- Flashcards and Conjugation are **self-graded** — the app never decides whether you were right.
  Typed answers are shown next to the correct form so you can judge for yourself.
- Numbers and Colors are **auto-graded** — the answer set is closed and unambiguous, so the app
  computes a verdict on reveal. Matching is lenient (case, accents and spacing) and nags about a
  missing accent rather than failing you. `Wrong`/`Right` remain available to override the verdict.

Auto-graded drills are deliberately excluded from the **Challenging** list; it tracks vocabulary
and verbs only.

Both legends (`Numbers`, `Colors`) are browsable reference tables, reachable from their setup screen.

## Running

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # -> dist/
npm run preview      # serve the production build
npm run scrape       # regenerate src/data/es/*.json (see below)
```

## Data

`src/data/es/vocab.json` — one flat array, `id === index + 1`:

```json
{ "id": 1, "es": "tiempo", "en": "time", "pos": "noun", "gender": "m", "rank": 1 }
{ "id": 2001, "es": "comer", "en": "to eat", "pos": "verb", "gender": null, "rank": 1 }
```

`src/data/es/conjugations.json` — self-contained, joined to vocab on the infinitive string:

```json
{ "id": 1, "infinitive": "comer", "en": "to eat", "class": "regular-er",
  "tenses": { "present": { "yo": "como", "tu": "comes", "el": "come",
                           "nosotros": "comemos", "ellos": "comen" }, "...": {} } }
```

Four indicative tenses: `present`, `preterite`, `imperfect`, `future`. Five pronoun slots: `yo`,
`tu`, `el` (él/ella/usted), `nosotros`, `ellos` (ellos/ellas/ustedes). No `vosotros`.

`src/data/es/colors.json` — the 11 core colours, base (masculine singular) form only:

```json
{ "id": 8, "es": "gris", "en": "grey", "hex": "#8a8f98", "accept": ["gray"],
  "agreement": "invariable" }
```

`accept` lists extra English spellings the grader treats as correct (`gray`, `violet`, `rose`) —
Spanish always has a single canonical form. `agreement` is `-o/-a` or `invariable`, shown as the
first hint and next to the answer.

`src/data/es/numbers.js` — not a data file. Spanish number words are algorithmic, so this module
exports `numberToWords(n)`, `numberPool(rangeKey)` and `numberBand(n)` instead of 109 hand-typed
strings. Irregular forms (`dieciséis`, `veintidós`, `quinientos`, `setecientos`) come from lookup
tables rather than being composed.

Adding a language: create `src/data/<code>/{vocab,conjugations,colors}.json` plus
`src/data/<code>/numbers.js`, and add one entry to `src/data/languages.js`. Each language is loaded
lazily as its own chunk.

### Regenerating the data

```sh
npm run scrape                 # default: 400 verbs
VERB_LIMIT=50 npm run scrape   # fewer verbs (faster)
```

`npm run scrape` fetches from the two sources below, validates the result, and refuses to write
anything if a check fails (missing forms, non-contiguous ids, `vosotros` leakage, a verb with no
conjugation table). Set `VERB_LIMIT` to change how many verbs are fetched (default 400).

The verb index is ordered alphabetically at the source, so the scraper reorders it against a
frequency list (`FREQUENT_VERBS` in `scripts/scrape.mjs`) before applying `VERB_LIMIT` — otherwise
"top 400" would just mean "A through L". Conjugation ids follow that order, which is what the
drill's `Top 50 / 100 / 200` filter reads.

The scraper is deliberately slow and cache-first: one request at a time, ~1/sec, real User-Agent,
respects `robots.txt`, and stores raw HTML in `.cache/` (gitignored) so re-runs make zero requests.

## Data sources

Vocabulary and conjugation data are derived from:

- [The 2000 most frequently used Spanish nouns](https://frequencylists.blogspot.com/2015/12/the-2000-most-frequently-used-spanish.html) — frequencylists.blogspot.com
- [Spanish verb conjugations](https://ellaverbs.com/spanish-verbs/) — Ella Verbs

All credit for the underlying data belongs to them. This repo is private and for personal study
only; the data is not redistributed.

## Progress

`localStorage` holds only your settings and your **Challenging** list. No lifetime stats, no
accounts. An item joins the list when you grade it wrong or star it (★), and leaves after two
correct answers in a row.

## Shortcuts

`Space`/`Enter` reveal or submit · `→`/`2` right · `←`/`1` wrong · `H` hint (twice for letters) ·
`L` repeat later · `R` repeat now · `M` mark challenging · `Esc` end session.

## Deploying

Static build, `base: '/'`. Point Cloudflare Pages / Netlify / Vercel at the repo with build command
`npm run build` and output directory `dist`. Keep the project private.
