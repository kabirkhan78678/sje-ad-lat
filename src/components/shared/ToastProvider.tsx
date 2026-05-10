import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type ToastTone = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneMeta: Record<ToastTone, { icon: React.ReactNode; accent: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    accent: 'border-emerald-200',
  },
  error: {
    icon: <CircleAlert className="h-5 w-5 text-rose-600" />,
    accent: 'border-rose-200',
  },
  info: {
    icon: <Info className="h-5 w-5 text-sky-600" />,
    accent: 'border-sky-200',
  },
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ description, title, tone }: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { description, id, title, tone }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto panel flex items-start gap-3 border px-4 py-3 shadow-soft',
              toneMeta[toast.tone].accent,
            )}
          >
            <div className="mt-0.5">{toneMeta[toast.tone].icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-slate-500">{toast.description}</p>
              ) : null}
            </div>
            <Button className="-mr-2" onClick={() => dismissToast(toast.id)} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }

  return context;
};
