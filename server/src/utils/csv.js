// Минимальная сериализация в CSV с экранированием.

function escape(value) {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function participantsToCsv(rows) {
  const header = ['fullName', 'email', 'status', 'createdAt'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.user.fullName, r.user.email, r.status, new Date(r.createdAt).toISOString()]
        .map(escape)
        .join(','),
    );
  }
  return lines.join('\n');
}
