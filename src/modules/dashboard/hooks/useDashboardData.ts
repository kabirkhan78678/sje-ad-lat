import { useCallback, useEffect, useState } from 'react';

import { dashboardApi, type DashboardOverview, type DashboardSummary, type VisitorsPayload } from '@/services/api/dashboard';
import { getErrorMessage } from '@/utils/error';

type DashboardDataState = {
  overview: DashboardOverview | null;
  summary: DashboardSummary | null;
  visitors: VisitorsPayload | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useDashboardData = (): DashboardDataState => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [visitors, setVisitors] = useState<VisitorsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [overviewResponse, summaryResponse, visitorsResponse] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getInquirySummary(),
        dashboardApi.getVisitors(),
      ]);

      setOverview(overviewResponse);
      setSummary(summaryResponse);
      setVisitors(visitorsResponse);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Unable to load dashboard analytics.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    overview,
    summary,
    visitors,
    isLoading,
    error,
    refetch,
  };
};

