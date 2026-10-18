import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    setError('');
    try {
      await logout();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="border-b border-border bg-card">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4" aria-label="Main navigation">
          <a href={`/${user?.role || 'login'}`} className="flex items-center gap-3 font-semibold tracking-tight text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              CA
            </span>
            <span>Campus Access</span>
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize text-secondary-foreground">
              {user?.role}
            </span>
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={handleLogout}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
            >
              {busy ? 'Signing out…' : 'Sign out ↗'}
            </button>
          </div>
        </nav>
      </header>
      {error && (
        <div className="mx-auto mt-4 max-w-7xl px-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}
    </>
  );
}
