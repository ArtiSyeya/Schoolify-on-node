export const CATEGORIES = {
  ECO: { label: 'Эко', color: 'var(--cat-eco)' },
  HELP: { label: 'Помощь', color: 'var(--cat-help)' },
  EDU: { label: 'Обучение', color: 'var(--cat-edu)' },
  SPORT: { label: 'Спорт', color: 'var(--cat-sport)' },
};

export const CATEGORY_FILTERS = [
  { key: 'ALL', label: 'Все' },
  { key: 'ECO', label: 'Эко' },
  { key: 'HELP', label: 'Помощь' },
  { key: 'EDU', label: 'Обучение' },
  { key: 'SPORT', label: 'Спорт' },
];

export function categoryMeta(key) {
  return CATEGORIES[key] || { label: key, color: 'var(--muted)' };
}
