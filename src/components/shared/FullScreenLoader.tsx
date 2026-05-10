import { Spinner } from '@/components/ui/Spinner';

type FullScreenLoaderProps = {
  label?: string;
};

export const FullScreenLoader = ({ label = 'Loading...' }: FullScreenLoaderProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel flex flex-col items-center gap-3 px-8 py-8 text-center">
        <Spinner className="h-6 w-6 text-brand-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
};
