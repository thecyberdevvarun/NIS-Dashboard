import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Lock } from 'lucide-react';
import { fetchAccess, saveAccess } from '../features/accessSlice';
import { PageHeader, Spinner } from '../components/ui';

const ROLE_INFO = {
  Supervisor: { label: 'Supervisor', note: 'Can view data and mark attendance' },
  User: { label: 'End User', note: 'View only' },
};

export default function AccessControl() {
  const dispatch = useDispatch();
  const { pages, roles, matrix, loading, saving } = useSelector((s) => s.access);
  const [draft, setDraft] = useState(null);

  useEffect(() => { dispatch(fetchAccess()); }, [dispatch]);
  useEffect(() => { if (pages.length) setDraft(JSON.parse(JSON.stringify(matrix))); }, [matrix, pages.length]);

  const dirty = useMemo(() => draft && JSON.stringify(sortKeys(draft)) !== JSON.stringify(sortKeys(matrix)), [draft, matrix]);

  if (!draft || (loading && !pages.length)) return <div className="flex justify-center py-20"><Spinner /></div>;

  const has = (role, key) => draft[role].includes(key);
  const toggle = (role, key) => setDraft((d) => ({ ...d, [role]: has(role, key) ? d[role].filter((k) => k !== key) : [...d[role], key] }));
  const setAll = (role, on) => setDraft((d) => ({ ...d, [role]: on ? pages.map((p) => p.key) : [] }));

  return (
    <>
      <PageHeader title="Page Access" subtitle="Choose which pages each type of user can see in the menu">
        {dirty && <span className="text-sm text-signal-dark">Unsaved changes</span>}
        <button className="btn-ghost" disabled={!dirty || saving} onClick={() => setDraft(JSON.parse(JSON.stringify(matrix)))}>Discard</button>
        <button className="btn-primary" disabled={!dirty || saving} onClick={() => dispatch(saveAccess(draft))}>{saving ? 'Saving...' : 'Save changes'}</button>
      </PageHeader>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr>
              <th className="th">Page</th>
              <th className="th text-center">
                <p>Admin</p><p className="font-normal">Always full access</p>
              </th>
              {roles.map((r) => (
                <th key={r} className="th text-center">
                  <p>{ROLE_INFO[r].label}</p>
                  <p className="font-normal">{ROLE_INFO[r].note}</p>
                  <p className="mt-1 font-normal">
                    <button className="underline" onClick={() => setAll(r, true)}>All</button>{' / '}
                    <button className="underline" onClick={() => setAll(r, false)}>None</button>
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.key} className="hover:bg-paper/60">
                <td className="td font-medium">{p.label}</td>
                <td className="td text-center"><Lock size={15} className="mx-auto text-steel" aria-label="Always allowed" /></td>
                {roles.map((r) => (
                  <td key={r} className="td text-center">
                    <button role="checkbox" aria-checked={has(r, p.key)} aria-label={`${p.label} for ${ROLE_INFO[r].label}`} onClick={() => toggle(r, p.key)}
                      className={`mx-auto flex h-6 w-6 items-center justify-center rounded border transition-colors ${has(r, p.key) ? 'border-ok bg-ok text-white' : 'border-line bg-white hover:bg-paper'}`}>
                      {has(r, p.key) && <Check size={14} />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-ink-700 md:grid-cols-2">
        <div className="card p-4"><p className="mb-1 font-semibold">What a ticked page means</p>The page shows in that user's menu and its data can be opened. Add, edit and delete are always Admin only. Supervisors can also mark attendance.</div>
        <div className="card p-4"><p className="mb-1 font-semibold">Always protected</p>Salary and bank details on Guards and Reports are always hidden from non-Admins. If you tick Payroll for a role, they can view payroll amounts but only Admin can generate or pay. Page Access and Users are Admin only. People already signed in see changes after they refresh.</div>
      </div>
    </>
  );
}

const sortKeys = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [...v].sort()]));
