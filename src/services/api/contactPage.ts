import { API_ENDPOINTS } from '@/constants/api';
import type {
  ContactInquiryPayload,
  ContactPageCollectionItem,
  ContactPageContentResponse,
} from '@/modules/catalog/types/contactPage';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';

const postReorder = async (endpoint: string, items: Array<{ id: number; display_order: number }>) => {
  const response = await http.post(endpoint, { items });
  return unwrapEntity(response.data);
};

const appendValueToFormData = (formData: FormData, key: string, value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return;
  }

  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    formData.append(key, JSON.stringify(value));
    return;
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0');
    return;
  }

  formData.append(key, String(value));
};

const hasBinaryValue = (payload: Record<string, unknown>) =>
  Object.values(payload).some((value) => value instanceof File || value instanceof Blob);

const createPayload = (payload: Record<string, unknown>) => {
  if (!hasBinaryValue(payload)) {
    return Object.entries(payload).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
      if (value === null || value === undefined || value === '') {
        return accumulator;
      }

      accumulator[key] = typeof value === 'boolean' ? Number(value) : value;
      return accumulator;
    }, {});
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => appendValueToFormData(formData, key, value));
  return formData;
};

const listCollection = async (endpoint: string) => {
  const response = await http.get(endpoint);
  return unwrapCollection<ContactPageCollectionItem>(response.data);
};

const createCollectionItem = async (endpoint: string, payload: Record<string, unknown>) => {
  const response = await http.post(endpoint, createPayload(payload));
  return unwrapEntity<ContactPageCollectionItem>(response.data);
};

const updateCollectionItem = async (endpoint: string, id: string | number, payload: Record<string, unknown>) => {
  const response = await http.put(`${endpoint}/${id}`, createPayload(payload));
  return unwrapEntity<ContactPageCollectionItem>(response.data);
};

const deleteCollectionItem = async (endpoint: string, id: string | number) => {
  await http.delete(`${endpoint}/${id}`);
};

const toggleCollectionItem = async (endpoint: string, id: string | number, isActive: boolean) => {
  const response = await http.patch(`${endpoint}/${id}/toggle`, {
    is_active: isActive,
  });
  return unwrapEntity<ContactPageCollectionItem>(response.data);
};

const updateSection = async (endpoint: string, payload: Record<string, unknown>) => {
  const response = await http.put(endpoint, createPayload(payload));
  return unwrapEntity<Record<string, unknown>>(response.data);
};

export const getContactPageContent = async () => {
  const response = await http.get(API_ENDPOINTS.contactPage.content);
  return unwrapEntity<ContactPageContentResponse>(response.data);
};

export const updateContactPageHero = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.contactPage.hero, payload);

export const updateContactCardsSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.contactPage.contactCardsSection, payload);

export const updateDepartmentsSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.contactPage.departmentsSection, payload);

export const updateContactFormSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.contactPage.formSection, payload);

export const updateOfficeSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.contactPage.officeSection, payload);

export const updateOfficeMap = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.contactPage.officeMap, payload);

export const getContactCards = async () => listCollection(API_ENDPOINTS.contactPage.contactCards);
export const createContactCard = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.contactPage.contactCards, payload);
export const updateContactCard = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.contactPage.contactCards, id, payload);
export const deleteContactCard = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.contactPage.contactCards, id);
export const reorderContactCards = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.contactPage.contactCardsReorder, items);
export const toggleContactCard = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.contactPage.contactCards, id, isActive);

export const getDepartments = async () => listCollection(API_ENDPOINTS.contactPage.departments);
export const createDepartment = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.contactPage.departments, payload);
export const updateDepartment = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.contactPage.departments, id, payload);
export const deleteDepartment = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.contactPage.departments, id);
export const reorderDepartments = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.contactPage.departmentsReorder, items);
export const toggleDepartment = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.contactPage.departments, id, isActive);

export const getServiceOptions = async () => listCollection(API_ENDPOINTS.contactPage.serviceOptions);
export const createServiceOption = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.contactPage.serviceOptions, payload);
export const updateServiceOption = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.contactPage.serviceOptions, id, payload);
export const deleteServiceOption = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.contactPage.serviceOptions, id);
export const reorderServiceOptions = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.contactPage.serviceOptionsReorder, items);
export const toggleServiceOption = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.contactPage.serviceOptions, id, isActive);

export const getTrustHighlights = async () => listCollection(API_ENDPOINTS.contactPage.trustHighlights);
export const createTrustHighlight = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.contactPage.trustHighlights, payload);
export const updateTrustHighlight = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.contactPage.trustHighlights, id, payload);
export const deleteTrustHighlight = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.contactPage.trustHighlights, id);
export const reorderTrustHighlights = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.contactPage.trustHighlightsReorder, items);
export const toggleTrustHighlight = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.contactPage.trustHighlights, id, isActive);

export const getOfficeInfoCards = async () => listCollection(API_ENDPOINTS.contactPage.officeInfoCards);
export const createOfficeInfoCard = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.contactPage.officeInfoCards, payload);
export const updateOfficeInfoCard = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.contactPage.officeInfoCards, id, payload);
export const deleteOfficeInfoCard = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.contactPage.officeInfoCards, id);
export const reorderOfficeInfoCards = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.contactPage.officeInfoCardsReorder, items);
export const toggleOfficeInfoCard = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.contactPage.officeInfoCards, id, isActive);

export const submitSiteInquiry = async (payload: ContactInquiryPayload) => {
  const response = await http.post(API_ENDPOINTS.contactPage.siteInquiries, payload);
  return unwrapEntity(response.data);
};

export const submitContactInquiry = async (payload: ContactInquiryPayload) => {
  const response = await http.post(API_ENDPOINTS.contactPage.contactInquiry, payload);
  return unwrapEntity(response.data);
};
