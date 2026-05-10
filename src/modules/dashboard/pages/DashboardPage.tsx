import { BarChart3, ChevronRight, CircleAlert, MapPinned, RefreshCw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { quickActionLinks } from '@/constants/navigation';
import { useDashboardData } from '@/modules/dashboard/hooks/useDashboardData';
import {
  allDashboardLinks,
  extractLatestStats,
  extractMetricCards,
  extractPipeline,
  extractRecentInquiries,
  extractTopStates,
  extractVisitorSeries,
} from '@/modules/dashboard/utils/dashboardTransformers';
import { cn } from '@/utils/cn';
import { formatNumber, titleCase } from '@/utils/formatters';

const getStatusTone = (status: string) => {
  const normalized = status.toLowerCase();

  if (['won', 'converted', 'qualified', 'closed'].includes(normalized)) {
    return 'success' as const;
  }

  if (['new', 'open', 'pending'].includes(normalized)) {
    return 'info' as const;
  }

  if (['follow-up', 'contacted', 'in-progress'].includes(normalized)) {
    return 'warning' as const;
  }

  if (['lost', 'spam', 'closed-lost', 'rejected'].includes(normalized)) {
    return 'danger' as const;
  }

  return 'neutral' as const;
};

const DashboardSection = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={cn('p-6', className)}>
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
    </div>
    {children}
  </Card>
);

export const DashboardPage = () => {
  const { error, isLoading, overview, refetch, summary, visitors } = useDashboardData();

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void refetch()} />;
  }

  const metricCards = extractMetricCards(overview, summary);
  const latestStats = extractLatestStats(overview);
  const pipeline = extractPipeline(summary);
  const topStates = extractTopStates(summary, overview);
  const recentInquiries = extractRecentInquiries(overview, summary);
  const visitorSeries = extractVisitorSeries(visitors);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview of content, catalog coverage, inquiries, and visitor activity across the SJE website."
        actions={(
          <Button onClick={() => void refetch()} variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.label} className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{card.value}</p>
              </>
            )}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <DashboardSection
          title="Visitor Analytics"
          description="Traffic trend from the dashboard visitors API."
        >
          {isLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : visitorSeries.length === 0 ? (
            <EmptyState
              title="No visitor data available"
              description="Visitor analytics will appear here once the backend returns chart points."
            />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={visitorSeries}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    minTickGap={20}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value: number) => formatNumber(value)}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), 'Visitors']}
                    labelClassName="text-slate-700"
                    wrapperClassName="!rounded-2xl !border !border-slate-200 !bg-white !shadow-soft"
                  />
                  <Line
                    dataKey="value"
                    dot={{ fill: '#1f9f78', r: 3 }}
                    stroke="#1f9f78"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Inquiry Pipeline"
          description="Status distribution across recent inquiries."
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : pipeline.length === 0 ? (
            <EmptyState
              title="No pipeline data yet"
              description="Inquiry status counts will appear here when the summary API returns them."
            />
          ) : (
            <div className="space-y-3">
              {pipeline.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">Current inquiry stage</p>
                      </div>
                    </div>
                    <p className="font-display text-2xl font-semibold text-slate-950">
                      {formatNumber(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <DashboardSection
          title="Latest Stats"
          description="Fresh business highlights exposed through the dashboard overview."
        >
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : latestStats.length === 0 ? (
            <EmptyState
              title="No latest stats returned"
              description="Add or expose latest stats from the backend overview endpoint to populate this panel."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {latestStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Top States"
          description="Where inquiry activity is currently strongest."
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : topStates.length === 0 ? (
            <EmptyState
              title="No state distribution available"
              description="Top performing states will appear here when the dashboard summary includes them."
            />
          ) : (
            <div className="space-y-3">
              {topStates.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                      <MapPinned className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <p className="font-display text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Recent Inquiries"
          description="Latest leads reaching the admin workspace."
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : recentInquiries.length === 0 ? (
            <EmptyState
              title="No recent inquiries available"
              description="Recent lead activity will show up here once the API includes it."
            />
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{inquiry.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{inquiry.subject}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {inquiry.state} • {inquiry.createdAt}
                      </p>
                    </div>
                    <Badge tone={getStatusTone(inquiry.status)}>{titleCase(inquiry.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </section>

      <DashboardSection
        title="Quick Actions"
        description="Jump directly into the most common content and lead management tasks."
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {quickActionLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
                to={item.path}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  Open module
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Module Shortcuts"
        description="Fast navigation across all major sections of the admin panel."
      >
        {allDashboardLinks.length === 0 ? (
          <EmptyState
            title="No module links found"
            description="Navigation shortcuts will appear here once module routing is configured."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {allDashboardLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50/60"
                  to={item.path}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        )}
      </DashboardSection>

      {!isLoading && metricCards.every((card) => card.value === '0') ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-4 w-4" />
            <p>
              The dashboard APIs are reachable, but the overview payload appears empty or uses different field names.
              The UI is ready and will populate as soon as those keys are returned.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

