import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

type ProjectsCmsSectionProps = {
  title: string;
  description: string;
  isActive?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const ProjectsCmsSection = ({
  actions,
  children,
  className,
  description,
  isActive,
  title,
}: ProjectsCmsSectionProps) => {
  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-slate-950">{title}</h2>
            {typeof isActive === 'boolean' ? (
              <Badge tone={isActive ? 'success' : 'neutral'}>{isActive ? 'Active' : 'Inactive'}</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
};
