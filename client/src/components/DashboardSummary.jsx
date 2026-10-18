import { useEffect, useState } from 'react';
import { getSummary } from '../api/notices.api';
import { Card } from './ui/card';
export default function DashboardSummary() {
  const [summary, setSummary] = useState(null);
  useEffect(() => { getSummary().then(setSummary).catch(() => {}); }, []);
  if (!summary) return null;
  return <div className="mt-8 grid gap-4 sm:grid-cols-3">{[
    ['Upcoming deadlines', summary.deadlines.length, summary.deadlines[0] ? `Next: ${new Date(summary.deadlines[0].dueAt).toLocaleDateString()}` : 'Nothing due soon'],
    ['Attendance', `${summary.attendance.present}/${summary.attendance.recorded}`, 'Days present / recorded'],
    ['Unread notices', summary.unread, 'Announcements and account updates'],
  ].map(([title, value, note]) => <Card key={title} className="gap-1 p-5"><p className="text-sm text-muted-foreground">{title}</p><p className="text-3xl font-semibold text-primary">{value}</p><p className="text-xs text-muted-foreground">{note}</p></Card>)}</div>;
}
