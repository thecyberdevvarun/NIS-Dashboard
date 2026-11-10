import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Route } from 'lucide-react';
import CrudPage from '../components/CrudPage';
import { Badge } from '../components/ui';
import { clients, contractors, guards } from '../features/entities';
import { formatINR } from '../utils/format';

export default function Guards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contractorOptions = useSelector((s) => s.contractors.options);
  const clientOptions = useSelector((s) => s.clients.options);
  const isAdmin = useSelector((s) => s.auth.user?.role === 'Admin');

  useEffect(() => {
    dispatch(contractors.actions.fetchOptions());
    dispatch(clients.actions.fetchOptions());
  }, [dispatch]);

  const cOpts = useMemo(() => contractorOptions.map((c) => ({ value: c.ContractorId, label: c.Name })), [contractorOptions]);
  const clOpts = useMemo(() => clientOptions.map((c) => ({ value: c.ClientId, label: c.CompanyName })), [clientOptions]);

  const fields = useMemo(() => [
    { type: 'section', label: 'Personal details' },
    { name: 'FullName', label: 'Full name', required: true },
    { name: 'FatherName', label: "Father's name" },
    { name: 'Phone', label: 'Mobile', required: true },
    { name: 'AltPhone', label: 'Alternate mobile' },
    { name: 'Gender', label: 'Gender', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }] },
    { name: 'DateOfBirth', label: 'Date of birth', type: 'date' },
    { name: 'Address', label: 'Address', type: 'textarea', span: 2 },
    { name: 'EmergencyContactName', label: 'Emergency contact name' },
    { name: 'EmergencyContactPhone', label: 'Emergency contact mobile' },
    { type: 'section', label: 'Job and salary' },
    { name: 'JoiningDate', label: 'Joining date', type: 'date', required: true },
    { name: 'MonthlySalary', label: 'Monthly salary (INR)', type: 'number', required: true },
    { name: 'ContractorId', label: 'Contractor', type: 'select', options: cOpts },
    { name: 'PfApplicable', label: 'Provident fund', type: 'checkbox', hint: 'PF applicable' },
    { name: 'EsiApplicable', label: 'ESI', type: 'checkbox', hint: 'ESI applicable' },
    { type: 'section', label: 'Identity and bank' },
    { name: 'AadhaarNo', label: 'Aadhaar number' },
    { name: 'PanNo', label: 'PAN' },
    { name: 'UanNo', label: 'UAN' },
    { name: 'EsicNo', label: 'ESIC number' },
    { name: 'BankName', label: 'Bank name' },
    { name: 'AccountNo', label: 'Account number' },
    { name: 'IfscCode', label: 'IFSC code' },
    { name: 'IsActive', label: 'Status', type: 'checkbox', hint: 'Active guard', editOnly: true },
  ], [cOpts]);

  const allColumns = [
    { header: 'Code', key: 'GuardCode' },
    { header: 'Guard', render: (r) => <div><Link to={`/guards/${r.GuardId}`} className="font-medium hover:underline">{r.FullName}</Link><p className="text-xs text-steel">{r.Phone}</p></div> },
    { header: 'Posted at', render: (r) => r.SiteName ? <div><p>{r.SiteName}</p><p className="text-xs text-steel">{r.CompanyName} - {r.Shift}</p></div> : (r.IsActive ? <Badge tone="warn">Not assigned</Badge> : '-') },
    { header: 'Contractor', render: (r) => r.ContractorName || 'Direct' },
    { header: 'Salary', render: (r) => formatINR(r.MonthlySalary) },
    { header: 'Status', render: (r) => <Badge tone={r.IsActive ? 'ok' : 'neutral'}>{r.IsActive ? 'Active' : 'Inactive'}</Badge> },
  ];

  const columns = isAdmin ? allColumns : allColumns.filter((c) => c.header !== 'Salary');

  const rowActions = (r) => (
    <>
      <Link to={`/guards/${r.GuardId}`} className="btn-ghost btn-sm" aria-label="View guard"><Eye size={14} /></Link>
      {isAdmin && r.IsActive && (
        <button className="btn-ghost btn-sm" aria-label="Assign to site" title="Assign / transfer" onClick={() => navigate('/deployments', { state: { guardId: r.GuardId } })}><Route size={14} /></button>
      )}
    </>
  );

  return (
    <CrudPage title="Guards" subtitle="All security personnel and where they are posted" noun="guard" stateKey="guards" actions={guards.actions}
      idKey="GuardId" columns={columns} fields={fields} size="lg" rowActions={rowActions}
      defaults={{ IsActive: true, PfApplicable: false, EsiApplicable: false, MonthlySalary: '', JoiningDate: new Date().toLocaleDateString('en-CA') }}
      searchHint="Search name, code, mobile, Aadhaar, site"
      filters={[
        { key: 'isActive', label: 'All statuses', options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] },
        { key: 'unassigned', label: 'All guards', options: [{ value: 1, label: 'Not assigned to a site' }] },
        { key: 'clientId', label: 'All clients', options: clOpts },
        { key: 'contractorId', label: 'All contractors', options: cOpts },
      ]} />
  );
}
