import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, logout } from '../features/authSlice';
import { Spinner } from './ui';
import { ADMIN_PAGES, PAGES } from './navConfig';

/** Needs a login. Reloads the user (role + allowed pages) once when the app opens. */
export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();

  useEffect(() => { if (token) dispatch(fetchMe()); }, [dispatch, token]);

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user?.pages) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  return <Outlet />;
}

function NoAccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="card mx-auto mt-16 max-w-md p-8 text-center">
      <h1 className="text-xl font-semibold">No pages available</h1>
      <p className="mt-2 text-sm text-steel">Your account does not have access to any page yet. Please ask the Admin to give you access.</p>
      <button className="btn-primary mt-5" onClick={() => { dispatch(logout()); navigate('/login'); }}>Sign out</button>
    </div>
  );
}

/** Shows the page only if Admin has allowed it for this role; otherwise goes to the first allowed page. */
export function PageGate({ page }) {
  const user = useSelector((s) => s.auth.user);
  if (user.pages.includes(page)) return <Outlet />;
  const first = [...PAGES, ...ADMIN_PAGES].find((p) => user.pages.includes(p.key));
  return first ? <Navigate to={first.path} replace /> : <NoAccess />;
}
