import { cn } from '@/utils/cn';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export const Switch = ({ checked, onChange, disabled }: SwitchProps) => {
  return (
    <button
      className={cn(
        'relative inline-flex h-7 w-12 items-center rounded-full transition focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2',
        checked ? 'bg-brand-600' : 'bg-slate-300',
        disabled && 'cursor-not-allowed opacity-60',
      )}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
};
