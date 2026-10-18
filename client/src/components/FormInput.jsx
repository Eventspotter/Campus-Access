import { useId } from 'react';

export default function FormInput({ label, icon: Icon, className = '', ...props }) {
  const id = useId();
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={id}
          className={`flex h-11 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${Icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
