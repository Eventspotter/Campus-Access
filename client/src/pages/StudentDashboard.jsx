import { QRCodeSVG } from 'qrcode.react';
import { ProfileDashboard } from './FacultyDashboard';

export default function StudentDashboard() {
  return (
    <ProfileDashboard>
      {profile => (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Identification</p>
          <h2 className="mt-2 text-xl font-bold text-foreground">Your Student QR</h2>
          
          <div className="mx-auto my-6 w-fit rounded-2xl bg-white border border-border p-5 shadow-sm">
            <QRCodeSVG
              value={`campus:student:${profile.studentQrId}`}
              size={180}
              marginSize={2}
              level="M"
              title="Your unique student identifier"
            />
          </div>

          <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 font-mono text-xs font-semibold text-secondary-foreground">
            {profile.rollNumber}
          </div>

          <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
            This QR contains your non-sensitive unique student identifier. QR scanning and attendance recording are out of scope.
          </p>
        </div>
      )}
    </ProfileDashboard>
  );
}
