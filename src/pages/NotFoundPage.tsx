import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="panel max-w-xl px-8 py-10 text-center">
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          404
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The admin route you requested does not exist or may have moved to a different module.
        </p>
        <div className="mt-6">
          <Link to={ROUTES.dashboard}>
            <Button>Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
