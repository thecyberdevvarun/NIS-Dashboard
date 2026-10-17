import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download } from 'lucide-react';
import { fetchSheet, fetchSummary, saveAttendance } from '../features/attendanceSlice';
import { sites } from '../features/entities';
import { DataTable, PageHeader, Select, Spinner } from '../components/ui';
import { downloadCsv, monthName, monthOptions, todayISO, yearOptions } from '../utils/format';

const STATUS = [
  { key: 'P', label: 'P', title: 'Present', on: 'bg-ok text-white border-ok' },
  { key: 'A', label: 'A', title: 'Absent', on: 'bg-alert text-white border-alert' },
  { key: 'HD', label: 'HD', title: 'Half day', on: 'bg-signal text-ink-950 border-signal' },
  { key: 'L', label: 'L', title: 'Paid leave', on: 'bg-ink-600 text-white border-ink-600' },
  { key: 'WO', label: 'WO', title: 'Weekly off', on: 'bg-steel text-white border-steel' },
];

function DailySheet() {
  const dispatch = useDispatch();
  const { sheet, loading, saving } = useSelector((s) => s.attendance);
  const siteOpts = useSelector((s) => s.sites.options);
  const [date, setDate] = useState(todayISO());
  const [siteId, setSiteId] = useState('');
  const [rows, setRows] = useState({});

  const siteSelect = useMemo(() => siteOpts.map((s) => ({ value: s.SiteId, label: `${s.CompanyName} - ${s.SiteName}` })), [siteOpts]);

  const load = () => { if (date && siteId) dispatch(fetchSheet({ date, siteId })); };
  useEffect(load, [dispatch, date, siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const next = {};
    sheet.forEach((g) => { next[g.GuardId] = { status: g.Status || '', otHours: Number(g.OtHours) || 0 }; });
    setRows(next);
  }, [sheet]);

  const setRow = (id, patch) => setRows((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  const markAll = (status) => setRows((p) => Object.fromEntries(Object.entries(p).map(([id, r]) => [id, { ...r, status }])));
  const counts = Object.values(rows).reduce((a, r) => { if (r.status) a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  const unmarked = sheet.filter((g) => !rows[g.GuardId]?.status).length;

  const save = async () => {
    const records = sheet.map((g) => ({ guardId: g.GuardId, status: rows[g.GuardId]?.status, otHours: rows[g.GuardId]?.otHours }));
    try { await dispatch(saveAttendance({ date, siteId: Number(siteId), records })).unwrap(); load(); } catch { /* toast shown */ }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div><label className="label">Date</label><input type="date" className="input" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="min-w-[260px] flex-1 sm:max-w-md"><label className="label">Site</label><Select value={siteId} onChange={setSiteId} options={siteSelect} placeholder="Select site" /></div>
        {siteId && sheet.length > 0 && (
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => markAll('P')}>Mark all present</button>
            <button className="btn-ghost" onClick={() => markAll('')}>Clear</button>
          </div>
        )}
      </div>

      {!siteId ? <div className="card py-12 text-center text-steel">Choose a site to see its guards.</div>
        : loading && !sheet.length ? <div className="flex justify-center py-12"><Spinner /></div>
        : sheet.length === 0 ? <div className="card py-12 text-center text-steel">No guards are posted at this site on this date. Assign guards in Deployments.</div>
        : (
          <>
            <div className="card divide-y divide-line">
              {sheet.map((g) => (
                <div key={g.GuardId} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                  <div className="min-w-[180px] flex-1">
                    <p className="font-medium">{g.FullName}</p>
                    <p className="text-xs text-steel">{g.GuardCode} - {g.Shift} shift</p>
                  </div>
                  <div className="flex gap-1" role="group" aria-label={`Attendance for ${g.FullName}`}>
                    {STATUS.map((s) => (
                      <button key={s.key} type="button" title={s.title} aria-pressed={rows[g.GuardId]?.status === s.key}
                        onClick={() => setRow(g.GuardId, { status: s.key })}
                        className={`h-9 w-11 rounded border text-sm font-medium transition-colors ${rows[g.GuardId]?.status === s.key ? s.on : 'border-line bg-white text-ink-700 hover:bg-paper'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-steel">OT hrs
                    <input type="number" min="0" max="24" step="0.5" className="input w-20 py-1.5" value={rows[g.GuardId]?.otHours ?? 0}
                      onChange={(e) => setRow(g.GuardId, { otHours: e.target.value })} />
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-steel">
                {STATUS.filter((s) => counts[s.key]).map((s) => `${s.title} ${counts[s.key]}`).join('  |  ') || 'Nothing marked yet'}
                {unmarked > 0 && <span className="ml-3 text-signal-dark">{unmarked} not marked</span>}
              </p>
              <button className="btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save attendance'}</button>
            </div>
          </>
        )}
    </>
  );
}

function MonthlySummary() {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((s) => s.attendance);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => { dispatch(fetchSummary({ month, year })); }, [dispatch, month, year]);

  const exportCsv = () => downloadCsv(`attendance-${year}-${String(month).padStart(2, '0')}.csv`, summary, [
    { header: 'Code', value: (r) => r.GuardCode }, { header: 'Guard', value: (r) => r.FullName },
    { header: 'Present', value: (r) => r.Present }, { header: 'Absent', value: (r) => r.Absent }, { header: 'Half day', value: (r) => r.HalfDay },
    { header: 'Leave', value: (r) => r.Leave }, { header: 'Weekly off', value: (r) => r.WeeklyOff },
    { header: 'Payable days', value: (r) => r.PayableDays }, { header: 'OT hours', value: (r) => r.OtHours },
  ]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div><label className="label">Month</label><Select value={month} onChange={(v) => setMonth(Number(v))} options={monthOptions} /></div>
        <div><label className="label">Year</label><Select value={year} onChange={(v) => setYear(Number(v))} options={yearOptions()} /></div>
        <button className="btn-ghost" onClick={exportCsv} disabled={!summary.length}><Download size={16} /> Export CSV</button>
      </div>
      <DataTable rowKey="GuardId" rows={summary} loading={loading} empty={`No attendance marked for ${monthName(month)} ${year}`} columns={[
        { header: 'Code', key: 'GuardCode' }, { header: 'Guard', key: 'FullName' },
        { header: 'Present', key: 'Present' }, { header: 'Absent', key: 'Absent' }, { header: 'Half day', key: 'HalfDay' },
        { header: 'Leave', key: 'Leave' }, { header: 'Weekly off', key: 'WeeklyOff' },
        { header: 'Payable days', render: (r) => <strong>{r.PayableDays}</strong> }, { header: 'OT hrs', key: 'OtHours' },
      ]} />
    </>
  );
}

export default function Attendance() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('daily');
  useEffect(() => { dispatch(sites.actions.fetchOptions()); }, [dispatch]);

  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark each guard for the day, or review the month" />
      <div className="mb-5 flex gap-1 border-b border-line">
        {[['daily', 'Daily sheet'], ['monthly', 'Monthly summary']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? 'border-signal text-ink-900' : 'border-transparent text-steel hover:text-ink-900'}`}>{label}</button>
        ))}
      </div>
      {tab === 'daily' ? <DailySheet /> : <MonthlySummary />}
    </>
  );
}
