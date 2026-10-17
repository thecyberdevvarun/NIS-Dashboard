import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="guards" element={<Guards />} />
          <Route path="guards/:id" element={<GuardDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="sites" element={<Sites />} />
          <Route path="contractors" element={<Contractors />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="payroll" element={<Payroll />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
