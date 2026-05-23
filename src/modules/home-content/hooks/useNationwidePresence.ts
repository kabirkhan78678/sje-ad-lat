import { useCallback, useEffect, useState } from 'react';

import type { NationwidePresenceResponse } from '@/modules/home-content/types/nationwidePresence';
import { getNationwidePresence } from '@/services/api/nationwidePresence';

export const useNationwidePresence = () => {
  const [data, setData] = useState<NationwidePresenceResponse | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getNationwidePresence();
      setData(response);
      setRawData(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load Nationwide Presence content.',
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
