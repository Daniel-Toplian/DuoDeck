export function stripAccents(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function normalize(value) {
  return stripAccents(value).toLowerCase().trim().replace(/\s+/g, ' ');
}

export function diffChars(input, expected) {
  const a = [...input];
  const b = [...expected];
  const length = Math.max(a.length, b.length);
  const result = [];
  for (let i = 0; i < length; i += 1) {
    const ch = a[i];
    if (ch === undefined) continue;
    const same = b[i] !== undefined && normalize(ch) === normalize(b[i]);
    result.push({ ch, same });
  }
  return result;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

export function skeleton(answer) {
  return [...answer]
    .map((ch, i) => {
      if (ch === ' ') return '·';
      if (i === 0) return ch;
      return '_';
    })
    .join(' ');
}
