import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type { AboutPageCollectionItem, AboutPageContentResponse } from '@/modules/catalog/types/aboutPage';

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
  return unwrapCollection<AboutPageCollectionItem>(response.data);
};

const createCollectionItem = async (endpoint: string, payload: Record<string, unknown>) => {
  const response = await http.post(endpoint, createPayload(payload));
  return unwrapEntity<AboutPageCollectionItem>(response.data);
};

const updateCollectionItem = async (endpoint: string, id: string | number, payload: Record<string, unknown>) => {
  const response = await http.put(`${endpoint}/${id}`, createPayload(payload));
  return unwrapEntity<AboutPageCollectionItem>(response.data);
};

const deleteCollectionItem = async (endpoint: string, id: string | number) => {
  await http.delete(`${endpoint}/${id}`);
};

const toggleCollectionItem = async (endpoint: string, id: string | number, isActive: boolean) => {
  const response = await http.patch(`${endpoint}/${id}/toggle`, {
    is_active: isActive,
  });
  return unwrapEntity<AboutPageCollectionItem>(response.data);
};

const updateSection = async (endpoint: string, payload: Record<string, unknown>) => {
  const response = await http.put(endpoint, createPayload(payload));
  return unwrapEntity<Record<string, unknown>>(response.data);
};

export const getAboutPageContent = async () => {
  const response = await http.get(API_ENDPOINTS.aboutPage.content);
  return unwrapEntity<AboutPageContentResponse>(response.data);
};

export const updateAboutPageHero = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.hero, payload);

export const updateAboutPageIntro = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.intro, payload);

export const updateAboutPageMission = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.mission, payload);

export const updateAboutPageVision = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.vision, payload);

export const updateAboutPageCoreValuesSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.coreValuesSection, payload);

export const updateAboutPageJourneySection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.journeySection, payload);

export const updateAboutPageCertificationsSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.certificationsSection, payload);

export const updateAboutPageLeadershipSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.leadershipSection, payload);

export const updateAboutPageWhyChooseSection = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.whyChooseSection, payload);

export const updateAboutPageCta = async (payload: Record<string, unknown>) =>
  updateSection(API_ENDPOINTS.aboutPage.cta, payload);

export const getAboutPageHeroStats = async () => listCollection(API_ENDPOINTS.aboutPage.heroStats);
export const createAboutPageHeroStat = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.heroStats, payload);
export const updateAboutPageHeroStat = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.heroStats, id, payload);
export const deleteAboutPageHeroStat = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.heroStats, id);
export const reorderAboutPageHeroStats = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.heroStatsReorder, items);
export const toggleAboutPageHeroStat = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.heroStats, id, isActive);

export const getAboutPageIntroGalleryImages = async () => listCollection(API_ENDPOINTS.aboutPage.introGalleryImages);
export const createAboutPageIntroGalleryImage = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.introGalleryImages, payload);
export const updateAboutPageIntroGalleryImage = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.introGalleryImages, id, payload);
export const deleteAboutPageIntroGalleryImage = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.introGalleryImages, id);
export const reorderAboutPageIntroGalleryImages = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.introGalleryImagesReorder, items);
export const toggleAboutPageIntroGalleryImage = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.introGalleryImages, id, isActive);

export const getAboutPageCoreValues = async () => listCollection(API_ENDPOINTS.aboutPage.coreValues);
export const createAboutPageCoreValue = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.coreValues, payload);
export const updateAboutPageCoreValue = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.coreValues, id, payload);
export const deleteAboutPageCoreValue = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.coreValues, id);
export const reorderAboutPageCoreValues = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.coreValuesReorder, items);
export const toggleAboutPageCoreValue = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.coreValues, id, isActive);

export const getAboutPageJourneyTimeline = async () => listCollection(API_ENDPOINTS.aboutPage.journeyTimeline);
export const createAboutPageJourneyTimelineItem = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.journeyTimeline, payload);
export const updateAboutPageJourneyTimelineItem = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.journeyTimeline, id, payload);
export const deleteAboutPageJourneyTimelineItem = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.journeyTimeline, id);
export const reorderAboutPageJourneyTimeline = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.journeyTimelineReorder, items);
export const toggleAboutPageJourneyTimelineItem = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.journeyTimeline, id, isActive);

export const getAboutPageCertifications = async () => listCollection(API_ENDPOINTS.aboutPage.certifications);
export const createAboutPageCertification = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.certifications, payload);
export const updateAboutPageCertification = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.certifications, id, payload);
export const deleteAboutPageCertification = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.certifications, id);
export const reorderAboutPageCertifications = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.certificationsReorder, items);
export const toggleAboutPageCertification = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.certifications, id, isActive);

export const getAboutPageLeadershipMembers = async () => listCollection(API_ENDPOINTS.aboutPage.leadershipMembers);
export const createAboutPageLeadershipMember = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.leadershipMembers, payload);
export const updateAboutPageLeadershipMember = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.leadershipMembers, id, payload);
export const deleteAboutPageLeadershipMember = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.leadershipMembers, id);
export const reorderAboutPageLeadershipMembers = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.leadershipMembersReorder, items);
export const toggleAboutPageLeadershipMember = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.leadershipMembers, id, isActive);

export const getAboutPageWhyChooseItems = async () => listCollection(API_ENDPOINTS.aboutPage.whyChooseItems);
export const createAboutPageWhyChooseItem = async (payload: Record<string, unknown>) =>
  createCollectionItem(API_ENDPOINTS.aboutPage.whyChooseItems, payload);
export const updateAboutPageWhyChooseItem = async (id: string | number, payload: Record<string, unknown>) =>
  updateCollectionItem(API_ENDPOINTS.aboutPage.whyChooseItems, id, payload);
export const deleteAboutPageWhyChooseItem = async (id: string | number) =>
  deleteCollectionItem(API_ENDPOINTS.aboutPage.whyChooseItems, id);
export const reorderAboutPageWhyChooseItems = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.aboutPage.whyChooseItemsReorder, items);
export const toggleAboutPageWhyChooseItem = async (id: string | number, isActive: boolean) =>
  toggleCollectionItem(API_ENDPOINTS.aboutPage.whyChooseItems, id, isActive);
