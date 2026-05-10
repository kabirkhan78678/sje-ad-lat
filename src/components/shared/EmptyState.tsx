import { Inbox } from 'lucide-react';

import { Button } from '@/components/ui/Button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ actionLabel, description, onAction, title }: EmptyStateProps) => {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-2xl bg-slate-100 p-4">
        <Inbox className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
