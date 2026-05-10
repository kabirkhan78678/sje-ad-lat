import { forwardRef, type SelectHTMLAttributes } from 'react';

import { ChevronDown } from 'lucide-react';

import { cn } from '@/utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 shadow-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    );
  },
);

Select.displayName = 'Select';
