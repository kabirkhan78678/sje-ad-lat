import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const PageHeader = ({ actions, description, title }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-panel-gradient px-5 py-5 shadow-panel sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
};
