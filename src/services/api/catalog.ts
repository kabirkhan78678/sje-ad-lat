import { API_ENDPOINTS } from '@/constants/api';
import { createCrudResourceApi } from '@/services/api/resource';

export const categoriesApi = createCrudResourceApi(API_ENDPOINTS.catalog.categories);
export const productsApi = createCrudResourceApi(API_ENDPOINTS.catalog.products);
