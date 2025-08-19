function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function diffInDays(a, b) {
  return Math.floor((b - a) / (24 * 60 * 60 * 1000));
}

export function isDue(schedule, date = new Date()) {
  const { type, startDate, repeatEvery = 1, occurrences } = schedule;
  const s = new Date(startDate);
  const d = new Date(date);

  if (d < new Date(s.getFullYear(), s.getMonth(), s.getDate())) return false;
  if (type === 'once') return sameDay(s, d);

  let step = 0;
  if (type === 'daily') {
    const days = diffInDays(s, d);
    if (days < 0 || days % repeatEvery) return false;
    step = Math.floor(days / repeatEvery);
  } else if (type === 'weekly') {
    const days = diffInDays(s, d);
    if (days < 0) return false;
    const w = Math.floor(days / 7);
    if (w % repeatEvery) return false;
    step = Math.floor(w / repeatEvery);
  } else if (type === 'monthly') {
    const m =
      (d.getFullYear() - s.getFullYear()) * 12 + (d.getMonth() - s.getMonth());
    if (m < 0 || m % repeatEvery) return false;
    step = Math.floor(m / repeatEvery);
  }

  if (typeof occurrences === 'number' && step >= occurrences) return false;
  return true;
}

export default { isDue };