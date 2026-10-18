import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getProfile } from '../api/profile.api';
import { RadialProgressCircle } from '../components/CircleGraph';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Building2,
  Calendar,
  Check,
  Copy,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  IdCard,
  Layers,
  BookOpen,
  GraduationCap,
  ArrowUpRight
} from 'lucide-react';
import StudentIdCardModal from '../components/StudentIdCardModal';

export function ProfileDashboard({ children }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [showIdCard, setShowIdCard] = useState(false);

  async function load() {
    setError('');
    try {
      const data = await getProfile();
      setProfile(data.user);
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function copyToClipboard(text, field) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Personal Workspace
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="h-8 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Active
            </Badge>

            <Button variant="outline" size="sm" onClick={load} className="h-8 gap-1.5 border-border shadow-xs">
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="link" size="sm" onClick={load} className="text-destructive-foreground underline">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : !profile ? (
          <div className="py-24 text-center">
            <RefreshCw className="mx-auto size-7 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Loading your workspace…</p>
          </div>
        ) : (
          <div className={`grid items-start gap-8 ${children ? 'lg:grid-cols-[1.3fr_1fr]' : 'lg:grid-cols-3'}`}>
            {/* Left/Main Column: Profile Card */}
            <div className={`space-y-6 ${!children ? 'lg:col-span-2' : ''}`}>
              <Card className="border-border/80 shadow-sm overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-primary/15 via-indigo-500/10 to-cyan-500/15 border-b border-border/60" />
                <CardContent className="px-6 pb-6 pt-0 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-5">
                    {/* Large Avatar */}
                    <div className="flex size-24 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground text-3xl font-bold shadow-md">
                      {profile.name ? profile.name[0].toUpperCase() : 'U'}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize px-3 py-1 text-xs font-semibold">
                        {profile.role === 'faculty' ? <Briefcase className="size-3 mr-1 text-indigo-500" /> : <IdCard className="size-3 mr-1 text-cyan-500" />}
                        {profile.role} Account
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(profile.email, 'email')}
                        className="h-7 text-xs gap-1.5 border-border"
                      >
                        {copiedField === 'email' ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                        <span>{copiedField === 'email' ? 'Copied Email' : 'Copy Email'}</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">{profile.email}</p>
                  </div>

                  {/* Account Details Grid */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm border-t border-border/80 pt-6">
                    {/* Department */}
                    <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Building2 className="size-3.5 text-primary" />
                        <span>Department</span>
                      </div>
                      <p className="font-semibold text-foreground">{profile.department || 'Computer Science & Engineering'}</p>
                    </div>

                    {/* Branch (Student Portal) */}
                    {profile.role === 'student' && (
                      <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Layers className="size-3.5 text-indigo-500" />
                          <span>Branch</span>
                        </div>
                        <p className="font-semibold text-foreground">{profile.branch || profile.department || 'Computer Science (CSE)'}</p>
                      </div>
                    )}

                    {/* Section (Student Portal) */}
                    {profile.role === 'student' && (
                      <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <BookOpen className="size-3.5 text-amber-500" />
                          <span>Section</span>
                        </div>
                        <p className="font-semibold text-foreground">{profile.section || 'Section A'}</p>
                      </div>
                    )}

                    {/* Year (B.Tech) (Student Portal) */}
                    {profile.role === 'student' && (
                      <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <GraduationCap className="size-3.5 text-cyan-500" />
                          <span>Year (B.Tech)</span>
                        </div>
                        <p className="font-semibold text-foreground">{profile.year || '3rd Year (B.Tech)'}</p>
                      </div>
                    )}

                    {/* Student Roll Number */}
                    {profile.rollNumber && (
                      <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <IdCard className="size-3.5 text-cyan-500" />
                          <span>Student Roll Number</span>
                        </div>
                        <p className="font-mono font-semibold text-foreground">{profile.rollNumber}</p>
                      </div>
                    )}

                    {/* Member Since */}
                    <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="size-3.5 text-primary" />
                        <span>Member Since</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {new Date(profile.createdAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* ID Card Option (Student Portal - at the bottom) */}
                    {profile.role === 'student' && (
                      <div
                        onClick={() => setShowIdCard(true)}
                        className="sm:col-span-2 rounded-xl border border-primary/40 bg-primary/5 p-3.5 hover:bg-primary/10 transition-all cursor-pointer group flex items-center justify-between"
                        title="Click to view official digital student ID card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IdCard className="size-4.5" />
                          </div>
                          <div>
                            <span className="text-xs text-primary font-semibold block">ID Card</span>
                            <p className="font-bold text-foreground text-sm">View Student ID Card</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                          <ArrowUpRight className="size-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Custom Child (e.g. Student QR code) OR Interactive Circle Gauge for Faculty */}
            {children ? (
              children(profile)
            ) : (
              <div className="space-y-6">
                {/* Faculty Status Circle Gauge */}
                <Card className="border-border/80 shadow-sm text-center">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Account Health</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center pt-2">
                    <RadialProgressCircle
                      value={100}
                      max={100}
                      size={150}
                      strokeWidth={16}
                      label="Verified"
                      color="#8b5cf6"
                    />
                    <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Faculty Member Privileges</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Official Student ID Card Modal */}
        {profile && profile.role === 'student' && (
          <StudentIdCardModal
            isOpen={showIdCard}
            onClose={() => setShowIdCard(false)}
            profile={profile}
          />
        )}
      </main>
    </div>
  );
}

export default function FacultyDashboard() {
  return <ProfileDashboard />;
}
