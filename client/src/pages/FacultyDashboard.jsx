import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getProfile } from '../api/profile.api';

export function ProfileDashboard({ children }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const data = await getProfile();
      setProfile(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">My Profile</h1>
          </div>
          {profile && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-secondary-foreground">
              {profile.role}
            </span>
          )}
        </div>

        {error ? (
          <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="text-sm font-semibold underline">Try again</button>
          </div>
        ) : !profile ? (
          <p className="mt-8 text-center text-muted-foreground" role="status">Loading your profile…</p>
        ) : (
          <div className={`mt-8 grid items-start gap-8 ${children ? 'lg:grid-cols-[1.2fr_1fr]' : ''}`}>
            {/* Profile Info Card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="h-20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/30" />
              <div className="px-6 pb-8">
                <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-primary text-3xl font-bold text-primary-foreground shadow-sm">
                  {profile.name.slice(0, 1).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">{profile.role} Account</p>

                <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Email address</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground break-all">{profile.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Account role</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground capitalize">{profile.role}</dd>
                  </div>
                  {profile.rollNumber && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Roll number</dt>
                      <dd className="mt-1 text-sm font-mono font-medium text-foreground">{profile.rollNumber}</dd>
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Department</dt>
                      <dd className="mt-1 text-sm font-medium text-foreground">{profile.department}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Member since</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Child content (e.g. QR code for students) */}
            {children && children(profile)}
          </div>
        )}
      </main>
    </>
  );
}

export default function FacultyDashboard() {
  return <ProfileDashboard />;
}
