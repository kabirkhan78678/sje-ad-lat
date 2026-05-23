import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  NationwidePresenceLocation,
  NationwidePresenceLocationPayload,
  NationwidePresenceResponse,
  NationwidePresenceSectionPayload,
  NationwidePresenceState,
  NationwidePresenceStatePayload,
  NationwidePresenceStateService,
  NationwidePresenceStateServicePayload,
  NationwidePresenceStat,
  NationwidePresenceStatPayload,
} from '@/modules/home-content/types/nationwidePresence';

const nationwidePresenceEndpoint = API_ENDPOINTS.home.nationwidePresence;
const statesEndpoint = API_ENDPOINTS.home.nationwidePresenceStates;
const locationsEndpoint = API_ENDPOINTS.home.nationwidePresenceLocations;
const statsEndpoint = API_ENDPOINTS.home.nationwidePresenceStats;

export const getNationwidePresence = async () => {
  const response = await http.get(nationwidePresenceEndpoint);
  return unwrapEntity<NationwidePresenceResponse>(response.data);
};

export const updateNationwidePresenceSection = async (
  payload: NationwidePresenceSectionPayload,
) => {
  const response = await http.put(API_ENDPOINTS.home.nationwidePresenceSection, payload);
  return unwrapEntity<NationwidePresenceResponse>(response.data);
};

export const getNationwidePresenceStates = async () => {
  const response = await http.get(statesEndpoint);
  return unwrapCollection<NationwidePresenceState>(response.data);
};

export const createNationwidePresenceState = async (
  payload: NationwidePresenceStatePayload,
) => {
  const response = await http.post(statesEndpoint, payload);
  return unwrapEntity<NationwidePresenceState>(response.data);
};

export const updateNationwidePresenceState = async (
  id: string | number,
  payload: NationwidePresenceStatePayload,
) => {
  const response = await http.put(`${statesEndpoint}/${id}`, payload);
  return unwrapEntity<NationwidePresenceState>(response.data);
};

export const deleteNationwidePresenceState = async (id: string | number) => {
  await http.delete(`${statesEndpoint}/${id}`);
};

export const getNationwidePresenceStateServices = async (stateId: string | number) => {
  const response = await http.get(`${statesEndpoint}/${stateId}/services`);
  return unwrapCollection<NationwidePresenceStateService>(response.data);
};

export const createNationwidePresenceStateService = async (
  stateId: string | number,
  payload: NationwidePresenceStateServicePayload,
) => {
  const response = await http.post(`${statesEndpoint}/${stateId}/services`, payload);
  return unwrapEntity<NationwidePresenceStateService>(response.data);
};

export const updateNationwidePresenceStateService = async (
  id: string | number,
  payload: NationwidePresenceStateServicePayload,
) => {
  const response = await http.put(`${nationwidePresenceEndpoint}/services/${id}`, payload);
  return unwrapEntity<NationwidePresenceStateService>(response.data);
};

export const deleteNationwidePresenceStateService = async (id: string | number) => {
  await http.delete(`${nationwidePresenceEndpoint}/services/${id}`);
};

export const getNationwidePresenceLocations = async () => {
  const response = await http.get(locationsEndpoint);
  return unwrapCollection<NationwidePresenceLocation>(response.data);
};

export const createNationwidePresenceLocation = async (
  payload: NationwidePresenceLocationPayload,
) => {
  const response = await http.post(locationsEndpoint, payload);
  return unwrapEntity<NationwidePresenceLocation>(response.data);
};

export const updateNationwidePresenceLocation = async (
  id: string | number,
  payload: NationwidePresenceLocationPayload,
) => {
  const response = await http.put(`${locationsEndpoint}/${id}`, payload);
  return unwrapEntity<NationwidePresenceLocation>(response.data);
};

export const deleteNationwidePresenceLocation = async (id: string | number) => {
  await http.delete(`${locationsEndpoint}/${id}`);
};

export const getNationwidePresenceStats = async () => {
  const response = await http.get(statsEndpoint);
  return unwrapCollection<NationwidePresenceStat>(response.data);
};

export const createNationwidePresenceStat = async (
  payload: NationwidePresenceStatPayload,
) => {
  const response = await http.post(statsEndpoint, payload);
  return unwrapEntity<NationwidePresenceStat>(response.data);
};

export const updateNationwidePresenceStat = async (
  id: string | number,
  payload: NationwidePresenceStatPayload,
) => {
  const response = await http.put(`${statsEndpoint}/${id}`, payload);
  return unwrapEntity<NationwidePresenceStat>(response.data);
};

export const deleteNationwidePresenceStat = async (id: string | number) => {
  await http.delete(`${statsEndpoint}/${id}`);
};
