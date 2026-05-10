import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/Button';

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  description,
  onRetry,
  title = 'Something interrupted this request',
}: ErrorStateProps) => {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-2xl bg-rose-50 p-4">
        <TriangleAlert className="h-8 w-8 text-rose-500" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry} variant="outline">
          Try again
        </Button>
      ) : null}
    </div>
  );
};
