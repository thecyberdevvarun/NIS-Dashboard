import CrudPage from '../components/CrudPage';
import { Badge } from '../components/ui';
import { clients } from '../features/entities';
import { formatDate } from '../utils/format';

const fields = [
  { name: 'CompanyName', label: 'Company name', required: true, span: 2 },
  { name: 'ContactPerson', label: 'Contact person' },
  { name: 'Phone', label: 'Phone' },
  { name: 'Email', label: 'Email', type: 'email' },
  { name: 'GstNo', label: 'GST number' },
  { name: 'Address', label: 'Address', type: 'textarea', span: 2 },
  { name: 'City', label: 'City' },
  { name: 'ContractStart', label: 'Contract start', type: 'date' },
  { name: 'ContractEnd', label: 'Contract end', type: 'date' },
  { name: 'IsActive', label: 'Status', type: 'checkbox', hint: 'Active client', editOnly: true },
];

const columns = [
  { header: 'Company', render: (r) => <div><p className="font-medium">{r.CompanyName}</p><p className="text-xs text-steel">{r.City || ''}</p></div> },
  { header: 'Contact', render: (r) => <div><p>{r.ContactPerson || '-'}</p><p className="text-xs text-steel">{r.Phone || ''}</p></div> },
  { header: 'GST', key: 'GstNo' },
  { header: 'Sites', key: 'SiteCount' },
  { header: 'Guards', key: 'GuardCount' },
  { header: 'Contract', render: (r) => `${formatDate(r.ContractStart)}${r.ContractEnd ? ` to ${formatDate(r.ContractEnd)}` : ''}` },
  { header: 'Status', render: (r) => <Badge tone={r.IsActive ? 'ok' : 'neutral'}>{r.IsActive ? 'Active' : 'Inactive'}</Badge> },
];

export default function Clients() {
  return (
    <CrudPage title="Clients" subtitle="Companies you provide security to" noun="client" stateKey="clients" actions={clients.actions}
      idKey="ClientId" columns={columns} fields={fields} defaults={{ IsActive: true }}
      filters={[{ key: 'isActive', label: 'All statuses', options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] }]} />
  );
}
