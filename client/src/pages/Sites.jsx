import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CrudPage from '../components/CrudPage';
import { Badge } from '../components/ui';
import { clients, sites } from '../features/entities';

const columns = [
  { header: 'Site', render: (r) => <div><p className="font-medium">{r.SiteName}</p><p className="text-xs text-steel">{r.City || ''}</p></div> },
  { header: 'Company', key: 'CompanyName' },
  { header: 'Supervisor', key: 'SupervisorName' },
  {
    header: 'Guards',
    render: (r) => (
      <span className="flex items-center gap-2">
        {r.DeployedGuards} / {r.RequiredGuards}
        {r.DeployedGuards < r.RequiredGuards && <Badge tone="warn">Short by {r.RequiredGuards - r.DeployedGuards}</Badge>}
      </span>
    ),
  },
  { header: 'Status', render: (r) => <Badge tone={r.IsActive ? 'ok' : 'neutral'}>{r.IsActive ? 'Active' : 'Inactive'}</Badge> },
];

export default function Sites() {
  const dispatch = useDispatch();
  const clientOptions = useSelector((s) => s.clients.options);
  useEffect(() => { dispatch(clients.actions.fetchOptions()); }, [dispatch]);
  const opts = useMemo(() => clientOptions.map((c) => ({ value: c.ClientId, label: c.CompanyName })), [clientOptions]);

  const fields = useMemo(() => [
    { name: 'ClientId', label: 'Client company', type: 'select', options: opts, required: true, span: 2 },
    { name: 'SiteName', label: 'Site name', required: true, span: 2 },
    { name: 'Address', label: 'Address', type: 'textarea', span: 2 },
    { name: 'City', label: 'City' },
    { name: 'SupervisorName', label: 'Site supervisor' },
    { name: 'RequiredGuards', label: 'Guards required', type: 'number', required: true },
    { name: 'IsActive', label: 'Status', type: 'checkbox', hint: 'Active site', editOnly: true },
  ], [opts]);

  return (
    <CrudPage title="Sites" subtitle="Locations where your guards are posted" noun="site" stateKey="sites" actions={sites.actions}
      idKey="SiteId" columns={columns} fields={fields} defaults={{ IsActive: true, RequiredGuards: 1 }}
      filters={[{ key: 'clientId', label: 'All clients', options: opts }]} />
  );
}
