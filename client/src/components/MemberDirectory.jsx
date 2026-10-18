import React, { useState, useMemo, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  Building2,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  KeyRound,
  IdCard,
  QrCode,
  Copy,
  Check,
  UserCheck,
  UserX
} from 'lucide-react';

/**
 * Format relative time (e.g. "2 hours ago", "Yesterday", "3 days ago")
 */
function getRelativeTime(dateString) {
  if (!dateString) return 'Never logged in';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function MemberDirectory({
  accounts = { faculty: [], student: [] },
  onToggleActive,
  onSelectForPasswordChange,
  departmentFilter: controlledDepartment = 'all',
  onDepartmentFilterChange,
  roleFilter: controlledRole = 'all',
  onRoleFilterChange
}) {
  // Combine all accounts
  const allMembers = useMemo(() => {
    return [
      ...(accounts.faculty || []).map(f => ({ ...f, role: 'faculty' })),
      ...(accounts.student || []).map(s => ({ ...s, role: 'student' }))
    ];
  }, [accounts]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [internalRole, setInternalRole] = useState('all');
  const roleFilter = controlledRole !== 'all' ? controlledRole : internalRole;

  const [internalDepartment, setInternalDepartment] = useState('all');
  const departmentFilter = controlledDepartment !== 'all' ? controlledDepartment : internalDepartment;

  const setRoleFilter = (val) => {
    setInternalRole(val);
    if (onRoleFilterChange) onRoleFilterChange(val);
  };

  const setDepartmentFilter = (val) => {
    setInternalDepartment(val);
    if (onDepartmentFilterChange) onDepartmentFilterChange(val);
  };

  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Distinct departments
  const distinctDepartments = useMemo(() => {
    const set = new Set();
    allMembers.forEach(m => {
      if (m.department && m.department.trim()) {
        set.add(m.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [allMembers]);

  // Sorting
  const [sortKey, setSortKey] = useState('name'); // 'name' | 'role' | 'department' | 'lastLogin'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal / Drawer state
  const [selectedMember, setSelectedMember] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Active Dropdown state for three-dot menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return allMembers
      .filter(member => {
        // Search by name, email, rollNumber, or department
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          member.name.toLowerCase().includes(search) ||
          member.email.toLowerCase().includes(search) ||
          (member.rollNumber && member.rollNumber.toLowerCase().includes(search)) ||
          (member.department && member.department.toLowerCase().includes(search));

        // Role filter
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;

        // Department / Branch filter
        const matchesDepartment =
          departmentFilter === 'all' ||
          (member.department && member.department.toLowerCase() === departmentFilter.toLowerCase());

        // Status filter
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && member.active) ||
          (statusFilter === 'inactive' && !member.active);

        return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortKey] || '';
        let valB = b[sortKey] || '';

        if (sortKey === 'lastLogin') {
          valA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [allMembers, searchTerm, roleFilter, departmentFilter, statusFilter, sortKey, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, statusFilter, pageSize]);

  // Paginated records
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }

  function copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  return (
    <div id="member-directory" className="space-y-4">
      {/* Main Full-width Card */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden transition-all">
        {/* Header Row */}
        <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-foreground">Directory Members</h2>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {filteredMembers.length.toLocaleString()} total
              </span>
            </div>
          </div>

          {/* Right Controls: Search bar + Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Real-time Search input */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-card pl-9 pr-8 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Branch / Department Filter */}
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <option value="all">All Branches</option>
                {distinctDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <option value="all">All Roles</option>
                <option value="faculty">Faculty</option>
                <option value="student">Students</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/10 px-5 py-2.5 text-xs">
            <span className="font-medium text-muted-foreground">Active Filters:</span>
            {departmentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                Branch: {departmentFilter}
                <button
                  type="button"
                  onClick={() => setDepartmentFilter('all')}
                  className="hover:opacity-75"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-0.5 font-semibold text-indigo-600 dark:text-indigo-400">
                Role: {roleFilter === 'faculty' ? 'Faculty' : 'Student'}
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className="hover:opacity-75"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                Status: {statusFilter === 'active' ? 'Active Only' : 'Inactive Only'}
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="hover:opacity-75"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setDepartmentFilter('all');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="ml-auto text-xs font-semibold text-muted-foreground hover:text-foreground underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                {/* Column: Name (Sortable) */}
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3.5 cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Member Name</span>
                    {sortKey === 'name' ? (
                      sortOrder === 'asc' ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="size-3 text-muted-foreground/60" />
                    )}
                  </div>
                </th>

                {/* Column: Role (Sortable) */}
                <th
                  onClick={() => handleSort('role')}
                  className="px-6 py-3.5 cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    {sortKey === 'role' ? (
                      sortOrder === 'asc' ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="size-3 text-muted-foreground/60" />
                    )}
                  </div>
                </th>

                {/* Column: Department (Sortable) */}
                <th
                  onClick={() => handleSort('department')}
                  className="px-6 py-3.5 cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {sortKey === 'department' ? (
                      sortOrder === 'asc' ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="size-3 text-muted-foreground/60" />
                    )}
                  </div>
                </th>

                {/* Column: Status */}
                <th className="px-6 py-3.5 select-none">
                  <span>Status</span>
                </th>

                {/* Column: Last Login (Sortable) */}
                <th
                  onClick={() => handleSort('lastLogin')}
                  className="px-6 py-3.5 cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Activity</span>
                    {sortKey === 'lastLogin' ? (
                      sortOrder === 'asc' ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="size-3 text-muted-foreground/60" />
                    )}
                  </div>
                </th>

                {/* Column: Actions */}
                <th className="px-6 py-3.5 text-right select-none">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {paginatedMembers.map(member => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="group hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Name + Avatar */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs ${
                          member.role === 'faculty'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {member.name ? member.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {member.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge (Purple for faculty, Blue for student) */}
                  <td className="px-6 py-3.5">
                    {member.role === 'faculty' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 px-2.5 py-0.5 text-xs font-semibold">
                        <Briefcase className="size-3" />
                        Faculty
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 px-2.5 py-0.5 text-xs font-semibold">
                        <GraduationCap className="size-3" />
                        Student
                      </span>
                    )}
                  </td>

                  {/* Department */}
                  <td className="px-6 py-3.5 text-xs font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[170px]">{member.department || 'General'}</span>
                    </div>
                  </td>

                  {/* Status (Green / Gray badge) */}
                  <td className="px-6 py-3.5">
                    {member.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Last Login relative time */}
                  <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground/70" />
                      <span>{getRelativeTime(member.updatedAt || member.createdAt)}</span>
                    </div>
                  </td>

                  {/* Three-dot Action Menu */}
                  <td className="px-6 py-3.5 text-right relative" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                      className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Actions"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {/* Popover Menu */}
                    {openMenuId === member.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-6 top-10 z-50 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember(member);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-muted font-medium text-foreground transition-colors"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>View Full Profile & QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onToggleActive && onToggleActive(member);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-muted font-medium text-foreground transition-colors"
                        >
                          {member.active ? (
                            <>
                              <UserX className="size-3.5 text-red-500" />
                              <span className="text-red-600">Deactivate Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="size-3.5 text-emerald-500" />
                              <span className="text-emerald-600">Activate Account</span>
                            </>
                          )}
                        </button>

                        {onSelectForPasswordChange && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectForPasswordChange(member);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-muted font-medium text-foreground transition-colors"
                          >
                            <KeyRound className="size-3.5 text-indigo-500" />
                            <span>Change Password</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card Stack (Shown on small screens) */}
        <div className="md:hidden divide-y divide-border/60">
          {paginatedMembers.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="p-4 space-y-3 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      member.role === 'faculty'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {member.name ? member.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{member.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{member.email}</p>
                  </div>
                </div>

                {/* Role badge */}
                {member.role === 'faculty' ? (
                  <span className="inline-flex rounded-full bg-purple-50 text-purple-700 px-2 py-0.5 text-xs font-semibold">
                    Faculty
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                    Student
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  <span>{member.department || 'General'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {getRelativeTime(member.updatedAt || member.createdAt)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      member.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3 shadow-inner">
              <Search className="size-6 text-muted-foreground/70" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No members match your criteria</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find anyone matching "{searchTerm}" with the selected role and status filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 px-6 py-4 bg-muted/10 text-xs">
            <div className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, filteredMembers.length).toLocaleString()}
              </span>{' '}
              of <span className="font-semibold text-foreground">{filteredMembers.length.toLocaleString()}</span> members
            </div>

            <div className="flex items-center gap-3">
              {/* Rows per page selector */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="h-8 rounded-lg border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex size-8 items-center justify-center rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-40 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <span className="px-2 font-medium text-foreground">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex size-8 items-center justify-center rounded-lg border border-input bg-card hover:bg-muted disabled:opacity-40 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* DETAIL MODAL / DRAWER (Row Click & View Action)               */}
      {/* ============================================================== */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl text-base font-bold shadow-xs ${
                    selectedMember.role === 'faculty'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {selectedMember.name ? selectedMember.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        selectedMember.role === 'faculty'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {selectedMember.role}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        selectedMember.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${selectedMember.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {selectedMember.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body / Information Grid */}
            <div className="grid gap-3.5 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground font-medium">Email Address</span>
                <p className="font-semibold text-foreground font-mono mt-0.5 break-all">{selectedMember.email}</p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground font-medium">Department</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedMember.department || 'General Academic'}</p>
              </div>

              {selectedMember.role === 'student' && (
                <>
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                    <span className="text-[11px] text-muted-foreground font-medium">Branch</span>
                    <p className="font-semibold text-foreground mt-0.5">{selectedMember.branch || selectedMember.department || 'Computer Science (CSE)'}</p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                    <span className="text-[11px] text-muted-foreground font-medium">Section & Year</span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedMember.section || 'Section A'} • {selectedMember.year || '3rd Year (B.Tech)'}
                    </p>
                  </div>
                </>
              )}

              {selectedMember.rollNumber && (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <span className="text-[11px] text-muted-foreground font-medium">Roll Number</span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">{selectedMember.rollNumber}</p>
                </div>
              )}

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground font-medium">Last Login / Activity</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {getRelativeTime(selectedMember.updatedAt || selectedMember.createdAt)}
                </p>
              </div>
            </div>

            {/* Student QR Code Display (If Student) */}
            {selectedMember.role === 'student' && selectedMember.studentQrId && (
              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary mb-2">
                  <QrCode className="size-4" />
                  <span>Verified Student Identifier QR</span>
                </div>
                <div className="mx-auto w-fit rounded-xl bg-white p-3 border border-border shadow-xs">
                  <QRCodeSVG
                    value={`campus:student:${selectedMember.studentQrId}`}
                    size={130}
                    marginSize={1}
                    level="M"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    campus:student:{selectedMember.studentQrId.slice(0, 12)}…
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(`campus:student:${selectedMember.studentQrId}`)}
                    className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted"
                  >
                    {copiedId ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-border/80 pt-4">
              <button
                type="button"
                onClick={() => {
                  onToggleActive && onToggleActive(selectedMember);
                  setSelectedMember(null);
                }}
                className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-medium transition-colors ${
                  selectedMember.active
                    ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {selectedMember.active ? 'Deactivate Account' : 'Reactivate Account'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
