/** Pages Admin can show or hide per role. Admin always sees all of them plus the admin pages below. */
const PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'guards', label: 'Guards' },
  { key: 'deployments', label: 'Deployments' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'clients', label: 'Clients' },
  { key: 'sites', label: 'Sites' },
  { key: 'contractors', label: 'Contractors' },
  { key: 'reports', label: 'Reports' },
];
const PAGE_KEYS = PAGES.map((p) => p.key);
const ADMIN_PAGES = ['access', 'users'];
const ROLES = ['Admin', 'Supervisor', 'User'];
const CONFIGURABLE_ROLES = ['Supervisor', 'User'];
export { PAGES, PAGE_KEYS, ADMIN_PAGES, ROLES, CONFIGURABLE_ROLES };
