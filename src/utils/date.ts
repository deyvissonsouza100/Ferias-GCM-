export function parseBRDate(s: string): Date | null {
  const v = (s ?? "").trim();
  if (!v) return null;

  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (!dd || !mm || !yyyy) return null;

  // cria data no meio do dia para evitar bugs de timezone
  const d = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function isBetweenInclusive(d: Date, start: Date, end: Date) {
  const t = d.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}
