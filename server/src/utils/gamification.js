// Уровни по очкам. Порядок — по возрастанию порога.
export const LEVELS = [
  { key: 'NEWBIE', name: 'Новичок', min: 0 },
  { key: 'MEMBER', name: 'Участник', min: 500 },
  { key: 'ACTIVIST', name: 'Активист', min: 1000 },
  { key: 'LEADER', name: 'Лидер', min: 2000 },
  { key: 'LEGEND', name: 'Легенда', min: 3000 },
  { key: 'CHAMPION', name: 'Чемпион', min: 5000 },
];

// Текущий уровень, следующий и прогресс до него.
export function levelInfo(points) {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  return {
    level: current.name,
    levelKey: current.key,
    nextLevel: next ? next.name : null,
    currentThreshold: current.min,
    nextThreshold: next ? next.min : null,
    toNextLevel: next ? next.min - points : 0,
  };
}

// Бейджи Новичок…Легенда с признаком, открыт ли (Чемпион не показываем как бейдж).
export function badges(points) {
  return LEVELS.slice(0, 5).map((l) => ({ key: l.key, name: l.name, earned: points >= l.min }));
}

// Длительность мероприятия в часах (0, если конец не задан).
export function eventHours(event) {
  if (!event.endsAt) return 0;
  const ms = new Date(event.endsAt) - new Date(event.startsAt);
  return ms > 0 ? ms / 3_600_000 : 0;
}
