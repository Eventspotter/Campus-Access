import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { LogOut, User, Shield, GraduationCap, Briefcase } from 'lucide-react';

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
      setError(err.message || 'Logout failed.');
    } finally {
      setBusy(false);
    }
  }

  const getRoleIcon = () => {
    if (user?.role === 'admin') return <Shield className="size-3.5 text-primary" />;
    if (user?.role === 'faculty') return <Briefcase className="size-3.5 text-indigo-500" />;
    return <GraduationCap className="size-3.5 text-cyan-500" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md shadow-xs">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3.5" aria-label="Main navigation">
          {/* Logo */}
          <a href={`/${user?.role || 'login'}`} className="flex items-center gap-3 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-xs font-bold text-sm">
              CA
            </div>
            <div>
              <span className="font-bold text-foreground">Campus Access</span>
              <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest -mt-0.5">
                Authentication Portal
              </span>
            </div>
          </a>

          {/* User profile & actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 shadow-xs">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                {user?.name ? user.name[0] : <User className="size-3.5" />}
              </div>
              <span className="text-xs font-medium text-foreground max-w-[150px] truncate">{user?.name}</span>
              <Badge variant="outline" className="flex items-center gap-1 text-[10px] capitalize font-medium py-0 px-2 h-5 bg-card">
                {getRoleIcon()}
                {user?.role}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={handleLogout}
              className="h-8 gap-1.5 text-xs font-medium border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>{busy ? 'Signing out…' : 'Sign out'}</span>
            </Button>
          </div>
        </nav>
      </header>

      {error && (
        <Alert variant="destructive" className="mx-auto mt-4 max-w-7xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
