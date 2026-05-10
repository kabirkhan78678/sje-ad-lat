import { useEffect, useMemo, useState } from 'react';

import { CrudResourcePage } from '@/components/shared/CrudResourcePage';
import { useToast } from '@/components/shared/ToastProvider';
import { createProductsConfig } from '@/modules/catalog/config/catalogConfigs';
import { categoriesApi } from '@/services/api/catalog';
import type { SelectOption } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';

export const ProductsPage = () => {
  const { showToast } = useToast();
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.list();
        const options = response.items.map((category) => ({
          label: String(category.name ?? 'Unnamed category'),
          value: String(category.id ?? ''),
        }));
        const nextCategoriesMap = response.items.reduce<Record<string, string>>((accumulator, category) => {
          accumulator[String(category.id ?? '')] = String(category.name ?? 'Unnamed category');
          return accumulator;
        }, {});

        setCategoryOptions(options);
        setCategoriesMap(nextCategoriesMap);
      } catch (error) {
        showToast({
          title: 'Unable to load categories',
          description: getErrorMessage(error, 'Products can still load, but category labels may be incomplete.'),
          tone: 'error',
        });
      }
    };

    void loadCategories();
  }, [showToast]);

  const config = useMemo(
    () => createProductsConfig(categoryOptions, categoriesMap),
    [categoriesMap, categoryOptions],
  );

  return <CrudResourcePage config={config} />;
};

