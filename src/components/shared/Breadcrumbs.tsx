import { ChevronRight } from 'lucide-react';
import { Link, useMatches } from 'react-router-dom';

type RouteHandle = {
  breadcrumb?: string;
};

export const Breadcrumbs = () => {
  const matches = useMatches();
  const crumbs = matches
    .map((match) => ({
      breadcrumb: (match.handle as RouteHandle | undefined)?.breadcrumb,
      pathname: match.pathname,
    }))
    .filter((crumb): crumb is { breadcrumb: string; pathname: string } => Boolean(crumb.breadcrumb));

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={crumb.pathname} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight className="h-4 w-4 text-slate-400" /> : null}
            {isLast ? (
              <span className="font-medium text-slate-700">{crumb.breadcrumb}</span>
            ) : (
              <Link className="transition hover:text-slate-900" to={crumb.pathname}>
                {crumb.breadcrumb}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};
