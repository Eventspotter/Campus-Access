import { useId } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
export default function FormInput({ label, icon: Icon, ...props }) {
  const id = useId();
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><div className="relative">{Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />}<Input id={id} className={Icon ? 'h-11 bg-card pl-11 pr-4' : 'h-11 bg-card px-4'} {...props} /></div></div>;
}
