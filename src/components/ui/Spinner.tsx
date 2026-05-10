import { LoaderCircle } from 'lucide-react';

import { cn } from '@/utils/cn';

type SpinnerProps = {
  className?: string;
};

export const Spinner = ({ className }: SpinnerProps) => {
  return <LoaderCircle className={cn('h-4 w-4 animate-spin', className)} />;
};
