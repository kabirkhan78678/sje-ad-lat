import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  LaboratoryInfrastructureContentResponse,
  LaboratoryInfrastructureFeature,
  LaboratoryInfrastructureFeaturedProductItem,
  LaboratoryInfrastructureFeaturedProductsPayload,
} from '@/modules/catalog/types/laboratoryInfrastructure';

export const getLaboratoryInfrastructureContent = async () => {
  const response = await http.get(API_ENDPOINTS.labInfrastructure.content);
  return unwrapEntity<LaboratoryInfrastructureContentResponse>(response.data);
};

export const updateLaboratoryInfrastructureContent = async (payload: FormData) => {
  const response = await http.put(API_ENDPOINTS.labInfrastructure.content, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapEntity<LaboratoryInfrastructureContentResponse>(response.data);
};

export const getLaboratoryInfrastructureFeatures = async () => {
  const response = await http.get(API_ENDPOINTS.labInfrastructure.features);
  return unwrapCollection<LaboratoryInfrastructureFeature>(response.data);
};

export const createLaboratoryInfrastructureFeature = async (
  payload: Omit<LaboratoryInfrastructureFeature, 'id'>,
) => {
  const response = await http.post(API_ENDPOINTS.labInfrastructure.features, payload);
  return unwrapEntity<LaboratoryInfrastructureFeature>(response.data);
};

export const updateLaboratoryInfrastructureFeature = async (
  id: string | number,
  payload: Omit<LaboratoryInfrastructureFeature, 'id'>,
) => {
  const response = await http.put(`${API_ENDPOINTS.labInfrastructure.features}/${id}`, payload);
  return unwrapEntity<LaboratoryInfrastructureFeature>(response.data);
};

export const deleteLaboratoryInfrastructureFeature = async (id: string | number) => {
  await http.delete(`${API_ENDPOINTS.labInfrastructure.features}/${id}`);
};

export const reorderLaboratoryInfrastructureFeatures = async (
  items: Array<{ id: number; display_order: number }>,
) => {
  const response = await http.put(`${API_ENDPOINTS.labInfrastructure.features}/reorder`, {
    items,
  });
  return unwrapEntity(response.data);
};

export const getLaboratoryInfrastructureFeaturedProducts = async () => {
  const response = await http.get(API_ENDPOINTS.labInfrastructure.featuredProducts);
  return unwrapEntity<
    | LaboratoryInfrastructureFeaturedProductItem[]
    | { items?: LaboratoryInfrastructureFeaturedProductItem[] }
  >(response.data);
};

export const updateLaboratoryInfrastructureFeaturedProducts = async (
  payload: LaboratoryInfrastructureFeaturedProductsPayload,
) => {
  const response = await http.put(API_ENDPOINTS.labInfrastructure.featuredProducts, payload);
  return unwrapEntity(response.data);
};
