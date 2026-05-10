import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,159,120,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,143,7,0.12),transparent_24%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="hidden rounded-[2rem] border border-white/70 bg-panel-gradient p-10 shadow-soft lg:block">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Sri Jaya Enterprises
            </span>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-tight text-slate-950">
              Industrial content operations built for fast publishing and clean governance.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Manage homepage storytelling, machinery catalogs, certifications, inquiries, and
              company content from one enterprise-ready workspace.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['24+', 'Admin modules'],
                ['JWT', 'Protected access'],
                ['API', 'Live backend ready'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4">
                  <p className="font-display text-2xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel mx-auto w-full max-w-xl px-6 py-8 sm:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
