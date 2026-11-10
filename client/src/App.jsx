import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute, { PageGate } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guards from './pages/Guards';
import GuardDetail from './pages/GuardDetail';
import Clients from './pages/Clients';
import Sites from './pages/Sites';
import Contractors from './pages/Contractors';
import Deployments from './pages/Deployments';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import Users from './pages/Users';
import AccessControl from './pages/AccessControl';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<PageGate page="dashboard" />}><Route index element={<Dashboard />} /></Route>
          <Route element={<PageGate page="guards" />}>
            <Route path="guards" element={<Guards />} />
            <Route path="guards/:id" element={<GuardDetail />} />
          </Route>
          <Route element={<PageGate page="deployments" />}><Route path="deployments" element={<Deployments />} /></Route>
          <Route element={<PageGate page="attendance" />}><Route path="attendance" element={<Attendance />} /></Route>
          <Route element={<PageGate page="payroll" />}><Route path="payroll" element={<Payroll />} /></Route>
          <Route element={<PageGate page="clients" />}><Route path="clients" element={<Clients />} /></Route>
          <Route element={<PageGate page="sites" />}><Route path="sites" element={<Sites />} /></Route>
          <Route element={<PageGate page="contractors" />}><Route path="contractors" element={<Contractors />} /></Route>
          <Route element={<PageGate page="reports" />}><Route path="reports" element={<Reports />} /></Route>
          <Route element={<PageGate page="access" />}><Route path="access" element={<AccessControl />} /></Route>
          <Route element={<PageGate page="users" />}><Route path="users" element={<Users />} /></Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
