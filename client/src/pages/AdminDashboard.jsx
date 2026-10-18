import { useEffect, useState, useMemo } from 'react';
import { createAccount, listAccounts, setAccountActive, changeAccountPassword } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { DonutCircleGraph, RadialProgressCircle } from '../components/CircleGraph';
import MemberDirectory from '../components/MemberDirectory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Users,
  GraduationCap,
  Briefcase,
  KeyRound,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  Hash,
  Search,
  ArrowUpRight,
  Laptop,
  Cpu,
  Zap,
  Wrench,
  BookOpen,
  Atom
} from 'lucide-react';

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
  const [pwSearch, setPwSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

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
      setLoadError(err.message || 'Failed to load directory accounts.');
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
      const result = await setAccountActive(user.role, user.id, !user.active);
      setAccounts(current => ({
        ...current,
        [user.role]: current[user.role].map(item => (item.id === user.id ? result.user : item))
      }));
      setSuccess(`${user.name} is now ${result.user.active ? 'active' : 'inactive'}.`);
    } catch (err) {
      setError(err.message || 'Failed to update account status.');
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
      setSuccess(`${user.name}'s ${role} account was created successfully.`);
    } catch (err) {
      setError(err.message || 'Could not create account.');
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
      setPwSearch('');
      if (result.user.id === admin.id) {
        await logout();
      } else {
        setSuccess(`Password changed successfully for ${result.user.name}.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setBusy(false);
    }
  }

  // Calculated Metrics
  const facultyCount = accounts.faculty.length;
  const studentCount = accounts.student.length;
  const totalCount = facultyCount + studentCount;

  const allAccounts = useMemo(() => [...accounts.faculty, ...accounts.student], [accounts]);
  const activeCount = allAccounts.filter(a => a.active).length;
  const inactiveCount = totalCount - activeCount;

  const facultyShare = totalCount > 0 ? ((facultyCount / totalCount) * 100).toFixed(1) : '0';
  const studentShare = totalCount > 0 ? ((studentCount / totalCount) * 100).toFixed(1) : '0';

  const donutData = [
    { label: 'Faculty', value: facultyCount, color: '#8b5cf6' },
    { label: 'Students', value: studentCount, color: '#06b6d4' }
  ];

  // Branch Metadata & Aggregation
  const BRANCH_METADATA = {
    'Computer Science': {
      icon: Laptop,
      barClass: 'bg-indigo-500',
      iconBg: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
    },
    'Information Technology': {
      icon: Cpu,
      barClass: 'bg-cyan-500',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
    },
    'Electrical Engineering': {
      icon: Zap,
      barClass: 'bg-amber-500',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    },
    'Mechanical Engineering': {
      icon: Wrench,
      barClass: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    'Mathematics': {
      icon: BookOpen,
      barClass: 'bg-pink-500',
      iconBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
    },
    'Physics': {
      icon: Atom,
      barClass: 'bg-violet-500',
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
    }
  };

  const branchCardsData = useMemo(() => {
    const core = [
      'Computer Science',
      'Information Technology',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Mathematics',
      'Physics'
    ];

    const departmentSet = new Set(core);
    allAccounts.forEach(acc => {
      if (acc.department && acc.department.trim()) {
        departmentSet.add(acc.department.trim());
      }
    });

    return Array.from(departmentSet).map(name => {
      const count = allAccounts.filter(
        m => m.department && m.department.toLowerCase() === name.toLowerCase()
      ).length;

      const meta = BRANCH_METADATA[name] || {
        icon: Building2,
        barClass: 'bg-primary',
        iconBg: 'bg-primary/10 text-primary'
      };

      return {
        name,
        count,
        icon: meta.icon,
        barClass: meta.barClass,
        iconBg: meta.iconBg
      };
    });
  }, [allAccounts]);

  const handleBranchClick = (branchName) => {
    setSelectedBranch(prev => (prev === branchName ? 'all' : branchName));
    const el = document.getElementById('member-directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Password dropdown accounts filter for 1,000+ accounts
  const filteredPwAccounts = (accounts[pwRole] || []).filter(
    u =>
      !pwSearch ||
      u.name.toLowerCase().includes(pwSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(pwSearch.toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(pwSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Directory & Role Management
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="h-8 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Role Guard Active
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="h-8 gap-1.5 border-border shadow-xs"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Global Alerts */}
        {error && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* ============================================================== */}
        {/* CIRCULAR GRAPHS & ANALYTICS SECTION                           */}
        {/* ============================================================== */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Circular Chart 1: Role Composition Donut */}
          <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Community Ratio</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <DonutCircleGraph
                data={donutData}
                size={160}
                strokeWidth={20}
                centerValue={loading ? '…' : totalCount.toLocaleString()}
                centerLabel="Total"
              />
            </CardContent>
          </Card>

          {/* Circular Chart 2: Account Health & Activity Radial Gauge */}
          <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Account Health</CardTitle>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center">
              <RadialProgressCircle
                value={activeCount}
                max={totalCount || 1}
                size={140}
                strokeWidth={16}
                label="Active"
                color="#10b981"
              />
              <div className="mt-4 flex w-full justify-around border-t border-border/60 pt-3 text-xs">
                <div className="text-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeCount.toLocaleString()}</span>
                  <p className="text-[11px] text-muted-foreground">Active</p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="text-center">
                  <span className="font-bold text-red-500">{inactiveCount.toLocaleString()}</span>
                  <p className="text-[11px] text-muted-foreground">Inactive</p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="text-center">
                  <span className="font-bold text-foreground">{totalCount.toLocaleString()}</span>
                  <p className="text-[11px] text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Directory Stats Card */}
          <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-xs sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Directory Stats</CardTitle>
                <ShieldCheck className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-2 gap-3">
                {/* Faculty Card */}
                <div
                  onClick={() => {
                    setSelectedRole(current => (current === 'faculty' ? 'all' : 'faculty'));
                    document.getElementById('member-directory')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer bg-card hover:shadow-xs hover:-translate-y-0.5 ${
                    selectedRole === 'faculty' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                      <Briefcase className="size-4" />
                    </div>
                    <ArrowUpRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>
                  <div className="mt-3 mb-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                      {loading ? '…' : facultyCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2.5">
                    <span className="text-xs font-semibold text-foreground">Faculty</span>
                  </div>
                  <div className="w-full">
                    <div className="h-1 w-full rounded-full bg-indigo-500" />
                  </div>
                </div>

                {/* Student Card */}
                <div
                  onClick={() => {
                    setSelectedRole(current => (current === 'student' ? 'all' : 'student'));
                    document.getElementById('member-directory')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer bg-card hover:shadow-xs hover:-translate-y-0.5 ${
                    selectedRole === 'student' ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <GraduationCap className="size-4" />
                    </div>
                    <ArrowUpRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>
                  <div className="mt-3 mb-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                      {loading ? '…' : studentCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2.5">
                    <span className="text-xs font-semibold text-foreground">Student</span>
                  </div>
                  <div className="w-full">
                    <div className="h-1 w-full rounded-full bg-cyan-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* BRANCHES SECTION (Formatted with card style from image)       */}
        {/* ============================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">Branches</h2>
            </div>
            {selectedBranch !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBranch('all')}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Filtered: <strong className="text-foreground">{selectedBranch}</strong></span>
                <span className="text-primary underline ml-1">Reset</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {branchCardsData.map(branch => {
              const Icon = branch.icon;
              const isSelected = selectedBranch === branch.name;
              return (
                <div
                  key={branch.name}
                  onClick={() => handleBranchClick(branch.name)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer bg-card/70 backdrop-blur-xs hover:shadow-md hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                      : 'border-border/80 hover:border-border'
                  }`}
                >
                  {/* Top: Icon + ArrowUpRight */}
                  <div className="flex items-center justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${branch.iconBg}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex size-7 items-center justify-center rounded-lg text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground">
                      <ArrowUpRight className="size-4" />
                    </div>
                  </div>

                  {/* Branch Name (Heading ONLY, NO number, NO subdetails) */}
                  <div className="my-4">
                    <h3 className="text-sm font-semibold text-foreground truncate" title={branch.name}>
                      {branch.name}
                    </h3>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="w-full pt-1">
                    <div className={`h-1 w-full rounded-full ${branch.barClass}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* MEMBER DIRECTORY COMPONENT (Matching User Prompt Requirements)  */}
        {/* ============================================================== */}
        <MemberDirectory
          accounts={accounts}
          departmentFilter={selectedBranch}
          onDepartmentFilterChange={setSelectedBranch}
          roleFilter={selectedRole}
          onRoleFilterChange={setSelectedRole}
          onToggleActive={toggleAccount}
          onSelectForPasswordChange={member => {
            setPwRole(member.role);
            setPwSearch(member.name);
            const el = document.getElementById('password-change-card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ============================================================== */}
        {/* LOWER SECTION: CREATE ACCOUNT & PASSWORD CHANGE FORMS          */}
        {/* ============================================================== */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Card 1: Add Faculty Member / Student */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="size-4" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Add Member Account
                </CardTitle>
              </div>

              {/* Role Toggle Switcher */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    role === 'faculty'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Faculty Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    role === 'student'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Student
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form key={role} onSubmit={submit} className="space-y-4">
                <FormInput
                  label="Full Name"
                  name="name"
                  icon={UserIcon}
                  placeholder="e.g. Dr. Jane Smith"
                  minLength={2}
                  maxLength={80}
                  required
                />

                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="e.g. janesmith@university.edu"
                  maxLength={254}
                  required
                />

                {role === 'student' && (
                  <>
                    <FormInput
                      label="Student Roll Number"
                      name="rollNumber"
                      icon={Hash}
                      placeholder="e.g. 24CS001"
                      pattern="[A-Za-z0-9-]{2,30}"
                      title="2–30 letters, numbers, or hyphens"
                      required
                    />
                    <FormInput
                      label="Branch"
                      name="branch"
                      icon={Laptop}
                      placeholder="e.g. Computer Science (CSE)"
                      maxLength={80}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput
                        label="Section"
                        name="section"
                        icon={BookOpen}
                        placeholder="e.g. Section A"
                        maxLength={20}
                      />
                      <FormInput
                        label="Year (B.Tech)"
                        name="year"
                        icon={GraduationCap}
                        placeholder="e.g. 3rd Year (B.Tech)"
                        maxLength={40}
                      />
                    </div>
                  </>
                )}

                <FormInput
                  label="Department"
                  name="department"
                  icon={Building2}
                  placeholder="e.g. Computer Science & Engineering"
                  maxLength={80}
                />

                <FormInput
                  label="Initial Password"
                  name="password"
                  type="password"
                  icon={Lock}
                  placeholder="Minimum 10 characters"
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />

                <Button
                  type="submit"
                  disabled={busy}
                  className="mt-2 h-11 w-full gap-2 rounded-lg font-semibold shadow-xs"
                >
                  <UserPlus className="size-4" />
                  <span>{busy ? 'Creating Account…' : `Create ${role === 'faculty' ? 'Faculty' : 'Student'} Account`}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Change Account Password */}
          <Card id="password-change-card" className="border-border/80 shadow-sm scroll-mt-24">
            <CardHeader className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="size-4" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Change Account Password</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={changePassword} className="space-y-4">
                {/* Dropdown 1: Role */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">1. Select Account Role</label>
                  <select
                    value={pwRole}
                    onChange={e => {
                      setPwRole(e.target.value);
                      setPwSearch('');
                    }}
                    required
                    className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Choose Faculty or Student</option>
                    <option value="faculty">Faculty ({facultyCount.toLocaleString()})</option>
                    <option value="student">Student ({studentCount.toLocaleString()})</option>
                  </select>
                </div>

                {/* Dropdown 2: Filter Search & Account Select */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">2. Select Account Name</label>
                    {pwRole && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {filteredPwAccounts.length} match{filteredPwAccounts.length === 1 ? '' : 'es'}
                      </span>
                    )}
                  </div>

                  {pwRole && (accounts[pwRole] || []).length > 5 && (
                    <div className="relative mb-1.5">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder={`Filter ${pwRole}s by name, email, roll no…`}
                        value={pwSearch}
                        onChange={e => setPwSearch(e.target.value)}
                        className="h-8 w-full rounded-md border border-input bg-muted/30 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  )}

                  <select
                    name="accountId"
                    required
                    disabled={!pwRole}
                    className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">
                      {!pwRole
                        ? 'Select a role first'
                        : filteredPwAccounts.length === 0
                        ? 'No matching accounts found'
                        : `Choose a ${pwRole} member (${filteredPwAccounts.length} available)`}
                    </option>
                    {pwRole &&
                      filteredPwAccounts.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.email} {u.rollNumber ? `[${u.rollNumber}]` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {/* New Password */}
                <FormInput
                  label="New Password"
                  name="newPassword"
                  type="password"
                  icon={Lock}
                  placeholder="At least 10 characters"
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />

                <Button
                  type="submit"
                  disabled={busy || !pwRole}
                  className="mt-2 h-11 w-full gap-2 rounded-lg font-semibold shadow-xs"
                >
                  <KeyRound className="size-4" />
                  <span>{busy ? 'Updating Password…' : 'Update Password'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/80 pt-6 text-center text-xs text-muted-foreground">
          Campus Access · High-Scale Role-Based Dashboard & Directory Management
        </footer>
      </main>
    </div>
  );
}
