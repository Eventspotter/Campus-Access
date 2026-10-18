import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { listNotices, markNoticeRead } from '../api/notices.api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
export default function NoticesPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { listNotices().then(data => setItems(data.notices)).catch(err => setError(err.message)); }, []);
  async function mark(item) {
    try { await markNoticeRead(item._id); setItems(current => current.map(value => value._id === item._id ? { ...value, readAt: new Date().toISOString() } : value)); }
    catch (err) { setError(err.message); }
  }
  return <><Navbar /><main id="main-content" className="page-shell"><p className="eyebrow">Your updates</p><h1 className="page-title">Notifications</h1>{error && <p role="alert" className="mt-6 text-destructive">{error}</p>}<div className="mt-8 space-y-4">{items.length ? items.map(item => <Card key={item._id} className={`gap-2 p-5 ${item.readAt ? '' : 'border-primary/40'}`}><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{item.kind}{item.dueAt ? ` · Due ${new Date(item.dueAt).toLocaleDateString()}` : ''}</p><h2 className="mt-2 text-lg font-semibold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{item.body}</p></div>{!item.readAt && <Button variant="outline" onClick={() => mark(item)}>Mark read</Button>}</div></Card>) : <p className="text-muted-foreground">No notifications yet.</p>}</div></main></>;
}
