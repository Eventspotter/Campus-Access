import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function LoginPage() {
  const { user, loading, login, error: connectionError, restore } = useAuth();
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const result = await login({ email: data.get('email'), password: data.get('password'),
        ...(mfaRequired ? { mfaCode: data.get('mfaCode') } : {}) });
      if (result.mfaRequired) setMfaRequired(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  if (loading) return <main id="main-content" className="status-screen" role="status">Opening Campus Access…</main>;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return <main id="main-content" className="login-canvas min-h-screen px-4 py-8 sm:px-8">
    <div className="login-card mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/80 shadow-[0_30px_80px_rgba(31,36,70,.18)] lg:grid-cols-[1.05fr_.95fr]">
      <div className="login-art relative flex min-h-64 items-center justify-center overflow-hidden p-8 lg:min-h-[590px]">
        <div aria-hidden="true" className="login-orb login-orb-one" /><div aria-hidden="true" className="login-orb login-orb-two" />
        <img src="/campus-login-art.png" alt="Illustration of learning and digital access" className="relative z-10 w-full max-w-[460px] object-contain" />
      </div>
      <section className="flex flex-col justify-center bg-card px-7 py-10 sm:px-12 lg:px-14">
        <div className="mb-10 flex items-center gap-3 text-sm font-bold uppercase tracking-[.16em] text-primary"><img src="/favicon.svg" alt="" className="size-10" />Campus Access</div>
        <p className="eyebrow">Your secure workspace</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground">Sign in to your account</h1>
        {connectionError && <Alert variant="destructive" className="mt-5"><AlertDescription>{connectionError} <Button type="button" variant="link" onClick={restore}>Retry</Button></AlertDescription></Alert>}
        <form onSubmit={submit} className="mt-9 space-y-5">
          <FormInput label="Email address" name="email" type="email" icon={Mail} placeholder="Email address" autoComplete="username" maxLength={254} required />
          <div className="relative"><FormInput label="Password" name="password" type={showPassword ? 'text' : 'password'} icon={LockKeyhole} placeholder="Password" autoComplete="current-password" required /><button type="button" className="absolute bottom-2 right-2 rounded-md p-2 text-muted-foreground hover:text-primary" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {mfaRequired && <FormInput label="Authenticator or recovery code" name="mfaCode" autoComplete="one-time-code" placeholder="6-digit or recovery code" maxLength={32} required />}
          <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Forgot password?</Link></div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Button type="submit" className="h-12 w-full justify-center gap-3 rounded-lg" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight aria-hidden="true" size={18} /></Button>
        </form>
        <p className="mt-10 text-sm text-muted-foreground">Need an account? <span className="font-medium text-foreground">Ask your administrator for access.</span></p>
      </section>
    </div>
  </main>;
}
