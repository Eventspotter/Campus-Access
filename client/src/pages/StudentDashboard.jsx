import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ProfileDashboard } from './FacultyDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { RadialProgressCircle } from '../components/CircleGraph';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Sparkles,
  Info,
  IdCard
} from 'lucide-react';
import StudentIdCardModal from '../components/StudentIdCardModal';

export default function StudentDashboard() {
  const [copied, setCopied] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const qrRef = useRef(null);

  function copyQrId(qrId) {
    if (!qrId) return;
    navigator.clipboard.writeText(`campus:student:${qrId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQrCode(studentName) {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      // White background for QR clarity
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 20, 20, 360, 360);

      const a = document.createElement('a');
      a.download = `${studentName.replace(/\s+/g, '_')}_Student_QR.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  return (
    <ProfileDashboard>
      {profile => (
        <div className="space-y-6">
          {/* Main Interactive Student QR Card */}
          <Card className="border-border/80 shadow-md text-center overflow-hidden bg-card relative">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <QrCode className="size-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">Digital Campus QR</CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnlarged(!enlarged)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  title={enlarged ? 'Normal View' : 'Enlarge for Scanning'}
                >
                  {enlarged ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                  <span className="ml-1 hidden sm:inline">{enlarged ? 'Compact' : 'Enlarge'}</span>
                </Button>
              </div>
              <CardDescription className="text-xs text-left">
                Your unique non-sensitive student identification badge
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col items-center">
              {/* QR Code Container */}
              <div
                ref={qrRef}
                className={`transition-all duration-300 relative rounded-2xl bg-white border-2 border-border/80 p-5 shadow-sm hover:shadow-md cursor-pointer ${
                  enlarged ? 'scale-110 my-8 ring-4 ring-primary/20' : 'my-4'
                }`}
                onClick={() => setEnlarged(!enlarged)}
                title="Click to toggle enlarged scanner view"
              >
                <QRCodeSVG
                  value={`campus:student:${profile.studentQrId}`}
                  size={enlarged ? 230 : 170}
                  marginSize={1}
                  level="M"
                  title="Your unique student identifier"
                />
              </div>

              {/* Roll Number & Status Badge */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="font-mono text-xs px-3 py-1 font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20">
                  {profile.rollNumber}
                </Badge>
                <Badge variant="outline" className="text-xs px-2.5 py-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  <ShieldCheck className="size-3 mr-1 inline" />
                  Valid Identifier
                </Badge>
              </div>

              {/* Action Buttons: Copy ID, Download QR, & ID Card */}
              <div className="mt-6 flex flex-wrap w-full gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyQrId(profile.studentQrId)}
                  className="flex-1 min-w-[100px] h-9 gap-1.5 text-xs font-medium border-border"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy ID'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQrCode(profile.name)}
                  className="flex-1 min-w-[100px] h-9 gap-1.5 text-xs font-semibold"
                >
                  <Download className="size-3.5" />
                  <span>Download</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowIdCard(true)}
                  className="flex-1 min-w-[100px] h-9 gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <IdCard className="size-3.5" />
                  <span>View ID Card</span>
                </Button>
              </div>

              {/* Student ID Card Modal */}
              <StudentIdCardModal
                isOpen={showIdCard}
                onClose={() => setShowIdCard(false)}
                profile={profile}
              />

              {/* Non-sensitive explanation disclaimer */}
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-left text-xs text-muted-foreground border border-border/50">
                <Info className="size-4 shrink-0 text-primary mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  This QR contains non-sensitive student identification metadata. It does not contain your password or session credentials. QR scanning and attendance recording are out of scope.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Student Status Radial Gauge Card */}
          <Card className="border-border/80 shadow-sm text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Campus Verification</CardTitle>
              <CardDescription className="text-xs">Student enrollment credential status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <RadialProgressCircle
                value={100}
                max={100}
                size={140}
                strokeWidth={14}
                label="Verified"
                color="#06b6d4"
              />
              <p className="mt-3 text-xs font-medium text-foreground">Active Campus Access</p>
            </CardContent>
          </Card>
        </div>
      )}
    </ProfileDashboard>
  );
}
