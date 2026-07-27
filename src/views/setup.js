import { escapeHtml } from '../lib/text.js';

export function renderSetup({
  app,
  title,
  subtitle,
  chips,
  advanced = [],
  links = [],
  onStart,
  onBack,
}) {
  const values = {};
  [...chips, ...advanced].forEach((group) => {
    values[group.key] = group.value;
  });

  function groupMarkup(group) {
    return `
      <div class="chip-group" data-group="${group.key}">
        <span class="chip-label">${escapeHtml(group.label)}</span>
        <div class="chips">
          ${group.options
            .map(
              (option) => `<button class="chip ${values[group.key] === option.value ? 'on' : ''}"
                data-group="${group.key}" data-value="${escapeHtml(String(option.value))}">${escapeHtml(option.label)}</button>`,
            )
            .join('')}
        </div>
      </div>`;
  }

  function render() {
    app.innerHTML = `
      <section class="panel setup">
        <button class="ghost back" data-act="back">← Home</button>
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">${escapeHtml(subtitle)}</p>
        ${chips.map(groupMarkup).join('')}
        ${
          advanced.length
            ? `<details class="advanced">
          <summary>Advanced</summary>
          ${advanced.map(groupMarkup).join('')}
        </details>`
            : ''
        }
        <button class="btn primary big" data-act="start">Start</button>
        ${
          links.length
            ? `<div class="setup-links">
          ${links
            .map(
              (link) =>
                `<a class="ghost" href="#${escapeHtml(link.path)}">${escapeHtml(link.label)}</a>`,
            )
            .join('')}
        </div>`
            : ''
        }
      </section>`;

    app.querySelectorAll('.chip').forEach((el) => {
      el.addEventListener('click', () => {
        const { group, value } = el.dataset;
        const source = [...chips, ...advanced].find((entry) => entry.key === group);
        const option = source.options.find((entry) => String(entry.value) === value);
        values[group] = option.value;
        const wasOpen = app.querySelector('.advanced')?.open;
        render();
        if (wasOpen) app.querySelector('.advanced').open = true;
      });
    });

    app.querySelector('[data-act="start"]').addEventListener('click', () => onStart(values));
    app.querySelector('[data-act="back"]').addEventListener('click', onBack);
  }

  render();
}
