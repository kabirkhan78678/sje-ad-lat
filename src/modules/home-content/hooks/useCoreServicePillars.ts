import { useCallback, useEffect, useState } from 'react';

import { getCoreServicePillars } from '@/services/api/coreServicePillars';
import type { CoreServicePillarsSection } from '@/modules/home-content/types/coreServicePillars';

export const useCoreServicePillars = () => {
  const [data, setData] = useState<CoreServicePillarsSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCoreServicePillars();
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load core service pillars.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
