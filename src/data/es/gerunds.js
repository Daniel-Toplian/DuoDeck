const SPECIAL = {
  ir: 'yendo',
  poder: 'pudiendo',
  decir: 'diciendo',
  venir: 'viniendo',
  convenir: 'conviniendo',
  sentir: 'sintiendo',
  consentir: 'consintiendo',
  pedir: 'pidiendo',
  despedir: 'despidiendo',
  impedir: 'impidiendo',
  servir: 'sirviendo',
  convertir: 'convirtiendo',
  divertir: 'divirtiendo',
  advertir: 'advirtiendo',
  morir: 'muriendo',
  dormir: 'durmiendo',
  repetir: 'repitiendo',
  competir: 'compitiendo',
  elegir: 'eligiendo',
  corregir: 'corrigiendo',
  vestir: 'vistiendo',
  medir: 'midiendo',
  mentir: 'mintiendo',
  preferir: 'prefiriendo',
  referir: 'refiriendo',
  sugerir: 'sugiriendo',
  herir: 'hiriendo',
  hervir: 'hirviendo',
  seguir: 'siguiendo',
  conseguir: 'consiguiendo',
  perseguir: 'persiguiendo',
  reír: 'riendo',
  sonreír: 'sonriendo',
  freír: 'friendo',
};

export function gerundOf(infinitive) {
  if (SPECIAL[infinitive]) return SPECIAL[infinitive];
  const inf = infinitive.replace(/ír$/, 'ir');
  const stem = inf.slice(0, -2);
  if (inf.endsWith('ar')) return `${stem}ando`;
  if (/[aeiou]$/.test(stem) && !/[gq]u$/.test(stem)) return `${stem}yendo`;
  return `${stem}iendo`;
}

export function gerundMeta(infinitive) {
  if (SPECIAL[infinitive]) return 'Gerundio irregular';
  if (infinitive.endsWith('ar')) return '-AR → -ando';
  const stem = infinitive.replace(/ír$/, 'ir').slice(0, -2);
  if (/[aeiou]$/.test(stem) && !/[gq]u$/.test(stem)) return 'Vocal + -yendo';
  return '-ER / -IR → -iendo';
}
