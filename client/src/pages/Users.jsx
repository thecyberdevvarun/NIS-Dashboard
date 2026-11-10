import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRound } from 'lucide-react';
import CrudPage from '../components/CrudPage';
import { Badge, Field, Modal } from '../components/ui';
import { roleLabel } from '../components/navConfig';
import { users } from '../features/entities';
import { resetUserPassword } from '../features/userActions';
import { formatDate } from '../utils/format';

const ROLE_OPTIONS = [{ value: 'Admin', label: 'Admin' }, { value: 'Supervisor', label: 'Supervisor' }, { value: 'User', label: 'End User' }];
const TONE = { Admin: 'ok', Supervisor: 'warn', User: 'neutral' };

const fields = [
  { name: 'FullName', label: 'Full name', required: true, span: 2 },
  { name: 'Username', label: 'Username', required: true, createOnly: true },
  { name: 'Password', label: 'Password (min 8 characters)', type: 'password', required: true, createOnly: true },
  { name: 'Role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true, span: 2 },
  { name: 'IsActive', label: 'Status', type: 'checkbox', hint: 'Account active (can sign in)', editOnly: true },
];

const columns = [
  { header: 'Name', render: (r) => <p className="font-medium">{r.FullName}</p> },
  { header: 'Username', key: 'Username' },
  { header: 'Role', render: (r) => <Badge tone={TONE[r.Role]}>{roleLabel(r.Role)}</Badge> },
  { header: 'Created', render: (r) => formatDate(r.CreatedAt) },
  { header: 'Status', render: (r) => <Badge tone={r.IsActive ? 'ok' : 'neutral'}>{r.IsActive ? 'Active' : 'Disabled'}</Badge> },
];

export default function Users() {
  const dispatch = useDispatch();
  const saving = useSelector((s) => s.users.saving);
  const [target, setTarget] = useState(null);
  const [pw, setPw] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return;
    try { await dispatch(resetUserPassword({ id: target.UserId, newPassword: pw })).unwrap(); setTarget(null); setPw(''); } catch { /* toast shown */ }
  };

  const rowActions = (r) => (
    <button className="btn-ghost btn-sm" title="Reset password" aria-label="Reset password" onClick={() => { setTarget(r); setPw(''); }}><KeyRound size={14} /></button>
  );

  return (
    <>
      <CrudPage title="Users" subtitle="People who can sign in to this software" noun="user" stateKey="users" actions={users.actions}
        idKey="UserId" columns={columns} fields={fields} defaults={{ IsActive: true, Role: 'Supervisor' }} rowActions={rowActions}
        searchHint="Search name or username" size="sm" />
      {target && (
        <Modal title={`Reset password - ${target.FullName}`} onClose={() => setTarget(null)} size="sm">
          <form onSubmit={submit} className="space-y-4">
            <Field label="New password (min 8 characters)">
              <input type="text" className="input" autoFocus autoComplete="off" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <p className="text-xs text-steel">Share this password with the user. They can change it themselves from the menu.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setTarget(null)}>Cancel</button>
              <button className="btn-primary" disabled={saving || pw.length < 8}>Reset password</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
