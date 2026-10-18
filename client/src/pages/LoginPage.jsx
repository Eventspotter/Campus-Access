import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

export default function LoginPage() {
  const { user, loading, login, error: connectionError, restore } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      await login({
        email: data.get('email'),
        password: data.get('password')
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center text-muted-foreground" role="status">
        Opening Campus Access…
      </main>
    );
  }

  if (user) return <Navigate to={`/${user.role}`} replace />;

  return (
    <main id="main-content" className="login-canvas min-h-screen px-4 py-8 sm:px-8 flex items-center justify-center">
      <div className="login-card mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/80 shadow-[0_30px_80px_rgba(31,36,70,.18)] lg:grid-cols-[1.05fr_.95fr] bg-card">
        {/* Left Side: Illustration */}
        <div className="login-art relative flex min-h-64 items-center justify-center overflow-hidden p-8 lg:min-h-[580px] bg-gradient-to-br from-blue-50/60 to-purple-50/40">
          <img
            src="/campus-login-art.png"
            alt="Campus digital access illustration"
            className="relative z-10 w-full max-w-[420px] object-contain drop-shadow-sm"
          />
        </div>

        {/* Right Side: Login Form */}
        <section className="flex flex-col justify-center px-7 py-10 sm:px-12 lg:px-14">
          <div className="mb-8 flex items-center gap-3 text-sm font-bold uppercase tracking-[.16em] text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              CA
            </span>
            Campus Access
          </div>

          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Your secure workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">Sign in to your account</h1>

          {connectionError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
              <span>{connectionError}</span>
              <button type="button" onClick={restore} className="font-semibold underline ml-2">Retry</button>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4">
            <FormInput
              label="Email address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="e.g. admin@example.com"
              autoComplete="username"
              maxLength={254}
              required
            />

            <div className="relative">
              <FormInput
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                icon={LockKeyhole}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute bottom-2.5 right-2.5 rounded-md p-1.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {busy ? 'Signing in…' : 'Sign in'}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">
            Need an account? <span className="font-medium text-foreground">Ask your administrator for access.</span>
          </p>
        </section>
      </div>
    </main>
  );
}
