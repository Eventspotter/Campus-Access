import { useState } from 'react';
import { Button } from './ui/button';
export default function MotionToggle() {
  const [reduced, setReduced] = useState(() => localStorage.getItem('campus-reduced-motion') === 'true');
  function toggle() {
    const next = !reduced; setReduced(next);
    localStorage.setItem('campus-reduced-motion', String(next));
    document.documentElement.classList.toggle('reduce-motion', next);
  }
  return <Button type="button" variant="outline" size="sm" aria-pressed={reduced} onClick={toggle}>{reduced ? 'Enable motion' : 'Reduce motion'}</Button>;
}
