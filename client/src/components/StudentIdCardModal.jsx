import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  IdCard,
  X,
  Printer,
  ShieldCheck,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  Hash
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function StudentIdCardModal({ isOpen, onClose, profile }) {
  const cardRef = useRef(null);

  if (!isOpen || !profile) return null;

  const branch = profile.branch || profile.department || 'Computer Science (CSE)';
  const section = profile.section || 'Section A';
  const year = profile.year || '3rd Year (B.Tech)';
  const department = profile.department || 'Computer Science & Engineering';

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IdCard className="size-4" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Official Student ID Card</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Physical-style Digital ID Card */}
        <div
          ref={cardRef}
          id="printable-id-card"
          className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card text-card-foreground shadow-lg print:border-black print:shadow-none"
        >
          {/* Card Header Strip */}
          <div className="bg-gradient-to-r from-indigo-600 via-primary to-cyan-600 px-5 py-4 text-white text-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Building2 className="size-24" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <GraduationCap className="size-5" />
              <span className="text-xs uppercase tracking-widest font-extrabold opacity-95">
                Campus Digital Pass
              </span>
            </div>
            <h4 className="text-base font-bold tracking-tight">UNIVERSITY INSTITUTE OF TECHNOLOGY</h4>
            <p className="text-[10px] tracking-wide text-white/80 font-medium">STUDENT IDENTITY CARD • B.TECH</p>
          </div>

          {/* Student Info Body */}
          <div className="p-5 space-y-4">
            {/* Avatar & Main Identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground text-2xl font-bold shadow-md border-2 border-background">
                  {profile.name ? profile.name[0].toUpperCase() : 'S'}
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <ShieldCheck className="size-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground leading-tight">{profile.name}</h3>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 bg-primary/10 text-primary font-bold">
                  {profile.rollNumber || 'DEMO2026001'}
                </Badge>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {profile.email}
                </div>
              </div>
            </div>

            {/* Academic Information Grid */}
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Branch</span>
                <span className="font-bold text-foreground block truncate" title={branch}>{branch}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Section</span>
                <span className="font-bold text-foreground block">{section}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Year (B.Tech)</span>
                <span className="font-bold text-foreground block">{year}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Department</span>
                <span className="font-bold text-foreground block truncate" title={department}>{department}</span>
              </div>
            </div>

            {/* Bottom Strip: QR Code & Security Stamp */}
            <div className="flex items-center justify-between border-t border-border/80 pt-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-lg border border-border/60 shadow-xs">
                  <QRCodeSVG
                    value={`campus:student:${profile.studentQrId || profile.rollNumber}`}
                    size={64}
                    level="M"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-mono text-muted-foreground">ID Token</div>
                  <div className="font-mono text-[11px] font-bold text-foreground">
                    {profile.studentQrId ? `${profile.studentQrId.slice(0, 10)}…` : profile.rollNumber}
                  </div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    Verified Active Pass
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Valid Period</div>
                <div className="text-[11px] font-bold text-foreground">2024 – 2028</div>
                <div className="text-[9px] text-muted-foreground">Campus Security</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold"
          >
            Close
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="h-9 gap-1.5 px-4 text-xs font-semibold shadow-xs"
          >
            <Printer className="size-3.5" />
            <span>Print ID Card</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
