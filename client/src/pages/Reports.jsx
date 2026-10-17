import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download } from 'lucide-react';
import { fetchGuardDeployment } from '../features/reportsSlice';
import { Badge, DataTable, PageHeader } from '../components/ui';
import { downloadCsv, formatDate, formatINR } from '../utils/format';

export default function Reports() {
  const dispatch = useDispatch();
  const { guardDeployment: rows, loading } = useSelector((s) => s.reports);
  const isAdmin = useSelector((s) => s.auth.user?.role === 'Admin');
  const [groupBy, setGroupBy] = useState('all');

  useEffect(() => { dispatch(fetchGuardDeployment()); }, [dispatch]);

  const shown = groupBy === 'unassigned' ? rows.filter((r) => !r.SiteName) : rows;

  const exportCsv = () => downloadCsv('guard-deployment-report.csv', shown, [
    { header: 'Code', value: (r) => r.GuardCode }, { header: 'Guard', value: (r) => r.FullName }, { header: 'Mobile', value: (r) => r.Phone },
    { header: 'Company', value: (r) => r.CompanyName || 'Not assigned' }, { header: 'Site', value: (r) => r.SiteName },
    { header: 'Shift', value: (r) => r.Shift }, { header: 'Since', value: (r) => (r.DeployedSince ? formatDate(r.DeployedSince) : '') },
    { header: 'Contractor', value: (r) => r.Contractor || 'Direct' },
    ...(isAdmin ? [{ header: 'Salary', value: (r) => r.MonthlySalary }] : []),
  ]);

  const columns = [
    { header: 'Company', render: (r) => r.CompanyName || <Badge tone="warn">Not assigned</Badge> },
    { header: 'Site', key: 'SiteName' },
    { header: 'Guard', render: (r) => <div><p className="font-medium">{r.FullName}</p><p className="text-xs text-steel">{r.GuardCode} - {r.Phone}</p></div> },
    { header: 'Shift', key: 'Shift' },
    { header: 'Since', render: (r) => formatDate(r.DeployedSince) },
    { header: 'Contractor', render: (r) => r.Contractor || 'Direct' },
  ];
  if (isAdmin) columns.push({ header: 'Salary', render: (r) => formatINR(r.MonthlySalary) });

  return (
    <>
      <PageHeader title="Reports" subtitle="Guard and deployment list, ready to export">
        <button className="btn-ghost" onClick={exportCsv} disabled={!shown.length}><Download size={16} /> Export CSV</button>
      </PageHeader>
      <div className="mb-4 flex gap-1 border-b border-line">
        {[['all', `All guards (${rows.length})`], ['unassigned', `Not assigned (${rows.filter((r) => !r.SiteName).length})`]].map(([k, label]) => (
          <button key={k} onClick={() => setGroupBy(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${groupBy === k ? 'border-signal text-ink-900' : 'border-transparent text-steel hover:text-ink-900'}`}>{label}</button>
        ))}
      </div>
      <DataTable columns={columns} rows={shown} loading={loading} rowKey="GuardCode" empty="No guards found" />
      <p className="mt-3 text-sm text-steel">Attendance and payroll reports can be exported from their own pages (Export CSV).</p>
    </>
  );
}
