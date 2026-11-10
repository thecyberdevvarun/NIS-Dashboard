import { X, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function Spinner({ className = "" }) {
  return (
    <Loader2
      className={`animate-spin text-steel ${className}`}
      size={20}
      aria-label="Loading"
    />
  );
}

const BADGE = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-signal-soft text-signal-dark",
  bad: "bg-alert-soft text-alert",
  neutral: "bg-paper text-steel border border-line",
};
export function Badge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${BADGE[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-steel">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, size = "md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // page behind does not scroll
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);
  const width = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" }[size];
  // Portal: drawn directly on <body>, so no parent (like the sidebar) can hide it behind other content.
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-md" onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card my-8 w-full shadow-2xl ${width}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-steel hover:bg-paper"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  busy,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <p className="text-sm text-ink-700">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
          disabled={busy}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, required, children, span }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="label">
        {label}
        {required && <span className="text-alert"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-alert">{error}</p>}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  ...rest
}) {
  return (
    <select
      className={`input ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function DataTable({
  columns,
  rows,
  loading,
  rowKey,
  empty = "Nothing here yet",
}) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header} className={`th ${c.className || ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && !rows.length ? (
            <tr>
              <td className="td" colSpan={columns.length}>
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                className="td py-10 text-center text-steel"
                colSpan={columns.length}
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={r[rowKey] ?? i} className="hover:bg-paper/60">
                {columns.map((c) => (
                  <td key={c.header} className={`td ${c.className || ""}`}>
                    {c.render ? c.render(r) : (r[c.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  if (total <= pageSize)
    return (
      <p className="mt-3 text-sm text-steel">
        {total} record{total === 1 ? "" : "s"}
      </p>
    );
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-steel">
      <span>
        {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of{" "}
        {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          className="btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="btn-ghost btn-sm"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function StatCard({ label, value, tone, hint }) {
  const color =
    tone === "warn"
      ? "text-signal-dark"
      : tone === "bad"
        ? "text-alert"
        : "text-ink-900";
  return (
    <div className="card p-4">
      <p className="text-sm text-steel">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
    </div>
  );
}
