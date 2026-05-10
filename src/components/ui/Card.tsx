import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return <div className={cn('panel', className)} {...props} />;
};
