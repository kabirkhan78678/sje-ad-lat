import { useCallback, useEffect, useState } from 'react';

import { getMachineryPortfolio } from '@/services/api/machineryPortfolio';
import type { MachineryPortfolioSection } from '@/modules/home-content/types/machineryPortfolio';

export const useMachineryPortfolio = () => {
  const [data, setData] = useState<MachineryPortfolioSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMachineryPortfolio();
      setData(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load machinery portfolio.',
      );
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
