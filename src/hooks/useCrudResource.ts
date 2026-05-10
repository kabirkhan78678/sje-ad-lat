import { useCallback, useEffect, useState } from 'react';

import type { CrudApi } from '@/types/resources';

type UseCrudResourceOptions<TRecord extends Record<string, any>, TPayload> = {
  api: CrudApi<TRecord, TPayload>;
};

export const useCrudResource = <TRecord extends Record<string, any>, TPayload>({
  api,
}: UseCrudResourceOptions<TRecord, TPayload>) => {
  const [items, setItems] = useState<TRecord[]>([]);
  const [rawData, setRawData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.list();
      setItems(response.items);
      setRawData(response.raw);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load records.');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createRecord = useCallback(
    async (payload: TPayload) => {
      if (!api.create) {
        throw new Error('Create is not available for this resource.');
      }

      setIsSubmitting(true);
      try {
        const response = await api.create(payload);
        await refetch();
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, refetch],
  );

  const updateRecord = useCallback(
    async (id: string | number, payload: TPayload) => {
      if (!api.update) {
        throw new Error('Update is not available for this resource.');
      }

      setIsSubmitting(true);
      try {
        const response = await api.update(id, payload);
        await refetch();
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, refetch],
  );

  const deleteRecord = useCallback(
    async (id: string | number) => {
      if (!api.delete) {
        throw new Error('Delete is not available for this resource.');
      }

      setIsSubmitting(true);
      try {
        await api.delete(id);
        await refetch();
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, refetch],
  );

  const loadRecord = useCallback(
    async (id: string | number) => {
      if (api.getById) {
        return api.getById(id);
      }

      return items.find((item) => String(item.id) === String(id)) ?? null;
    },
    [api, items],
  );

  return {
    items,
    rawData,
    isLoading,
    isSubmitting,
    error,
    refetch,
    createRecord,
    updateRecord,
    deleteRecord,
    loadRecord,
  };
};
