const UNITS = [
  '',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
];

const TWENTIES = [
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
];

const TENS = {
  30: 'treinta',
  40: 'cuarenta',
  50: 'cincuenta',
  60: 'sesenta',
  70: 'setenta',
  80: 'ochenta',
  90: 'noventa',
};

const HUNDREDS = {
  100: 'cien',
  200: 'doscientos',
  300: 'trescientos',
  400: 'cuatrocientos',
  500: 'quinientos',
  600: 'seiscientos',
  700: 'setecientos',
  800: 'ochocientos',
  900: 'novecientos',
  1000: 'mil',
};

export const HUNDRED_STEPS = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

export function numberToWords(n) {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Unsupported number: ${n}`);
  if (n < 20) return UNITS[n];
  if (n < 30) return TWENTIES[n - 20];
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const unit = n % 10;
    return unit === 0 ? TENS[tens] : `${TENS[tens]} y ${UNITS[unit]}`;
  }
  const word = HUNDREDS[n];
  if (!word) throw new Error(`Unsupported number: ${n}`);
  return word;
}

export function numberBand(n) {
  if (n > 100) return '100s';
  const low = Math.floor((n - 1) / 10) * 10 + 1;
  return `${low}–${low + 9}`;
}

const RANGES = {
  '1-20': () => range(1, 20),
  '1-50': () => range(1, 50),
  '1-100': () => range(1, 100),
  '100s': () => [...HUNDRED_STEPS],
  all: () => [...range(1, 100), ...HUNDRED_STEPS],
};

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

export function numberPool(rangeKey) {
  const build = RANGES[rangeKey] ?? RANGES.all;
  return build();
}
