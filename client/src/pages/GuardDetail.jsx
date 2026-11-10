import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { guards } from '../features/entities';
import { Badge, DataTable, PageHeader, Spinner } from '../components/ui';
import { formatDate, formatINR, monthName } from '../utils/format';

const Item = ({ label, value }) => (
  <div><dt className="text-xs text-steel">{label}</dt><dd className="mt-0.5 text-sm font-medium">{value || '-'}</dd></div>
);

export default function GuardDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: g, loading } = useSelector((s) => s.guards);
  const isAdmin = useSelector((s) => s.auth.user?.role === 'Admin');

  useEffect(() => {
    dispatch(guards.actions.fetchOne(id));
    return () => { dispatch(guards.actions.clearCurrent()); };
  }, [dispatch, id]);

  if (loading || !g || String(g.GuardId) !== String(id)) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <>
      <Link to="/guards" className="mb-3 inline-flex items-center gap-1 text-sm text-steel hover:text-ink-900"><ArrowLeft size={14} /> All guards</Link>
      <PageHeader title={g.FullName} subtitle={`${g.GuardCode} - joined ${formatDate(g.JoiningDate)}`}>
        <Badge tone={g.IsActive ? 'ok' : 'neutral'}>{g.IsActive ? 'Active' : 'Inactive'}</Badge>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Profile</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Item label="Mobile" value={g.Phone} />
            <Item label="Alternate mobile" value={g.AltPhone} />
            <Item label="Father's name" value={g.FatherName} />
            <Item label="Gender" value={g.Gender} />
            <Item label="Date of birth" value={g.DateOfBirth && formatDate(g.DateOfBirth)} />
            <Item label="Contractor" value={g.ContractorName || 'Direct'} />
            <Item label="Aadhaar" value={g.AadhaarNo} />
            <Item label="PAN" value={g.PanNo} />
            <Item label="UAN / ESIC" value={[g.UanNo, g.EsicNo].filter(Boolean).join(' / ')} />
            {isAdmin && <Item label="Bank" value={g.BankName} />}
            {isAdmin && <Item label="Account no." value={g.AccountNo} />}
            {isAdmin && <Item label="IFSC" value={g.IfscCode} />}
            <Item label="Emergency contact" value={[g.EmergencyContactName, g.EmergencyContactPhone].filter(Boolean).join(' - ')} />
            <div className="col-span-2 sm:col-span-2"><Item label="Address" value={g.Address} /></div>
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Current posting</h2>
          {g.SiteName ? (
            <>
              <p className="text-lg font-semibold">{g.SiteName}</p>
              <p className="text-sm text-steel">{g.CompanyName}</p>
              <p className="mt-2 text-sm">{g.Shift} shift since {formatDate(g.DeployedSince)}</p>
            </>
          ) : <Badge tone="warn">Not assigned to any site</Badge>}
          {isAdmin && <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs text-steel">Monthly salary</p>
            <p className="text-xl font-semibold">{formatINR(g.MonthlySalary)}</p>
            <p className="mt-1 text-xs text-steel">{g.PfApplicable ? 'PF' : 'No PF'} - {g.EsiApplicable ? 'ESI' : 'No ESI'}</p>
          </div>}
        </section>
      </div>

      <h2 className="mb-2 mt-6 font-semibold">Posting history</h2>
      <DataTable rowKey="DeploymentId" rows={g.history} empty="No postings yet" columns={[
        { header: 'Company', key: 'CompanyName' },
        { header: 'Site', key: 'SiteName' },
        { header: 'Shift', key: 'Shift' },
        { header: 'From', render: (r) => formatDate(r.StartDate) },
        { header: 'To', render: (r) => (r.EndDate ? formatDate(r.EndDate) : <Badge tone="ok">Current</Badge>) },
      ]} />

      {isAdmin && <h2 className="mb-2 mt-6 font-semibold">Recent salary</h2>}
      {isAdmin && <DataTable rowKey="PaymentId" rows={g.payments} empty="No salary generated yet" columns={[
        { header: 'Month', render: (r) => `${monthName(r.PayMonth)} ${r.PayYear}` },
        { header: 'Days', key: 'PayableDays' },
        { header: 'Gross', render: (r) => formatINR(r.GrossAmount) },
        { header: 'Net pay', render: (r) => formatINR(r.NetAmount) },
        { header: 'Status', render: (r) => <Badge tone={r.Status === 'Paid' ? 'ok' : 'warn'}>{r.Status}{r.PaidOn ? ` ${formatDate(r.PaidOn)}` : ''}</Badge> },
      ]} />}
    </>
  );
}
