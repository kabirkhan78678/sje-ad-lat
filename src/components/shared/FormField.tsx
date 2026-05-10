import type { PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type FormFieldProps = PropsWithChildren<{
  className?: string;
  description?: string;
  error?: string;
  label: string;
  required?: boolean;
}>;

export const FormField = ({
  children,
  className,
  description,
  error,
  label,
  required,
}: FormFieldProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
};
