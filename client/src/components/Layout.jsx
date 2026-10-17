import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Briefcase, Building2, CalendarCheck, LayoutDashboard, LogOut, MapPin, Menu, Route, Shield, Users, Wallet, X } from 'lucide-react';
import { fetchMe, logout } from '../features/authSlice';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/guards', label: 'Guards', icon: Users },
  { to: '/deployments', label: 'Deployments', icon: Route },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/payroll', label: 'Payroll', icon: Wallet, adminOnly: true },
  { to: '/clients', label: 'Clients', icon: Building2 },
  { to: '/sites', label: 'Sites', icon: MapPin },
  { to: '/contractors', label: 'Contractors', icon: Briefcase },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);

  useEffect(() => { dispatch(fetchMe()); }, [dispatch]); // validates the saved session

  const signOut = () => { dispatch(logout()); navigate('/login'); };
  const items = NAV.filter((n) => !n.adminOnly || user?.role === 'Admin');

  const sidebar = (
    <nav className="flex h-full flex-col bg-ink-900 text-white">
      <div className="flex items-center gap-3 border-b border-ink-700 px-5 py-5">
        <Shield className="text-signal" size={26} />
        <div className="leading-tight">
          <p className="font-semibold">Neha Industrial</p>
          <p className="text-xs text-white/60">Security Management</p>
        </div>
      </div>
      <ul className="flex-1 space-y-0.5 py-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 border-l-4 px-5 py-2.5 text-sm transition-colors ${isActive ? 'border-signal bg-ink-800 font-medium text-white' : 'border-transparent text-white/70 hover:bg-ink-800 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="border-t border-ink-700 p-4">
        <p className="truncate text-sm font-medium">{user?.name}</p>
        <p className="mb-3 text-xs text-white/60">{user?.role}</p>
        <button onClick={signOut} className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><LogOut size={16} /> Sign out</button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 lg:block"><div className="fixed inset-y-0 w-60">{sidebar}</div></aside>
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <span className="font-semibold">Neha Industrial Security</span>
        </header>
        <main className="mx-auto p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
