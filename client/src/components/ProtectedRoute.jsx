import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ adminOnly }) {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user?.role !== 'Admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
