import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../api/auth.api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
export default function PasswordRecovery({ reset = false }) {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const result = reset ? await resetPassword(params.get('token'), data.get('password')) : await requestPasswordReset(data.get('email'));
      setMessage(result.message);
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <main id="main-content" className="login-canvas flex min-h-screen items-center justify-center px-4"><div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl"><Link to="/login" className="text-sm text-primary hover:underline">← Back to sign in</Link><h1 className="mt-8 font-serif text-3xl">{reset ? 'Set a new password' : 'Recover your account'}</h1><p className="mt-2 text-sm text-muted-foreground">{reset ? 'Choose a new password for your account.' : 'Enter your account email to receive a time-limited reset link.'}</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-medium">{reset ? 'New password' : 'Email address'}<Input className="mt-2 h-11" name={reset ? 'password' : 'email'} type={reset ? 'password' : 'email'} minLength={reset ? 10 : undefined} maxLength={reset ? 72 : 254} autoComplete={reset ? 'new-password' : 'email'} required /></label><Button className="h-11 w-full" disabled={busy}>{busy ? 'Please wait…' : reset ? 'Reset password' : 'Send reset link'}</Button></form>{message && <p role="status" className="mt-5 text-sm">{message}</p>}</div></main>;
}
