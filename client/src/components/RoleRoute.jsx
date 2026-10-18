import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function RoleRoute({ role }) {
  const { user } = useAuth();
  return user?.role === role ? <Outlet /> : <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}
