// Local-date helpers. All dates in identity-os are local calendar dates
// formatted YYYY-MM-DD — the user's day, not UTC's.

export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(fromStr, toStr) {
  const from = new Date(`${fromStr}T12:00:00`);
  const to = new Date(`${toStr}T12:00:00`);
  return Math.round((to - from) / 86400000);
}

// ISO 8601 week, e.g. { year: 2026, week: 24, key: "2026-W24" }
export function isoWeek(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  target.setDate(target.getDate() - dayNr + 3); // nearest Thursday
  const year = target.getFullYear();
  const firstThursday = new Date(year, 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  const week = 1 + Math.round((target - firstThursday) / (7 * 86400000));
  return { year, week, key: `${year}-W${String(week).padStart(2, "0")}` };
}

// Mon..Sun date strings for the ISO week containing dateStr
export function weekDates(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const dayNr = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNr);
  const out = [];
  for (let i = 0; i < 7; i++) {
    out.push(todayStr(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
