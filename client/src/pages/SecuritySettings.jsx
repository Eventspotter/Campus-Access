import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { confirmMfa, disableMfa, setupMfa } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function SecuritySettings() {
  const { user, restore } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(action, event) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      if (action === 'setup') setEnrollment(await setupMfa(data.get('password')));
      if (action === 'confirm') {
        const result = await confirmMfa(data.get('code'));
        setEnrollment(null);
        setRecoveryCodes(result.recoveryCodes);
        await restore();
        setMessage('Authenticator verification is enabled. Save your recovery codes now.');
      }
      if (action === 'disable') {
        await disableMfa(data.get('password'), data.get('code'));
        setRecoveryCodes(null);
        await restore();
        setMessage('Authenticator verification is disabled.');
      }
      form.reset();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <><Navbar /><main id="main-content" tabIndex={-1} className="page-shell max-w-4xl">
    <p className="eyebrow">Account / Security</p><h1 className="page-title">Protect your account.</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">An authenticator app adds a code after your password. Recovery codes let you sign in if your device is unavailable.</p>
    {error && <Alert variant="destructive" className="mt-6"><AlertDescription>{error}</AlertDescription></Alert>}
    {message && <Alert role="status" className="mt-6 border-emerald-200 bg-emerald-50 text-emerald-900"><AlertDescription className="text-inherit">{message}</AlertDescription></Alert>}
    <Card className="mt-8 gap-0 p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Authenticator verification</h2><Badge variant="secondary">{user.mfaEnabled ? 'Enabled' : 'Not enabled'}</Badge></div>
      {!user.mfaEnabled && !enrollment && <form onSubmit={event => submit('setup', event)} className="mt-6 max-w-sm space-y-4"><p className="text-sm leading-6 text-muted-foreground">Enter your current password to start setup.</p><FormInput label="Current password" name="password" type="password" autoComplete="current-password" required /><Button type="submit" className="h-10" disabled={busy}>{busy ? 'Starting…' : 'Set up authenticator'}</Button></form>}
      {!user.mfaEnabled && enrollment && <div className="mt-6 grid gap-8 sm:grid-cols-[auto_1fr]"><div className="w-fit rounded-xl border border-border bg-white p-4"><QRCodeSVG value={enrollment.uri} size={176} title="Scan this code with your authenticator app" /></div><div><p className="text-sm leading-6 text-muted-foreground">Scan the code with your authenticator app, or enter this key manually:</p><code className="mt-3 block break-all rounded-lg bg-muted p-3 text-sm">{enrollment.secret}</code><form onSubmit={event => submit('confirm', event)} className="mt-5 max-w-sm space-y-4"><FormInput label="Six-digit code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /><Button type="submit" className="h-10" disabled={busy}>{busy ? 'Checking…' : 'Enable verification'}</Button></form></div></div>}
      {user.mfaEnabled && <form onSubmit={event => submit('disable', event)} className="mt-6 max-w-sm space-y-4"><p className="text-sm leading-6 text-muted-foreground">To turn this off, enter your password and a current authenticator or unused recovery code.</p><FormInput label="Current password" name="password" type="password" autoComplete="current-password" required /><FormInput label="Authenticator or recovery code" name="code" autoComplete="one-time-code" maxLength={32} required /><Button type="submit" variant="outline" className="h-10" disabled={busy}>{busy ? 'Checking…' : 'Disable verification'}</Button></form>}
    </Card>
    {recoveryCodes && <Card className="mt-6 gap-0 border border-amber-300 p-6 sm:p-8"><h2 className="text-xl font-semibold">Save your recovery codes</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Each code works once. Store them somewhere private; they will not be shown again.</p><ul className="mt-5 grid gap-2 font-mono text-sm sm:grid-cols-2">{recoveryCodes.map(code => <li key={code} className="break-all rounded-lg bg-muted p-3">{code}</li>)}</ul><Button type="button" variant="outline" className="mt-5 h-10" onClick={() => setRecoveryCodes(null)}>I saved these codes</Button></Card>}
  </main></>;
}
