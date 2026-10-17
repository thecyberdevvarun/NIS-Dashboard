import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog, DataTable, Field, Modal, PageHeader, Pagination, Select } from './ui';
import { toInputDate } from '../utils/format';

/**
 * Config-driven list + add/edit/deactivate screen used by Guards, Clients, Sites and Contractors.
 *  fields:  [{ name, label, type: text|number|date|select|textarea|checkbox|section, required, options, span, editOnly }]
 *  filters: [{ key, label, options }]   -> sent to the API as query params
 */
export default function CrudPage({
  title, subtitle, noun, stateKey, actions, columns, fields, filters = [], rowActions, defaults = {}, size = 'md', idKey, searchHint,
}) {
  const dispatch = useDispatch();
  const { items, total, page, pageSize, loading, saving } = useSelector((s) => s[stateKey]);
  const isAdmin = useSelector((s) => s.auth.user?.role === 'Admin');

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');          // debounced search
  const [filterValues, setFilterValues] = useState({});
  const [pageNo, setPageNo] = useState(1);
  const [editing, setEditing] = useState(null);    // null | 'new' | row
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { const t = setTimeout(() => { setQuery(search); setPageNo(1); }, 350); return () => clearTimeout(t); }, [search]);

  const load = useCallback(() => {
    dispatch(actions.fetchAll({ page: pageNo, search: query || undefined, ...filterValues }));
  }, [dispatch, actions, pageNo, query, filterValues]);
  useEffect(() => { load(); }, [load]);

  const openForm = (row) => {
    const v = { ...defaults };
    fields.filter((f) => f.type !== 'section').forEach((f) => {
      if (row) v[f.name] = f.type === 'date' ? toInputDate(row[f.name]) : (row[f.name] ?? (f.type === 'checkbox' ? false : ''));
      else if (v[f.name] === undefined) v[f.name] = f.type === 'checkbox' ? false : '';
    });
    setValues(v); setErrors({}); setEditing(row || 'new');
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    fields.forEach((f) => { if (f.required && (values[f.name] === '' || values[f.name] == null)) errs[f.name] = `${f.label} is required`; });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const isNew = editing === 'new';
    const body = {};
    fields.filter((f) => f.type !== 'section' && !(isNew && f.editOnly)).forEach((f) => { body[f.name] = values[f.name]; });
    const action = isNew ? actions.create(body) : actions.update({ id: editing[idKey], body });
    try { await dispatch(action).unwrap(); setEditing(null); load(); } catch { /* toast already shown by api layer */ }
  };

  const confirmDelete = async () => {
    try { await dispatch(actions.remove(toDelete[idKey])).unwrap(); setToDelete(null); load(); } catch { /* toast shown */ }
  };

  const set = (name, v) => { setValues((p) => ({ ...p, [name]: v })); setErrors((p) => ({ ...p, [name]: undefined })); };

  const renderInput = (f) => {
    const common = { id: f.name, value: values[f.name] ?? '', placeholder: f.placeholder };
    if (f.type === 'select') return <Select {...common} onChange={(v) => set(f.name, v)} options={f.options || []} placeholder="Select..." />;
    if (f.type === 'textarea') return <textarea {...common} rows={2} className="input" onChange={(e) => set(f.name, e.target.value)} />;
    if (f.type === 'checkbox') {
      return (
        <label className="flex items-center gap-2 py-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-ink-800" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
          {f.hint || 'Yes'}
        </label>
      );
    }
    return <input {...common} type={f.type || 'text'} step={f.type === 'number' ? '0.01' : undefined} className="input" onChange={(e) => set(f.name, e.target.value)} />;
  };

  const cols = [...columns];
  if (isAdmin || rowActions) {
    cols.push({
      header: 'Actions', className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          {rowActions?.(row)}
          {isAdmin && <button className="btn-ghost btn-sm" onClick={() => openForm(row)} aria-label={`Edit ${noun}`}><Pencil size={14} /></button>}
          {isAdmin && row.IsActive && <button className="btn-ghost btn-sm text-alert" onClick={() => setToDelete(row)} aria-label={`Deactivate ${noun}`}><Trash2 size={14} /></button>}
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        {isAdmin && <button className="btn-primary" onClick={() => openForm(null)}><Plus size={16} /> Add {noun}</button>}
      </PageHeader>

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-steel" />
          <input className="input pl-9" placeholder={searchHint || `Search ${noun}s`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filters.map((f) => (
          <Select key={f.key} className="w-auto min-w-[160px]" value={filterValues[f.key]} placeholder={f.label} options={f.options}
            onChange={(v) => { setFilterValues((p) => ({ ...p, [f.key]: v })); setPageNo(1); }} />
        ))}
      </div>

      <DataTable columns={cols} rows={items} loading={loading} rowKey={idKey} empty={`No ${noun}s found`} />
      <Pagination page={page} pageSize={pageSize} total={total} onPage={setPageNo} />

      {editing && (
        <Modal title={editing === 'new' ? `Add ${noun}` : `Edit ${noun}`} onClose={() => setEditing(null)} size={size}>
          <form onSubmit={submit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.filter((f) => !(editing === 'new' && f.editOnly)).map((f) =>
                f.type === 'section' ? (
                  <h3 key={f.label} className="border-b border-line pb-1 pt-2 text-sm font-semibold text-ink-700 sm:col-span-2">{f.label}</h3>
                ) : (
                  <Field key={f.name} label={f.label} required={f.required} error={errors[f.name]} span={f.span}>{renderInput(f)}</Field>
                )
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog title={`Deactivate ${noun}`} danger busy={saving} confirmLabel="Deactivate" onClose={() => setToDelete(null)} onConfirm={confirmDelete}
          message={`${toDelete[Object.keys(toDelete).find((k) => /Name$/.test(k))] || 'This record'} will be marked inactive. History is kept and you can reactivate it later by editing.`} />
      )}
    </>
  );
}
