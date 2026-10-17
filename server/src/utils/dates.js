/** Returns { from, to, daysInMonth } where `to` is the first day of the next month (exclusive). */
exports.monthRange = (month, year) => {
  const m = Number(month);
  const y = Number(year);
  const iso = (d) => d.toISOString().slice(0, 10);
  return {
    from: iso(new Date(Date.UTC(y, m - 1, 1))),
    to: iso(new Date(Date.UTC(y, m, 1))),
    daysInMonth: new Date(Date.UTC(y, m, 0)).getUTCDate(),
  };
};
exports.today = () => new Date().toISOString().slice(0, 10);
