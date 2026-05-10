import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
};

export const Badge = ({ className, tone = 'neutral', ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
};
