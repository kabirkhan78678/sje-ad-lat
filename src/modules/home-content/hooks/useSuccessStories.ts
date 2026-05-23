import { useCallback, useEffect, useState } from 'react';

import type { SuccessStoriesResponse } from '@/modules/home-content/types/successStories';
import { getSuccessStories } from '@/services/api/successStories';

export const useSuccessStories = () => {
  const [data, setData] = useState<SuccessStoriesResponse | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getSuccessStories();
      setData(response);
      setRawData(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load Success Stories content.',
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
