import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  SuccessStoriesResponse,
  SuccessStorySectionPayload,
  SuccessStoryService,
  SuccessStoryServicePayload,
  SuccessStoryState,
  SuccessStoryStatePayload,
  SuccessStoryStat,
  SuccessStoryStatPayload,
} from '@/modules/home-content/types/successStories';

const successStoriesEndpoint = API_ENDPOINTS.home.successStories;
const statesEndpoint = API_ENDPOINTS.home.successStoriesStates;
const statsEndpoint = API_ENDPOINTS.home.successStoriesStats;

export const getSuccessStories = async () => {
  const response = await http.get(successStoriesEndpoint);
  return unwrapEntity<SuccessStoriesResponse>(response.data);
};

export const updateSuccessStoriesSection = async (
  payload: SuccessStorySectionPayload,
) => {
  const response = await http.put(API_ENDPOINTS.home.successStoriesSection, payload);
  return unwrapEntity<SuccessStoriesResponse>(response.data);
};

export const getSuccessStoryStates = async () => {
  const response = await http.get(statesEndpoint);
  return unwrapCollection<SuccessStoryState>(response.data);
};

export const createSuccessStoryState = async (payload: SuccessStoryStatePayload) => {
  const response = await http.post(statesEndpoint, payload);
  return unwrapEntity<SuccessStoryState>(response.data);
};

export const updateSuccessStoryState = async (
  id: string | number,
  payload: SuccessStoryStatePayload,
) => {
  const response = await http.put(`${statesEndpoint}/${id}`, payload);
  return unwrapEntity<SuccessStoryState>(response.data);
};

export const deleteSuccessStoryState = async (id: string | number) => {
  await http.delete(`${statesEndpoint}/${id}`);
};

export const createSuccessStoryService = async (
  stateId: string | number,
  payload: SuccessStoryServicePayload,
) => {
  const response = await http.post(`${statesEndpoint}/${stateId}/services`, payload);
  return unwrapEntity<SuccessStoryService>(response.data);
};

export const updateSuccessStoryService = async (
  id: string | number,
  payload: SuccessStoryServicePayload,
) => {
  const response = await http.put(`${successStoriesEndpoint}/services/${id}`, payload);
  return unwrapEntity<SuccessStoryService>(response.data);
};

export const deleteSuccessStoryService = async (id: string | number) => {
  await http.delete(`${successStoriesEndpoint}/services/${id}`);
};

export const getSuccessStoryStats = async () => {
  const response = await http.get(statsEndpoint);
  return unwrapCollection<SuccessStoryStat>(response.data);
};

export const createSuccessStoryStat = async (payload: SuccessStoryStatPayload) => {
  const response = await http.post(statsEndpoint, payload);
  return unwrapEntity<SuccessStoryStat>(response.data);
};

export const updateSuccessStoryStat = async (
  id: string | number,
  payload: SuccessStoryStatPayload,
) => {
  const response = await http.put(`${statsEndpoint}/${id}`, payload);
  return unwrapEntity<SuccessStoryStat>(response.data);
};

export const deleteSuccessStoryStat = async (id: string | number) => {
  await http.delete(`${statsEndpoint}/${id}`);
};
