export function initials(fullName = '') {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function shortName(fullName = '') {
  const [last, first] = fullName.split(' ');
  return first ? `${last} ${first[0]}.` : fullName;
}

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function fmtDay(d) {
  const date = new Date(d);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function fmtTime(d) {
  return new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// «14 июня · 10:00–14:00»
export function fmtRange(startsAt, endsAt) {
  const day = fmtDay(startsAt);
  const start = fmtTime(startsAt);
  return endsAt ? `${day} · ${start}–${fmtTime(endsAt)}` : `${day} · ${start}`;
}

export function fmtMonthYear(d) {
  return new Date(d).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

// Событие завершено, если прошло его время окончания (или начала, если конца нет).
export function isFinished(event) {
  const end = event.endsAt || event.startsAt;
  return new Date(end).getTime() < Date.now();
}
