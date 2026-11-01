/**
 * Returns { from, to, daysInMonth }.
 * `to` is the first day of the next month (exclusive).
 */
export const monthRange = (month, year) => {
  const m = Number(month);
  const y = Number(year);

  const iso = (d) => d.toISOString().slice(0, 10);

  return {
    from: iso(new Date(Date.UTC(y, m - 1, 1))),
    to: iso(new Date(Date.UTC(y, m, 1))),
    daysInMonth: new Date(Date.UTC(y, m, 0)).getUTCDate(),
  };
};

// ---- Get today's date in YYYY-MM-DD format
export const today = () => new Date().toISOString().slice(0, 10);
