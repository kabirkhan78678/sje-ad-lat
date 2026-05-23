import { useCallback, useEffect, useState } from 'react';

import { getMachineGallery } from '@/services/api/machineGallery';
import type { MachineGallerySection } from '@/modules/home-content/types/machineGallery';

export const useMachineGallery = () => {
  const [data, setData] = useState<MachineGallerySection | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMachineGallery();
      setData(response);
      setRawData(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load machine gallery.',
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
