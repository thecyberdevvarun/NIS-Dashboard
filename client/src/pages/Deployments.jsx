import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftRight, Plus, Search, StopCircle } from 'lucide-react';
import { assignGuard, endDeployment, fetchDeployments } from '../features/deploymentsSlice';
import { clients, guards, sites } from '../features/entities';
import { ConfirmDialog, DataTable, Field, Modal, PageHeader, Pagination, Select } from '../components/ui';
import { formatDate, todayISO } from '../utils/format';

const SHIFTS = ['Day', 'Night', 'General'].map((v) => ({ value: v, label: v }));

export default function Deployments() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAdmin = useSelector((s) => s.auth.user?.role === 'Admin');
  const { items, total, page, pageSize, loading, saving } = useSelector((s) => s.deployments);
  const guardOpts = useSelector((s) => s.guards.options);
  const siteOpts = useSelector((s) => s.sites.options);
  const clientOpts = useSelector((s) => s.clients.options);

  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [clientId, setClientId] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [form, setForm] = useState(null);       // assign / transfer modal
  const [ending, setEnding] = useState(null);

  const loadOptions = useCallback(() => {
    dispatch(guards.actions.fetchOptions());
    dispatch(sites.actions.fetchOptions());
    dispatch(clients.actions.fetchOptions());
  }, [dispatch]);

  useEffect(() => { loadOptions(); }, [loadOptions]);
  useEffect(() => { const t = setTimeout(() => { setQ(search); setPageNo(1); }, 350); return () => clearTimeout(t); }, [search]);

  const load = useCallback(() => {
    dispatch(fetchDeployments({ page: pageNo, search: q || undefined, clientId: clientId || undefined, isActive: 1 }));
  }, [dispatch, pageNo, q, clientId]);
  useEffect(() => { load(); }, [load]);

  // arriving from the Guards page with a guard pre-selected
  useEffect(() => {
    if (location.state?.guardId) {
      setForm({ guardId: String(location.state.guardId), siteId: '', shift: 'Day', startDate: todayISO() });
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const guardSelect = useMemo(
    () => guardOpts.map((g) => ({ value: g.GuardId, label: `${g.GuardCode} - ${g.FullName}${g.SiteName ? ` (now at ${g.SiteName})` : ' (not assigned)'}` })),
    [guardOpts]
  );
  const siteSelect = useMemo(() => siteOpts.map((s) => ({ value: s.SiteId, label: `${s.CompanyName} - ${s.SiteName}` })), [siteOpts]);
  const clientSelect = useMemo(() => clientOpts.map((c) => ({ value: c.ClientId, label: c.CompanyName })), [clientOpts]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.guardId || !form.siteId || !form.startDate) return;
    try {
      await dispatch(assignGuard({ ...form, guardId: Number(form.guardId), siteId: Number(form.siteId) })).unwrap();
      setForm(null); load(); loadOptions();
    } catch { /* toast shown */ }
  };

  const confirmEnd = async () => {
    try { await dispatch(endDeployment({ id: ending.DeploymentId, endDate: todayISO() })).unwrap(); setEnding(null); load(); loadOptions(); } catch { /* toast shown */ }
  };

  const columns = [
    { header: 'Company', key: 'CompanyName' },
    { header: 'Site', key: 'SiteName' },
    { header: 'Guard', render: (r) => <div><p className="font-medium">{r.FullName}</p><p className="text-xs text-steel">{r.GuardCode} - {r.Phone}</p></div> },
    { header: 'Shift', key: 'Shift' },
    { header: 'Since', render: (r) => formatDate(r.StartDate) },
  ];
  if (isAdmin) {
    columns.push({
      header: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <button className="btn-ghost btn-sm" onClick={() => setForm({ guardId: String(r.GuardId), siteId: '', shift: r.Shift, startDate: todayISO() })}><ArrowLeftRight size={14} /> Transfer</button>
          <button className="btn-ghost btn-sm text-alert" onClick={() => setEnding(r)}><StopCircle size={14} /> End</button>
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader title="Deployments" subtitle="Which guard is posted at which company and site">
        {isAdmin && <button className="btn-primary" onClick={() => setForm({ guardId: '', siteId: '', shift: 'Day', startDate: todayISO() })}><Plus size={16} /> Assign guard</button>}
      </PageHeader>

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-steel" />
          <input className="input pl-9" placeholder="Search guard, site or company" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-auto min-w-[180px]" value={clientId} placeholder="All clients" options={clientSelect} onChange={(v) => { setClientId(v); setPageNo(1); }} />
      </div>

      <DataTable columns={columns} rows={items} loading={loading} rowKey="DeploymentId" empty="No active deployments" />
      <Pagination page={page} pageSize={pageSize} total={total} onPage={setPageNo} />

      {form && (
        <Modal title="Assign guard to site" onClose={() => setForm(null)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Guard" required><Select value={form.guardId} onChange={(v) => setForm({ ...form, guardId: v })} options={guardSelect} placeholder="Select guard" required /></Field>
            <Field label="Site" required><Select value={form.siteId} onChange={(v) => setForm({ ...form, siteId: v })} options={siteSelect} placeholder="Select site" required /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Shift"><Select value={form.shift} onChange={(v) => setForm({ ...form, shift: v })} options={SHIFTS} /></Field>
              <Field label="Start date" required><input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></Field>
            </div>
            <p className="text-xs text-steel">If the guard is already posted somewhere, that posting ends the day before the start date.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Assign'}</button>
            </div>
          </form>
        </Modal>
      )}

      {ending && (
        <ConfirmDialog title="End deployment" danger confirmLabel="End deployment" busy={saving} onClose={() => setEnding(null)} onConfirm={confirmEnd}
          message={`${ending.FullName} will no longer be posted at ${ending.SiteName}. The guard will show as not assigned until you give a new site.`} />
      )}
    </>
  );
}
