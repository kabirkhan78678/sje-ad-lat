import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  CertificationComplianceContentResponse,
  CertificationProcessStep,
  CertificationService,
  CertificationTestingGroup,
  CertificationTrainingProgram,
  CertificationWhyChooseUsItem,
} from '@/modules/catalog/types/certificationCompliance';

const listCollection = async <TItem>(endpoint: string) => {
  const response = await http.get(endpoint);
  return unwrapCollection<TItem>(response.data);
};

const createCollectionItem = async <TItem, TPayload>(endpoint: string, payload: TPayload) => {
  const response = await http.post(endpoint, payload);
  return unwrapEntity<TItem>(response.data);
};

const updateCollectionItem = async <TItem, TPayload>(
  endpoint: string,
  id: string | number,
  payload: TPayload,
) => {
  const response = await http.put(`${endpoint}/${id}`, payload);
  return unwrapEntity<TItem>(response.data);
};

const deleteCollectionItem = async (endpoint: string, id: string | number) => {
  await http.delete(`${endpoint}/${id}`);
};

export const getCertificationComplianceContent = async () => {
  const response = await http.get(API_ENDPOINTS.certificationCompliance.content);
  return unwrapEntity<CertificationComplianceContentResponse>(response.data);
};

export const updateCertificationComplianceContent = async (payload: Record<string, unknown>) => {
  const response = await http.put(API_ENDPOINTS.certificationCompliance.content, payload);
  return unwrapEntity<CertificationComplianceContentResponse>(response.data);
};

export const getCertificationComplianceServices = async () =>
  listCollection<CertificationService>(API_ENDPOINTS.certificationCompliance.services);

export const createCertificationComplianceService = async (payload: Omit<CertificationService, 'id'>) =>
  createCollectionItem<CertificationService, Omit<CertificationService, 'id'>>(
    API_ENDPOINTS.certificationCompliance.services,
    payload,
  );

export const updateCertificationComplianceService = async (
  id: string | number,
  payload: Omit<CertificationService, 'id'>,
) =>
  updateCollectionItem<CertificationService, Omit<CertificationService, 'id'>>(
    API_ENDPOINTS.certificationCompliance.services,
    id,
    payload,
  );

export const deleteCertificationComplianceService = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.certificationCompliance.services, id);

export const getCertificationComplianceProcessSteps = async () =>
  listCollection<CertificationProcessStep>(API_ENDPOINTS.certificationCompliance.processSteps);

export const createCertificationComplianceProcessStep = async (
  payload: Omit<CertificationProcessStep, 'id'>,
) =>
  createCollectionItem<CertificationProcessStep, Omit<CertificationProcessStep, 'id'>>(
    API_ENDPOINTS.certificationCompliance.processSteps,
    payload,
  );

export const updateCertificationComplianceProcessStep = async (
  id: string | number,
  payload: Omit<CertificationProcessStep, 'id'>,
) =>
  updateCollectionItem<CertificationProcessStep, Omit<CertificationProcessStep, 'id'>>(
    API_ENDPOINTS.certificationCompliance.processSteps,
    id,
    payload,
  );

export const deleteCertificationComplianceProcessStep = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.certificationCompliance.processSteps, id);

export const getCertificationComplianceTrainingPrograms = async () =>
  listCollection<CertificationTrainingProgram>(API_ENDPOINTS.certificationCompliance.trainingPrograms);

export const createCertificationComplianceTrainingProgram = async (
  payload: Omit<CertificationTrainingProgram, 'id'>,
) =>
  createCollectionItem<CertificationTrainingProgram, Omit<CertificationTrainingProgram, 'id'>>(
    API_ENDPOINTS.certificationCompliance.trainingPrograms,
    payload,
  );

export const updateCertificationComplianceTrainingProgram = async (
  id: string | number,
  payload: Omit<CertificationTrainingProgram, 'id'>,
) =>
  updateCollectionItem<CertificationTrainingProgram, Omit<CertificationTrainingProgram, 'id'>>(
    API_ENDPOINTS.certificationCompliance.trainingPrograms,
    id,
    payload,
  );

export const deleteCertificationComplianceTrainingProgram = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.certificationCompliance.trainingPrograms, id);

export const getCertificationComplianceTestingGroups = async () =>
  listCollection<CertificationTestingGroup>(API_ENDPOINTS.certificationCompliance.testingGroups);

export const createCertificationComplianceTestingGroup = async (
  payload: Omit<CertificationTestingGroup, 'id'>,
) =>
  createCollectionItem<CertificationTestingGroup, Omit<CertificationTestingGroup, 'id'>>(
    API_ENDPOINTS.certificationCompliance.testingGroups,
    payload,
  );

export const updateCertificationComplianceTestingGroup = async (
  id: string | number,
  payload: Omit<CertificationTestingGroup, 'id'>,
) =>
  updateCollectionItem<CertificationTestingGroup, Omit<CertificationTestingGroup, 'id'>>(
    API_ENDPOINTS.certificationCompliance.testingGroups,
    id,
    payload,
  );

export const deleteCertificationComplianceTestingGroup = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.certificationCompliance.testingGroups, id);

export const getCertificationComplianceWhyChooseUsItems = async () =>
  listCollection<CertificationWhyChooseUsItem>(API_ENDPOINTS.certificationCompliance.whyChooseUsItems);

export const createCertificationComplianceWhyChooseUsItem = async (
  payload: Omit<CertificationWhyChooseUsItem, 'id'>,
) =>
  createCollectionItem<CertificationWhyChooseUsItem, Omit<CertificationWhyChooseUsItem, 'id'>>(
    API_ENDPOINTS.certificationCompliance.whyChooseUsItems,
    payload,
  );

export const updateCertificationComplianceWhyChooseUsItem = async (
  id: string | number,
  payload: Omit<CertificationWhyChooseUsItem, 'id'>,
) =>
  updateCollectionItem<CertificationWhyChooseUsItem, Omit<CertificationWhyChooseUsItem, 'id'>>(
    API_ENDPOINTS.certificationCompliance.whyChooseUsItems,
    id,
    payload,
  );

export const deleteCertificationComplianceWhyChooseUsItem = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.certificationCompliance.whyChooseUsItems, id);
