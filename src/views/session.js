import { checkAnswer } from '../lib/grade.js';
import { sceneMarkup } from '../lib/scenes.js';
import { swatchMarkup } from '../lib/swatch.js';
import { diffChars, escapeHtml, skeleton } from '../lib/text.js';
import { isHard, markHard, recordResult, removeHard } from '../state.js';
import { renderSummary } from './summary.js';

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

export function runSession({
  app,
  session,
  title,
  onExit,
  onPractiseMissed,
  autoGrade = false,
  trackHard = true,
}) {
  let phase = 'question';
  let hintStage = 0;
  let typedValue = '';
  let verdict = null;
  let picked = null;

  function teardown() {
    removeEventListener('keydown', onKey);
  }

  function finish() {
    teardown();
    renderSummary({
      app,
      session,
      title,
      onExit,
      onPractiseMissed,
    });
  }

  function showQuestion() {
    phase = 'question';
    hintStage = 0;
    typedValue = '';
    verdict = null;
    picked = null;
    render();
  }

  function grade(correct) {
    const card = session.current();
    if (!card) return;
    if (trackHard) recordResult(card.key, correct);
    session.grade(correct);
    if (session.finished) finish();
    else showQuestion();
  }

  function reveal() {
    const card = session.current();
    if (card?.choices) return;
    const input = app.querySelector('#answer-input');
    if (input) typedValue = input.value;
    phase = 'answer';
    if (autoGrade && card) verdict = checkAnswer(card, typedValue);
    render();
  }

  function selectChoice(index) {
    if (phase !== 'question') return;
    const card = session.current();
    if (!card?.choices?.[index]) return;
    picked = index;
    verdict = { correct: card.choices[index].correct, note: null };
    phase = 'answer';
    render();
  }

  function onKey(event) {
    const inInput = event.target instanceof HTMLInputElement;
    if (event.key === 'Escape') {
      event.preventDefault();
      teardown();
      onExit();
      return;
    }
    if (phase === 'question') {
      if (!inInput && ['1', '2', '3', '4'].includes(event.key)) {
        const card = session.current();
        if (card?.choices) {
          event.preventDefault();
          selectChoice(Number(event.key) - 1);
          return;
        }
      }
      if (event.key === 'Enter' || (event.key === ' ' && !inInput)) {
        event.preventDefault();
        reveal();
        return;
      }
      if (inInput) return;
      if (event.key.toLowerCase() === 'h') hint();
      if (event.key.toLowerCase() === 'l') later();
      if (trackHard && event.key.toLowerCase() === 'm') toggleHard();
      return;
    }
    if (inInput) return;
    if (verdict && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      grade(verdict.correct);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === '2') grade(true);
    if (event.key === 'ArrowLeft' || event.key === '1') grade(false);
    if (event.key.toLowerCase() === 'r') repeatNow();
    if (trackHard && event.key.toLowerCase() === 'm') toggleHard();
  }

  function hint() {
    const card = session.current();
    const maxStage = card?.choices ? 1 : 2;
    if (hintStage >= maxStage) return;
    hintStage += 1;
    if (card) session.markHinted(card);
    render();
  }

  function later() {
    session.later();
    showQuestion();
  }

  function repeatNow() {
    showQuestion();
  }

  function toggleHard() {
    const card = session.current();
    if (!card) return;
    if (isHard(card.key)) removeHard(card.key);
    else markHard(card.key);
    render();
  }

  function hintMarkup(card) {
    if (hintStage === 0) return '';
    const rows = [`<div class="hint-line">${escapeHtml(card.meta)}</div>`];
    if (hintStage === 2) {
      rows.push(`<div class="hint-line skeleton">${escapeHtml(skeleton(card.answer))}</div>`);
    }
    return `<div class="hint">${rows.join('')}</div>`;
  }

  function verdictMarkup() {
    if (!verdict) return '';
    const label = verdict.correct ? 'Correct' : 'Not quite';
    return `
      <div class="verdict ${verdict.correct ? 'ok' : 'bad'}">
        <span>${label}</span>
        ${verdict.note ? `<span class="verdict-note">${escapeHtml(verdict.note)}</span>` : ''}
      </div>`;
  }

  function comparisonMarkup(card) {
    if (!card.typed) return '';
    if (verdict?.correct && !verdict.note) return '';
    const typed = typedValue.trim();
    if (!typed) return '<div class="compare empty">(nothing typed)</div>';
    const diff = diffChars(typed, card.answer)
      .map(({ ch, same }) => `<span class="${same ? 'ok' : 'off'}">${escapeHtml(ch)}</span>`)
      .join('');
    return `<div class="compare"><span class="compare-label">you</span><span class="typed">${diff}</span></div>`;
  }

  function answerMarkup(card) {
    if (phase !== 'answer') return '';
    return `
      <div class="answer-block">
        ${swatchMarkup(card.answerSwatch, 'swatch-answer')}
        ${verdictMarkup()}
        ${comparisonMarkup(card)}
        <div class="answer">${escapeHtml(card.answer)}</div>
        ${card.answerNote ? `<div class="answer-note">${escapeHtml(card.answerNote)}</div>` : ''}
      </div>`;
  }

  function inputMarkup(card) {
    if (phase !== 'question' || !card.typed) return '';
    const numeric = card.inputMode === 'numeric';
    const placeholder = numeric ? 'escribe el número' : 'escribe la respuesta';
    return `
      <div class="input-row">
        <input id="answer-input" type="text" autocomplete="off" autocapitalize="off"
               ${numeric ? 'inputmode="numeric"' : ''}
               spellcheck="false" placeholder="${placeholder}" value="${escapeHtml(typedValue)}" />
        ${
          card.accents === false
            ? ''
            : `<div class="accent-bar">
          ${ACCENTS.map((ch) => `<button class="accent" data-accent="${ch}">${ch}</button>`).join('')}
        </div>`
        }
      </div>`;
  }

  function choicesMarkup(card) {
    if (!card.choices) return '';
    const answered = phase === 'answer';
    return `
      <div class="choices ${card.choices.some((c) => c.scene) ? 'choices-scenes' : ''}">
        ${card.choices
          .map((choice, i) => {
            const state = answered
              ? choice.correct
                ? 'correct'
                : i === picked
                  ? 'incorrect'
                  : ''
              : '';
            const content = choice.label
              ? escapeHtml(choice.label)
              : sceneMarkup(choice.scene, { size: 'sm' });
            return `<button class="choice ${state}" data-choice="${i}" ${answered ? 'disabled' : ''}>${content}</button>`;
          })
          .join('')}
      </div>`;
  }

  function hardButton(card) {
    if (!trackHard) return '';
    return `<button class="btn subtle ${isHard(card.key) ? 'starred' : ''}" data-act="hard">★</button>`;
  }

  function actionsMarkup(card) {
    if (phase === 'question') {
      const hintMax = card.choices ? 1 : 2;
      return `
        <div class="actions">
          ${card.choices ? '' : `<button class="btn primary" data-act="reveal">${card.typed ? 'Check' : 'Reveal'}</button>`}
          <div class="actions-row">
            <button class="btn subtle" data-act="hint">Hint${hintStage ? ` ${hintStage}/${hintMax}` : ''}</button>
            <button class="btn subtle" data-act="later">Repeat later</button>
            ${hardButton(card)}
          </div>
        </div>`;
    }
    return `
      <div class="actions">
        ${verdict ? '<button class="btn primary" data-act="next">Next</button>' : ''}
        <div class="actions-row grade">
          <button class="btn wrong" data-act="wrong">Wrong</button>
          <button class="btn right" data-act="right">Right</button>
        </div>
        <div class="actions-row">
          <button class="btn subtle" data-act="repeat">Repeat now</button>
          ${hardButton(card)}
        </div>
      </div>`;
  }

  function render() {
    const card = session.current();
    if (!card) {
      finish();
      return;
    }
    const percent = Math.round((session.done / session.total) * 100);
    app.innerHTML = `
      <section class="session">
        <div class="session-head">
          <button class="ghost" data-act="quit">← End</button>
          <div class="progress"><div class="bar" style="width:${percent}%"></div></div>
          <span class="count">${session.done} / ${session.total}</span>
        </div>
        <div class="card ${phase === 'answer' ? 'flipped' : ''}">
          <span class="tag">${escapeHtml(card.tag)}</span>
          ${swatchMarkup(card.promptSwatch)}
          ${sceneMarkup(card.promptScene)}
          ${card.prompt ? `<div class="prompt">${escapeHtml(card.prompt)}</div>` : ''}
          ${card.promptSub ? `<div class="prompt-sub">${escapeHtml(card.promptSub)}</div>` : ''}
          ${hintMarkup(card)}
          ${inputMarkup(card)}
          ${choicesMarkup(card)}
          ${answerMarkup(card)}
        </div>
        ${actionsMarkup(card)}
      </section>`;

    app.querySelectorAll('[data-act]').forEach((el) => {
      el.addEventListener('click', () => {
        const act = el.dataset.act;
        if (act === 'reveal') reveal();
        if (act === 'hint') hint();
        if (act === 'later') later();
        if (act === 'hard') toggleHard();
        if (act === 'repeat') repeatNow();
        if (act === 'next') grade(Boolean(verdict?.correct));
        if (act === 'right') grade(true);
        if (act === 'wrong') grade(false);
        if (act === 'quit') {
          teardown();
          onExit();
        }
      });
    });

    if (phase === 'question') {
      app.querySelectorAll('[data-choice]').forEach((el) => {
        el.addEventListener('click', () => selectChoice(Number(el.dataset.choice)));
      });
    }

    const input = app.querySelector('#answer-input');
    if (input) {
      input.focus();
      input.addEventListener('input', () => {
        typedValue = input.value;
      });
      app.querySelectorAll('[data-accent]').forEach((el) => {
        el.addEventListener('mousedown', (event) => {
          event.preventDefault();
          insertAccent(input, el.dataset.accent);
        });
      });
    }

    if (phase === 'answer' && !autoGrade) app.querySelector('[data-act="right"]')?.focus();
  }

  function insertAccent(input, ch) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.value = `${input.value.slice(0, start)}${ch}${input.value.slice(end)}`;
    typedValue = input.value;
    input.focus();
    input.setSelectionRange(start + ch.length, start + ch.length);
  }

  addEventListener('keydown', onKey);
  render();
}
