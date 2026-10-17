import { configureStore } from '@reduxjs/toolkit';
import auth, { logout } from '../features/authSlice';
import dashboard from '../features/dashboardSlice';
import attendance from '../features/attendanceSlice';
import payroll from '../features/payrollSlice';
import reports from '../features/reportsSlice';
import deployments from '../features/deploymentsSlice';
import { guards, clients, sites, contractors } from '../features/entities';

export const store = configureStore({
  reducer: {
    auth,
    dashboard,
    attendance,
    payroll,
    reports,
    deployments,
    guards: guards.reducer,
    clients: clients.reducer,
    sites: sites.reducer,
    contractors: contractors.reducer,
  },
});

// Axios fires this when the API answers 401 (token expired).
window.addEventListener('auth:logout', () => store.dispatch(logout()));
