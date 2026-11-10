import { BarChart3, Briefcase, Building2, CalendarCheck, LayoutDashboard, MapPin, Route, ShieldCheck, UserCog, Users, Wallet } from 'lucide-react';

/** Menu items. `key` must match the page keys used by the server (config/pages.js). */
export const PAGES = [
  { key: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { key: 'guards', label: 'Guards', path: '/guards', icon: Users },
  { key: 'deployments', label: 'Deployments', path: '/deployments', icon: Route },
  { key: 'attendance', label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { key: 'payroll', label: 'Payroll', path: '/payroll', icon: Wallet },
  { key: 'clients', label: 'Clients', path: '/clients', icon: Building2 },
  { key: 'sites', label: 'Sites', path: '/sites', icon: MapPin },
  { key: 'contractors', label: 'Contractors', path: '/contractors', icon: Briefcase },
  { key: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
];

export const ADMIN_PAGES = [
  { key: 'access', label: 'Page Access', path: '/access', icon: ShieldCheck },
  { key: 'users', label: 'Users', path: '/users', icon: UserCog },
];

export const roleLabel = (role) => (role === 'User' ? 'End User' : role);
