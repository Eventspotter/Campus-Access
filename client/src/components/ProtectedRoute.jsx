import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
export default function ProtectedRoute() {
  const { user, loading, error, restore } = useAuth();
  if (loading) return <main className="status-screen" role="status">Opening your workspace…</main>;
  if (error) return <main className="status-screen"><p role="alert">{error}</p><Button onClick={restore} className="mt-5 h-10">Try again</Button></main>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
