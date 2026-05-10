import { useCallback, useEffect, useState } from 'react';

import type { SingletonApi } from '@/types/resources';

type UseSingletonResourceOptions<TRecord extends Record<string, any>, TPayload> = {
  api: SingletonApi<TRecord, TPayload>;
};

export const useSingletonResource = <TRecord extends Record<string, any>, TPayload>({
  api,
}: UseSingletonResourceOptions<TRecord, TPayload>) => {
  const [item, setItem] = useState<TRecord | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get();
      setItem(response);
      setRawData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load record.');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const updateItem = useCallback(
    async (payload: TPayload) => {
      setIsSubmitting(true);
      try {
        const response = await api.update(payload);
        setItem(response);
        setRawData(response);
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api],
  );

  return {
    item,
    rawData,
    isLoading,
    isSubmitting,
    error,
    refetch,
    updateItem,
  };
};
