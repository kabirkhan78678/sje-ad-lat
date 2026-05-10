import { navigationGroups } from '@/constants/navigation';
import { formatDate, formatNumber, titleCase } from '@/utils/formatters';

type MetricCard = {
  label: string;
  value: string;
};

export type DashboardListItem = {
  label: string;
  value: number;
};

export type DashboardInquiryItem = {
  id: string;
  name: string;
  subject: string;
  status: string;
  state: string;
  createdAt: string;
};

export type DashboardChartPoint = {
  label: string;
  value: number;
};

type DashboardLink = {
  label: string;
  path: string;
  icon: (typeof navigationGroups)[number]['items'][number]['icon'];
};

const metricSources = (records: Array<Record<string, unknown> | null | undefined>) =>
  records.filter(Boolean) as Record<string, unknown>[];

const getByPath = (record: Record<string, unknown> | null | undefined, path: string) => {
  if (!record) {
    return undefined;
  }

  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, record);
};

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested = record.items ?? record.results ?? record.records ?? record.data ?? record.series;
    return Array.isArray(nested) ? nested : [];
  }

  return [];
};

const coerceNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const sanitized = value.replace(/[^0-9.-]/g, '');
    const numeric = Number(sanitized);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return 0;
};

const coerceLabel = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const findValue = (
  sources: Array<Record<string, unknown> | null | undefined>,
  candidatePaths: string[],
) => {
  for (const source of sources) {
    for (const path of candidatePaths) {
      const value = getByPath(source, path);
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
  }

  return undefined;
};

export const extractMetricCards = (
  overview: Record<string, unknown> | null | undefined,
  summary: Record<string, unknown> | null | undefined,
): MetricCard[] => {
  const sources = metricSources([overview, summary]);
  const metricDefinitions: Array<{ label: string; keys: string[] }> = [
    { label: 'Total Categories', keys: ['total_categories', 'categories_count', 'counts.categories', 'metrics.categories'] },
    { label: 'Total Products', keys: ['total_products', 'products_count', 'counts.products', 'metrics.products'] },
    { label: 'Total Machinery', keys: ['total_machinery', 'machinery_count', 'counts.machinery', 'metrics.machinery'] },
    {
      label: 'Total Lab Equipment',
      keys: ['total_lab_equipment', 'lab_equipment_count', 'counts.lab_equipment', 'metrics.lab_equipment'],
    },
    { label: 'Total Services', keys: ['total_services', 'services_count', 'counts.services', 'metrics.services'] },
    { label: 'Total Projects', keys: ['total_projects', 'projects_count', 'counts.projects', 'metrics.projects'] },
    { label: 'Total Inquiries', keys: ['total_inquiries', 'inquiries_count', 'counts.inquiries', 'metrics.inquiries'] },
  ];

  return metricDefinitions.map((definition) => ({
    label: definition.label,
    value: formatNumber(coerceNumber(findValue(sources, definition.keys))),
  }));
};

export const extractLatestStats = (
  overview: Record<string, unknown> | null | undefined,
): MetricCard[] => {
  const stats = asArray(
    findValue([overview], ['latest_stats', 'stats', 'homepage_stats', 'highlights']),
  );

  return stats
    .map((entry, index) => {
      const record = (entry ?? {}) as Record<string, unknown>;
      const label = coerceLabel(
        record.label ?? record.title ?? record.stat_label ?? record.key ?? record.stat_key,
        `Stat ${index + 1}`,
      );
      const rawValue = record.value ?? record.count ?? record.stat_value ?? record.total;

      return {
        label,
        value: typeof rawValue === 'number' ? formatNumber(rawValue) : coerceLabel(rawValue, '—'),
      };
    })
    .filter((entry) => entry.value !== '—')
    .slice(0, 6);
};

const objectEntriesToList = (value: Record<string, unknown>) =>
  Object.entries(value)
    .map(([label, count]) => ({
      label: titleCase(label),
      value: coerceNumber(count),
    }))
    .filter((entry) => entry.value > 0);

export const extractPipeline = (
  summary: Record<string, unknown> | null | undefined,
): DashboardListItem[] => {
  const rawPipeline = findValue([summary], ['pipeline', 'status_counts', 'inquiry_pipeline', 'by_status']);

  if (Array.isArray(rawPipeline)) {
    return rawPipeline
      .map((entry) => {
        const record = (entry ?? {}) as Record<string, unknown>;
        return {
          label: titleCase(
            coerceLabel(record.label ?? record.status ?? record.name ?? record.key, 'Unknown'),
          ),
          value: coerceNumber(record.value ?? record.count ?? record.total),
        };
      })
      .filter((entry) => entry.value > 0);
  }

  if (rawPipeline && typeof rawPipeline === 'object') {
    return objectEntriesToList(rawPipeline as Record<string, unknown>);
  }

  return [];
};

export const extractTopStates = (
  summary: Record<string, unknown> | null | undefined,
  overview: Record<string, unknown> | null | undefined,
): DashboardListItem[] => {
  const rawStates = findValue([summary, overview], ['top_states', 'states', 'state_breakdown', 'inquiries_by_state']);

  if (Array.isArray(rawStates)) {
    return rawStates
      .map((entry) => {
        const record = (entry ?? {}) as Record<string, unknown>;
        return {
          label: coerceLabel(record.state ?? record.label ?? record.name, 'Unknown'),
          value: coerceNumber(record.count ?? record.value ?? record.total),
        };
      })
      .filter((entry) => entry.value > 0)
      .slice(0, 6);
  }

  if (rawStates && typeof rawStates === 'object') {
    return objectEntriesToList(rawStates as Record<string, unknown>).slice(0, 6);
  }

  return [];
};

export const extractRecentInquiries = (
  overview: Record<string, unknown> | null | undefined,
  summary: Record<string, unknown> | null | undefined,
): DashboardInquiryItem[] => {
  const recentInquiries = asArray(
    findValue([overview, summary], ['recent_inquiries', 'latest_inquiries', 'inquiries.recent', 'recent']),
  );

  return recentInquiries.slice(0, 6).map((entry, index) => {
    const record = (entry ?? {}) as Record<string, unknown>;

    return {
      id: coerceLabel(record.id, `recent-${index}`),
      name: coerceLabel(record.name, 'Unknown lead'),
      subject: coerceLabel(record.subject ?? record.category, 'General inquiry'),
      status: coerceLabel(record.status, 'new'),
      state: coerceLabel(record.state ?? record.region, '—'),
      createdAt: formatDate(coerceLabel(record.created_at ?? record.createdAt ?? record.date, '')),
    };
  });
};

export const extractVisitorSeries = (value: unknown): DashboardChartPoint[] => {
  const visitorsArray = asArray(value);

  if (visitorsArray.length > 0) {
    return visitorsArray
      .map((entry, index) => {
        const record = (entry ?? {}) as Record<string, unknown>;
        const label = coerceLabel(
          record.label ?? record.date ?? record.day ?? record.month ?? record.name,
          `Point ${index + 1}`,
        );

        return {
          label,
          value: coerceNumber(record.value ?? record.count ?? record.visitors ?? record.sessions ?? record.total),
        };
      })
      .filter((entry) => entry.value >= 0);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([label, count]) => ({
        label,
        value: coerceNumber(count),
      }))
      .filter((entry) => entry.value >= 0);
  }

  return [];
};

export const allDashboardLinks: DashboardLink[] = navigationGroups.flatMap((group) =>
  group.items.map((item) => ({
    label: item.label,
    path: item.path,
    icon: item.icon,
  })),
);
