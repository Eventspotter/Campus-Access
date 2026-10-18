import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading, error, restore } = useAuth();
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground" role="status">
        Opening your workspace…
      </main>
    );
  }
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p role="alert" className="text-sm text-destructive">{error}</p>
        <button
          onClick={restore}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </main>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
