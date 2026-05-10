import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { navigationGroups } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/modules/auth/AuthProvider';
import { cn } from '@/utils/cn';

type RouteHandle = {
  title?: string;
};

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-slate-200 bg-slate-950 text-white transition lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">SJE Admin</p>
          <h2 className="mt-3 font-display text-2xl font-semibold">Content Console</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Website content, company data, and lead operations in one place.
          </p>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
          {navigationGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {group.title}
              </p>
              <div className="mt-3 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white',
                          isActive && 'bg-white/10 text-white',
                        )
                      }
                      onClick={onClose}
                      to={item.path}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

const Topbar = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const title = useMemo(() => {
    const reversed = [...matches].reverse();
    const handled = reversed.find((match) => (match.handle as RouteHandle | undefined)?.title);
    return (handled?.handle as RouteHandle | undefined)?.title ?? 'Admin Panel';
  }, [matches]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-slate-100/90 backdrop-blur">
      <div className="page-shell !max-w-none !gap-3 !py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" onClick={onMenuClick} size="sm" variant="outline">
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Admin Workspace</p>
              <h1 className="font-display text-2xl font-semibold text-slate-950">{title}</h1>
            </div>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-semibold text-white">
                SA
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-900">SJE Admin</p>
                <p className="text-xs text-slate-500">Content Manager</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
                <button
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    logout();
                    navigate(ROUTES.auth.login);
                  }}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <Breadcrumbs />
      </div>
    </header>
  );
};

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="page-shell">
          <Outlet />
        </main>
      </div>
      {sidebarOpen ? (
        <button
          className="fixed right-4 top-4 z-50 rounded-full border border-slate-200 bg-white p-2 shadow-soft lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};
