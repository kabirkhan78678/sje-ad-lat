import { useCallback, useEffect, useState } from 'react';

import { getOurContributionSection } from '@/services/api/ourContribution';
import type { CsrSectionResponse } from '@/modules/home-content/types/ourContribution';

export const useOurContribution = () => {
  const [data, setData] = useState<CsrSectionResponse | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOurContributionSection();
      setData(response);
      setRawData(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load Our Contribution content.',
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
    rawData,
    isLoading,
    error,
    refetch,
  };
};
