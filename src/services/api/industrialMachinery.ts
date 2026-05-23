import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  IndustrialMachineryCategory,
  IndustrialMachineryFeature,
  IndustrialMachineryMachine,
  IndustrialMachineryPageResponse,
  IndustrialMachineryWhyChooseUsItem,
} from '@/modules/catalog/types/industrialMachinery';

const isFormData = (payload: unknown): payload is FormData => payload instanceof FormData;

const listCollection = async <TItem>(endpoint: string) => {
  const response = await http.get(endpoint);
  return unwrapCollection<TItem>(response.data);
};

const createCollectionItem = async <TItem, TPayload>(endpoint: string, payload: TPayload) => {
  const response = await http.post(
    endpoint,
    payload,
    isFormData(payload)
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : undefined,
  );

  return unwrapEntity<TItem>(response.data);
};

const updateCollectionItem = async <TItem, TPayload>(
  endpoint: string,
  id: string | number,
  payload: TPayload,
) => {
  const response = await http.put(
    `${endpoint}/${id}`,
    payload,
    isFormData(payload)
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : undefined,
  );

  return unwrapEntity<TItem>(response.data);
};

const deleteCollectionItem = async (endpoint: string, id: string | number) => {
  await http.delete(`${endpoint}/${id}`);
};

export const getIndustrialMachineryContent = async () => {
  const response = await http.get(API_ENDPOINTS.industrialMachinery.content);
  return unwrapEntity<IndustrialMachineryPageResponse>(response.data);
};

export const updateIndustrialMachineryContent = async (payload: Record<string, unknown> | FormData) => {
  const response = await http.put(
    API_ENDPOINTS.industrialMachinery.content,
    payload,
    isFormData(payload)
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : undefined,
  );

  return unwrapEntity<IndustrialMachineryPageResponse>(response.data);
};

export const getIndustrialMachineryFeatures = async () =>
  listCollection<IndustrialMachineryFeature>(API_ENDPOINTS.industrialMachinery.features);

export const createIndustrialMachineryFeature = async (
  payload: Omit<IndustrialMachineryFeature, 'id'>,
) =>
  createCollectionItem<IndustrialMachineryFeature, Omit<IndustrialMachineryFeature, 'id'>>(
    API_ENDPOINTS.industrialMachinery.features,
    payload,
  );

export const updateIndustrialMachineryFeature = async (
  id: string | number,
  payload: Omit<IndustrialMachineryFeature, 'id'>,
) =>
  updateCollectionItem<IndustrialMachineryFeature, Omit<IndustrialMachineryFeature, 'id'>>(
    API_ENDPOINTS.industrialMachinery.features,
    id,
    payload,
  );

export const deleteIndustrialMachineryFeature = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.industrialMachinery.features, id);

export const getIndustrialMachineryCategories = async () =>
  listCollection<IndustrialMachineryCategory>(API_ENDPOINTS.industrialMachinery.categories);

export const createIndustrialMachineryCategory = async (
  payload: Omit<IndustrialMachineryCategory, 'id'>,
) =>
  createCollectionItem<IndustrialMachineryCategory, Omit<IndustrialMachineryCategory, 'id'>>(
    API_ENDPOINTS.industrialMachinery.categories,
    payload,
  );

export const updateIndustrialMachineryCategory = async (
  id: string | number,
  payload: Omit<IndustrialMachineryCategory, 'id'>,
) =>
  updateCollectionItem<IndustrialMachineryCategory, Omit<IndustrialMachineryCategory, 'id'>>(
    API_ENDPOINTS.industrialMachinery.categories,
    id,
    payload,
  );

export const deleteIndustrialMachineryCategory = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.industrialMachinery.categories, id);

export const getIndustrialMachineryMachines = async () =>
  listCollection<IndustrialMachineryMachine>(API_ENDPOINTS.industrialMachinery.machines);

export const createIndustrialMachineryMachine = async (
  payload: Omit<IndustrialMachineryMachine, 'id' | 'product' | 'category'> | FormData,
) =>
  createCollectionItem<
    IndustrialMachineryMachine,
    Omit<IndustrialMachineryMachine, 'id' | 'product' | 'category'> | FormData
  >(API_ENDPOINTS.industrialMachinery.machines, payload);

export const updateIndustrialMachineryMachine = async (
  id: string | number,
  payload: Omit<IndustrialMachineryMachine, 'id' | 'product' | 'category'> | FormData,
) =>
  updateCollectionItem<
    IndustrialMachineryMachine,
    Omit<IndustrialMachineryMachine, 'id' | 'product' | 'category'> | FormData
  >(API_ENDPOINTS.industrialMachinery.machines, id, payload);

export const deleteIndustrialMachineryMachine = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.industrialMachinery.machines, id);

export const getIndustrialMachineryWhyChooseUsItems = async () =>
  listCollection<IndustrialMachineryWhyChooseUsItem>(API_ENDPOINTS.industrialMachinery.whyChooseUsItems);

export const createIndustrialMachineryWhyChooseUsItem = async (
  payload: Omit<IndustrialMachineryWhyChooseUsItem, 'id'>,
) =>
  createCollectionItem<
    IndustrialMachineryWhyChooseUsItem,
    Omit<IndustrialMachineryWhyChooseUsItem, 'id'>
  >(API_ENDPOINTS.industrialMachinery.whyChooseUsItems, payload);

export const updateIndustrialMachineryWhyChooseUsItem = async (
  id: string | number,
  payload: Omit<IndustrialMachineryWhyChooseUsItem, 'id'>,
) =>
  updateCollectionItem<
    IndustrialMachineryWhyChooseUsItem,
    Omit<IndustrialMachineryWhyChooseUsItem, 'id'>
  >(API_ENDPOINTS.industrialMachinery.whyChooseUsItems, id, payload);

export const deleteIndustrialMachineryWhyChooseUsItem = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.industrialMachinery.whyChooseUsItems, id);
