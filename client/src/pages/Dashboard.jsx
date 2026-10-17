import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../features/dashboardSlice';
import { Badge, PageHeader, Spinner, StatCard } from '../components/ui';
import { formatINR, monthName } from '../utils/format';

const ATT = [
  { key: 'P', label: 'Present', bar: 'bg-ok' },
  { key: 'A', label: 'Absent', bar: 'bg-alert' },
  { key: 'HD', label: 'Half day', bar: 'bg-signal' },
  { key: 'L', label: 'Leave', bar: 'bg-ink-600' },
  { key: 'WO', label: 'Weekly off', bar: 'bg-steel' },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { data: d, loading } = useSelector((s) => s.dashboard);
  const isAdmin = useSelector((s) => s.auth.user?.role === 'Admin');
  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  if (!d) return <div className="flex justify-center py-20"><Spinner /></div>;

  const onDuty = d.activeGuards - d.unassignedGuards;
  const paidPct = d.payroll.net > 0 ? Math.round((d.payroll.paid / d.payroll.net) * 100) : 0;
  const maxGuards = Math.max(...d.guardsPerClient.map((c) => c.Guards), 1);
  const now = new Date();

  return (
    <>
      <PageHeader title="Dashboard" subtitle={now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}>
        <button className="btn-ghost" onClick={() => dispatch(fetchDashboard())} disabled={loading}>Refresh</button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Guards on duty" value={onDuty} hint={`${d.activeGuards} active in total`} />
        <StatCard label="Not assigned" value={d.unassignedGuards} tone={d.unassignedGuards ? 'warn' : undefined} hint="Guards without a site" />
        <StatCard label="Clients" value={d.activeClients} />
        <StatCard label="Sites" value={d.activeSites} />
        <StatCard label="Contractors" value={d.contractors} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Today's attendance</h2>
            <Link to="/attendance" className="text-sm text-steel underline">Mark attendance</Link>
          </div>
          <p className="mb-3 text-sm text-steel">{d.todayMarked} of {onDuty} guards marked</p>
          <ul className="space-y-2.5">
            {ATT.map((a) => (
              <li key={a.key} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-ink-700">{a.label}</span>
                <div className="h-2.5 flex-1 rounded bg-paper"><div className={`h-2.5 rounded ${a.bar}`} style={{ width: `${onDuty ? (d.todayAttendance[a.key] / onDuty) * 100 : 0}%` }} /></div>
                <span className="w-8 text-right font-medium">{d.todayAttendance[a.key]}</span>
              </li>
            ))}
          </ul>
        </section>

        {isAdmin && (
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Payroll - {monthName(now.getMonth() + 1)} {now.getFullYear()}</h2>
              <Link to="/payroll" className="text-sm text-steel underline">Open payroll</Link>
            </div>
            {d.payroll.total === 0 ? (
              <p className="text-sm text-steel">Payroll has not been generated for this month yet.</p>
            ) : (
              <>
                <p className="text-3xl font-semibold">{formatINR(d.payroll.net)}</p>
                <p className="text-sm text-steel">net payable to {d.payroll.total} guards</p>
                <div className="mt-4 h-2.5 rounded bg-paper"><div className="h-2.5 rounded bg-ok" style={{ width: `${paidPct}%` }} /></div>
                <div className="mt-2 flex justify-between text-sm"><span className="text-ok">Paid {formatINR(d.payroll.paid)}</span><span className="text-signal-dark">Pending {formatINR(d.payroll.pending)}</span></div>
              </>
            )}
          </section>
        )}

        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Sites short of guards</h2>
          {d.shortSites.length === 0 ? <p className="text-sm text-ok">Every site has its required guards.</p> : (
            <ul className="divide-y divide-line">
              {d.shortSites.map((s) => (
                <li key={s.SiteId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div><p className="font-medium">{s.SiteName}</p><p className="text-xs text-steel">{s.CompanyName}</p></div>
                  <Badge tone="warn">{s.Deployed} of {s.RequiredGuards}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Guards per client</h2>
          <ul className="space-y-2.5">
            {d.guardsPerClient.map((c) => (
              <li key={c.CompanyName} className="flex items-center gap-3 text-sm">
                <span className="w-40 truncate" title={c.CompanyName}>{c.CompanyName}</span>
                <div className="h-2.5 flex-1 rounded bg-paper"><div className="h-2.5 rounded bg-ink-700" style={{ width: `${(c.Guards / maxGuards) * 100}%` }} /></div>
                <span className="w-8 text-right font-medium">{c.Guards}</span>
              </li>
            ))}
            {!d.guardsPerClient.length && <li className="text-sm text-steel">No clients yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
