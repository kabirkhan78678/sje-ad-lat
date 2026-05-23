import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  CsrInitiative,
  CsrSectionPayload,
  CsrSectionResponse,
} from '@/modules/home-content/types/ourContribution';

const initiativesEndpoint = API_ENDPOINTS.home.csrInitiatives;

export const getOurContributionSection = async () => {
  const response = await http.get(API_ENDPOINTS.home.csrSection);
  return unwrapEntity<CsrSectionResponse>(response.data);
};

export const updateOurContributionSection = async (payload: CsrSectionPayload) => {
  const response = await http.put(API_ENDPOINTS.home.csrSection, payload);
  return unwrapEntity<CsrSectionResponse>(response.data);
};

export const getOurContributionInitiatives = async () => {
  const response = await http.get(initiativesEndpoint);
  return unwrapCollection<CsrInitiative>(response.data);
};

export const createOurContributionInitiative = async (payload: FormData) => {
  const response = await http.post(initiativesEndpoint, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapEntity<CsrInitiative>(response.data);
};

export const updateOurContributionInitiative = async (
  id: string | number,
  payload: FormData,
) => {
  const response = await http.put(`${initiativesEndpoint}/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapEntity<CsrInitiative>(response.data);
};

export const deleteOurContributionInitiative = async (id: string | number) => {
  await http.delete(`${initiativesEndpoint}/${id}`);
};
