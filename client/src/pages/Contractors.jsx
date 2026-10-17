import CrudPage from '../components/CrudPage';
import { Badge } from '../components/ui';
import { contractors } from '../features/entities';

const fields = [
  { name: 'Name', label: 'Contractor / agency name', required: true, span: 2 },
  { name: 'ContactPerson', label: 'Contact person' },
  { name: 'Phone', label: 'Phone' },
  { name: 'Email', label: 'Email', type: 'email' },
  { name: 'PanNo', label: 'PAN' },
  { name: 'LicenseNo', label: 'Licence number' },
  { name: 'Address', label: 'Address', type: 'textarea', span: 2 },
  { name: 'IsActive', label: 'Status', type: 'checkbox', hint: 'Active contractor', editOnly: true },
];

const columns = [
  { header: 'Contractor', render: (r) => <p className="font-medium">{r.Name}</p> },
  { header: 'Contact', render: (r) => <div><p>{r.ContactPerson || '-'}</p><p className="text-xs text-steel">{r.Phone || ''}</p></div> },
  { header: 'PAN', key: 'PanNo' },
  { header: 'Licence', key: 'LicenseNo' },
  { header: 'Guards', key: 'GuardCount' },
  { header: 'Status', render: (r) => <Badge tone={r.IsActive ? 'ok' : 'neutral'}>{r.IsActive ? 'Active' : 'Inactive'}</Badge> },
];

export default function Contractors() {
  return (
    <CrudPage title="Contractors" subtitle="Agencies that supply guards to you" noun="contractor" stateKey="contractors" actions={contractors.actions}
      idKey="ContractorId" columns={columns} fields={fields} defaults={{ IsActive: true }} />
  );
}
