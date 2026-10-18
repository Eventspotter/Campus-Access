import { useEffect, useState } from 'react';
import { createAccount, listAccounts, setAccountActive, changeAccountPassword } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';

export default function AdminDashboard() {
  const { user: admin, logout } = useAuth();
  const [role, setRole] = useState('faculty');
  const [accounts, setAccounts] = useState({ faculty: [], student: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwRole, setPwRole] = useState('');

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const [faculty, student] = await Promise.all([
        listAccounts('faculty'),
        listAccounts('student')
      ]);
      setAccounts({ faculty: faculty.users, student: student.users });
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAccount(user) {
    setError('');
    setSuccess('');
    try {
      const result = await setAccountActive(role, user.id, !user.active);
      setAccounts(current => ({
        ...current,
        [role]: current[role].map(item => item.id === user.id ? result.user : item)
      }));
      setSuccess(`${user.name} is now ${result.user.active ? 'active' : 'inactive'}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form = event.currentTarget;
    try {
      const { user } = await createAccount(role, Object.fromEntries(new FormData(form)));
      setAccounts(current => ({ ...current, [role]: [user, ...current[role]] }));
      form.reset();
      setSuccess(`${user.name}'s ${role} account created successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const result = await changeAccountPassword(values.accountId, values.newPassword);
      form.reset();
      setPwRole('');
      if (result.user.id === admin.id) {
        await logout();
      } else {
        setSuccess(`Password changed successfully for ${result.user.name}.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Overview</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Admin Workspace</h1>
          </div>
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-secondary-foreground">
            Admin Console
          </span>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
            {success}
          </div>
        )}

        {/* Account Counts Summary */}
        <div className="my-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Faculty Members</p>
            <p className="my-2 text-3xl font-bold tracking-tight text-foreground">
              {loading ? '—' : accounts.faculty.length.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">Teaching & staff</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Students</p>
            <p className="my-2 text-3xl font-bold tracking-tight text-foreground">
              {loading ? '—' : accounts.student.length.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">Student community</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Accounts</p>
            <p className="my-2 text-3xl font-bold tracking-tight text-foreground">
              {loading ? '—' : (accounts.faculty.length + accounts.student.length).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">Active in system</p>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border pb-3">
          <button
            type="button"
            className={`h-10 px-5 rounded-lg text-sm font-medium transition-colors ${role === 'faculty' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            onClick={() => { setRole('faculty'); setError(''); setSuccess(''); }}
          >
            Faculty ({accounts.faculty.length})
          </button>
          <button
            type="button"
            className={`h-10 px-5 rounded-lg text-sm font-medium transition-colors ${role === 'student' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            onClick={() => { setRole('student'); setError(''); setSuccess(''); }}
          >
            Students ({accounts.student.length})
          </button>
        </div>

        {/* Directory Table Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {role === 'faculty' ? 'Faculty Directory' : 'Student Directory'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                All registered {role === 'faculty' ? 'faculty accounts' : 'student accounts'}
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-muted-foreground" role="status">Loading accounts…</p>
          ) : loadError ? (
            <div className="p-6 text-sm text-destructive">{loadError}</div>
          ) : accounts[role].length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-medium text-foreground">No {role} accounts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add one using the form below.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">Name / Email</th>
                    {role === 'student' && <th className="px-4 py-3.5">Roll number</th>}
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts[role].map(user => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      {role === 'student' && (
                        <td className="px-4 py-4 font-mono text-xs font-semibold text-foreground">
                          {user.rollNumber || '—'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-xs text-foreground">
                        {user.department || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleAccount(user)}
                          className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                        >
                          {user.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lower Section: Add Account Form & Password Change */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Add Account Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Management</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Add a {role === 'faculty' ? 'Faculty Member' : 'Student'}
            </h2>
            <form key={role} onSubmit={submit} className="mt-6 space-y-4">
              <FormInput
                label="Full name"
                name="name"
                placeholder="First and last name"
                minLength={2}
                maxLength={80}
                required
              />
              <FormInput
                label="Email address"
                name="email"
                type="email"
                placeholder="e.g. name@university.edu"
                maxLength={254}
                required
              />
              {role === 'student' && (
                <FormInput
                  label="Roll number"
                  name="rollNumber"
                  placeholder="e.g. 24CS001"
                  pattern="[A-Za-z0-9-]{2,30}"
                  title="2–30 letters, numbers, or hyphens"
                  required
                />
              )}
              <FormInput
                label="Department"
                name="department"
                placeholder="e.g. Computer Science"
                maxLength={80}
              />
              <FormInput
                label="Initial password"
                name="password"
                type="password"
                placeholder="At least 10 characters"
                minLength={10}
                maxLength={72}
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {busy ? 'Creating account…' : `Create ${role} account`}
              </button>
            </form>
          </div>

          {/* Change Password Card (Requested by User) */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Security</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Change Account Password</h2>
            <p className="text-xs text-muted-foreground mt-1">Select a role, pick an account name, and assign a new password.</p>
            
            <form onSubmit={changePassword} className="mt-6 space-y-4">
              {/* Dropdown 1: Role */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  1. Select Role
                </label>
                <select
                  value={pwRole}
                  onChange={e => setPwRole(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Choose Faculty or Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {/* Dropdown 2: Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  2. Select Account Name
                </label>
                <select
                  name="accountId"
                  required
                  disabled={!pwRole}
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">
                    {pwRole ? `Select a ${pwRole} member` : 'First select a role above'}
                  </option>
                  {pwRole && (accounts[pwRole] || []).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Password Input */}
              <FormInput
                label="New password"
                name="newPassword"
                type="password"
                placeholder="At least 10 characters"
                minLength={10}
                maxLength={72}
                required
              />

              <button
                type="submit"
                disabled={busy || !pwRole}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {busy ? 'Updating…' : 'Change password'}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground border-t border-border pt-6">
          Campus Access · Mini MERN Authentication & Role-Based Dashboard
        </footer>
      </main>
    </>
  );
}
