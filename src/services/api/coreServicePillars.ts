import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapEntity } from '@/services/http';
import type {
  CoreServicePillarCard,
  CoreServicePillarsSection,
  CoreServicePillarsSectionPayload,
} from '@/modules/home-content/types/coreServicePillars';

const cardsEndpoint = `${API_ENDPOINTS.home.coreServicePillars}/cards`;

export const getCoreServicePillars = async () => {
  const response = await http.get(API_ENDPOINTS.home.coreServicePillars);
  return unwrapEntity<CoreServicePillarsSection>(response.data);
};

export const updateCoreServicePillarsSection = async (data: CoreServicePillarsSectionPayload) => {
  const response = await http.put(API_ENDPOINTS.home.coreServicePillars, data);
  return unwrapEntity<CoreServicePillarsSection>(response.data);
};

export const createCoreServicePillarCard = async (formData: FormData) => {
  const response = await http.post(cardsEndpoint, formData);
  return unwrapEntity<CoreServicePillarCard>(response.data);
};

export const updateCoreServicePillarCard = async (id: string | number, formData: FormData) => {
  const response = await http.put(`${cardsEndpoint}/${id}`, formData);
  return unwrapEntity<CoreServicePillarCard>(response.data);
};

export const deleteCoreServicePillarCard = async (id: string | number) => {
  await http.delete(`${cardsEndpoint}/${id}`);
};

export const reorderCoreServicePillarCards = async (items: Array<{ id: number }>) => {
  const response = await http.put(`${cardsEndpoint}/reorder`, { items });
  return unwrapEntity<CoreServicePillarsSection>(response.data);
};

export const toggleCoreServicePillarCard = async (id: string | number, is_active: boolean) => {
  const response = await http.patch(`${cardsEndpoint}/${id}/toggle`, { is_active });
  return unwrapEntity<CoreServicePillarCard>(response.data);
};
