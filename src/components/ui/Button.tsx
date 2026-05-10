import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:bg-brand-300 disabled:text-white',
  secondary:
    'bg-slate-900 text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400 disabled:text-white',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-300',
  outline:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, disabled, fullWidth, isLoading, size = 'md', variant = 'primary', ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
