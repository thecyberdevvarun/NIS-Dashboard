const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthOptions = MONTHS.map((label, i) => ({ value: i + 1, label }));
export const monthName = (m) => MONTHS[m - 1] || '';

export const yearOptions = () => {
  const y = new Date().getFullYear();
  return [y - 2, y - 1, y, y + 1].map((v) => ({ value: v, label: String(v) }));
};

/** ISO date from API ("2026-04-01T00:00:00.000Z") -> "01 Apr 2026". */
export const formatDate = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const toInputDate = (iso) => (iso ? String(iso).slice(0, 10) : '');
export const todayISO = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

export const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(n) || 0);

/** Download rows as a CSV file. columns: [{ header, value: (row) => any }] */
export const downloadCsv = (filename, rows, columns) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => esc(c.header)).join(',')];
  rows.forEach((r) => lines.push(columns.map((c) => esc(c.value(r))).join(',')));
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};
