import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Shield } from 'lucide-react';
import { login } from '../features/authSlice';
import { Field } from '../components/ui';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});

  if (token) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim()) errs.username = 'Enter your username';
    if (!form.password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await dispatch(login({ username: form.username.trim(), password: form.password })).unwrap();
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch { /* toast shown by api layer */ }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-ink-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3"><Shield className="text-signal" size={32} /><span className="text-xl font-semibold">Neha Industrial Security</span></div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">Every guard, every post, every payday in one place.</h1>
          <p className="mt-4 max-w-md text-white/70">Deployments, attendance and payroll for all your sites, without the register.</p>
        </div>
        <p className="text-sm text-white/50">Authorised staff only</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={submit} noValidate className="card w-full max-w-sm space-y-4 p-6">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <Field label="Username" error={errors.username}>
            <input className="input" autoFocus autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
