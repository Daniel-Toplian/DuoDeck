const HEX = /^#[0-9a-f]{6}$/i;

export function swatchMarkup(hex, extraClass = '') {
  if (!HEX.test(hex ?? '')) return '';
  return `<div class="swatch ${extraClass}" role="img" aria-label="colour swatch" style="background:${hex}"></div>`;
}
