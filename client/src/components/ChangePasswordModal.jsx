import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../features/authSlice';
import { Field, Modal } from './ui';

export default function ChangePasswordModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };
  const username = useSelector((s) => s.auth.user?.username);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Enter your current password';
    if (form.newPassword.length < 8) errs.newPassword = 'Use at least 8 characters';
    else if (form.newPassword === form.currentPassword) errs.newPassword = 'New password must be different';
    if (form.confirm !== form.newPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await dispatch(changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })).unwrap();
      onClose();
    } catch { /* toast shown by api layer */ } finally { setBusy(false); }
  };

  return (
    <Modal title="Change password" onClose={onClose} size="sm">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <input type="text" name="username" value={username || ''} autoComplete="username" readOnly hidden />
        <Field label="Current password" error={errors.currentPassword}>
          <input type="password" className="input" autoFocus autoComplete="current-password" value={form.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} />
        </Field>
        <Field label="New password" error={errors.newPassword}>
          <input type="password" className="input" autoComplete="new-password" value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <input type="password" className="input" autoComplete="new-password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Change password'}</button>
        </div>
      </form>
    </Modal>
  );
}
