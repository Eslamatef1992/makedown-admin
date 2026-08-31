import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

// A school's token is only ever accepted by the API on its own game
// sessions (see makedown-api adminOrSchoolAuth.middleware.js) — this mirrors
// that on the frontend so a school never even sees a nav item or URL for
// anything else. Pass schoolAllowed on the one route schools are meant to use.
export default function ProtectedRoute({ children, schoolAllowed = false }) {
  const { isAuthenticated, loading, role } = useAdminAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role === 'school' && !schoolAllowed) return <Navigate to="/game-sessions" replace />;
  return children;
}
