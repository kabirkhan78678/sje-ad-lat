import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';
import type {
  FeaturedProject,
  FeaturedProjectEquipment,
  ProjectTestimonial,
  ProjectsCalculatorSection,
  ProjectsCtaSection,
  ProjectsFeaturedSection,
  ProjectsHeroSection,
  ProjectsPageContent,
  ProjectsTestimonialsSection,
  ProjectsTopStat,
} from '@/modules/catalog/types/projectsPage';

const postReorder = async (endpoint: string, items: Array<{ id: number; display_order: number }>) => {
  const response = await http.post(endpoint, { items });
  return unwrapEntity(response.data);
};

export const getProjectsPageContent = async () => {
  const response = await http.get(API_ENDPOINTS.projectsPage.content);
  return unwrapEntity<ProjectsPageContent>(response.data);
};

export const getProjectsPagePreview = async () => {
  const response = await http.get(API_ENDPOINTS.projectsPage.preview);
  return unwrapEntity(response.data);
};

export const updateProjectsHero = async (payload: ProjectsHeroSection) => {
  const response = await http.put(API_ENDPOINTS.projectsPage.hero, payload);
  return unwrapEntity<ProjectsHeroSection | { hero?: ProjectsHeroSection }>(response.data);
};

export const getProjectsStats = async () => {
  const response = await http.get(API_ENDPOINTS.projectsPage.stats);
  return unwrapCollection<ProjectsTopStat>(response.data);
};

export const createProjectsStat = async (payload: Omit<ProjectsTopStat, 'id'>) => {
  const response = await http.post(API_ENDPOINTS.projectsPage.stats, payload);
  return unwrapEntity<ProjectsTopStat>(response.data);
};

export const updateProjectsStat = async (id: string | number, payload: Omit<ProjectsTopStat, 'id'>) => {
  const response = await http.put(`${API_ENDPOINTS.projectsPage.stats}/${id}`, payload);
  return unwrapEntity<ProjectsTopStat>(response.data);
};

export const deleteProjectsStat = async (id: string | number) => {
  await http.delete(`${API_ENDPOINTS.projectsPage.stats}/${id}`);
};

export const reorderProjectsStats = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.projectsPage.statsReorder, items);

export const toggleProjectsStat = async (id: string | number, isActive: boolean) => {
  const response = await http.patch(`${API_ENDPOINTS.projectsPage.stats}/${id}/toggle`, {
    is_active: isActive,
  });
  return unwrapEntity<ProjectsTopStat>(response.data);
};

export const updateProjectsFeaturedSection = async (payload: ProjectsFeaturedSection) => {
  const response = await http.put(API_ENDPOINTS.projectsPage.featuredSection, payload);
  return unwrapEntity<ProjectsFeaturedSection | { featured_section?: ProjectsFeaturedSection }>(response.data);
};

export const getProjectsFeaturedProjects = async () => {
  const response = await http.get(API_ENDPOINTS.projectsPage.featuredProjects);
  return unwrapCollection<FeaturedProject>(response.data);
};

export const createFeaturedProject = async (payload: Omit<FeaturedProject, 'id' | 'equipment'>) => {
  const response = await http.post(API_ENDPOINTS.projectsPage.featuredProjects, payload);
  return unwrapEntity<FeaturedProject>(response.data);
};

export const updateFeaturedProject = async (
  id: string | number,
  payload: Omit<FeaturedProject, 'id' | 'equipment'>,
) => {
  const response = await http.put(`${API_ENDPOINTS.projectsPage.featuredProjects}/${id}`, payload);
  return unwrapEntity<FeaturedProject>(response.data);
};

export const deleteFeaturedProject = async (id: string | number) => {
  await http.delete(`${API_ENDPOINTS.projectsPage.featuredProjects}/${id}`);
};

export const reorderFeaturedProjects = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.projectsPage.featuredProjectsReorder, items);

export const toggleFeaturedProject = async (id: string | number, isActive: boolean) => {
  const response = await http.patch(`${API_ENDPOINTS.projectsPage.featuredProjects}/${id}/toggle`, {
    is_active: isActive,
  });
  return unwrapEntity<FeaturedProject>(response.data);
};

export const getFeaturedProjectEquipment = async (projectId: string | number) => {
  const response = await http.get(API_ENDPOINTS.projectsPage.featuredProjectEquipment(projectId));
  return unwrapCollection<FeaturedProjectEquipment>(response.data);
};

export const createFeaturedProjectEquipment = async (
  projectId: string | number,
  payload: Omit<FeaturedProjectEquipment, 'id'>,
) => {
  const response = await http.post(API_ENDPOINTS.projectsPage.featuredProjectEquipment(projectId), payload);
  return unwrapEntity<FeaturedProjectEquipment>(response.data);
};

export const reorderFeaturedProjectEquipment = async (
  projectId: string | number,
  items: Array<{ id: number; display_order: number }>,
) => postReorder(API_ENDPOINTS.projectsPage.featuredProjectEquipmentReorder(projectId), items);

export const updateFeaturedEquipment = async (
  id: string | number,
  payload: Omit<FeaturedProjectEquipment, 'id'>,
) => {
  const response = await http.put(`${API_ENDPOINTS.projectsPage.equipment}/${id}`, payload);
  return unwrapEntity<FeaturedProjectEquipment>(response.data);
};

export const deleteFeaturedEquipment = async (id: string | number) => {
  await http.delete(`${API_ENDPOINTS.projectsPage.equipment}/${id}`);
};

export const toggleFeaturedEquipment = async (id: string | number, isActive: boolean) => {
  const response = await http.patch(`${API_ENDPOINTS.projectsPage.equipment}/${id}/toggle`, {
    is_active: isActive,
  });
  return unwrapEntity<FeaturedProjectEquipment>(response.data);
};

export const updateProjectsCalculator = async (payload: ProjectsCalculatorSection) => {
  const response = await http.put(API_ENDPOINTS.projectsPage.calculator, payload);
  return unwrapEntity<ProjectsCalculatorSection | { calculator?: ProjectsCalculatorSection }>(response.data);
};

export const updateProjectsTestimonialsSection = async (payload: ProjectsTestimonialsSection) => {
  const response = await http.put(API_ENDPOINTS.projectsPage.testimonialsSection, payload);
  return unwrapEntity<
    ProjectsTestimonialsSection | { testimonials_section?: ProjectsTestimonialsSection }
  >(response.data);
};

export const getProjectsTestimonials = async () => {
  const response = await http.get(API_ENDPOINTS.projectsPage.testimonials);
  return unwrapCollection<ProjectTestimonial>(response.data);
};

export const createProjectsTestimonial = async (payload: Omit<ProjectTestimonial, 'id'>) => {
  const response = await http.post(API_ENDPOINTS.projectsPage.testimonials, payload);
  return unwrapEntity<ProjectTestimonial>(response.data);
};

export const updateProjectsTestimonial = async (
  id: string | number,
  payload: Omit<ProjectTestimonial, 'id'>,
) => {
  const response = await http.put(`${API_ENDPOINTS.projectsPage.testimonials}/${id}`, payload);
  return unwrapEntity<ProjectTestimonial>(response.data);
};

export const deleteProjectsTestimonial = async (id: string | number) => {
  await http.delete(`${API_ENDPOINTS.projectsPage.testimonials}/${id}`);
};

export const reorderProjectsTestimonials = async (items: Array<{ id: number; display_order: number }>) =>
  postReorder(API_ENDPOINTS.projectsPage.testimonialsReorder, items);

export const toggleProjectsTestimonial = async (id: string | number, isActive: boolean) => {
  const response = await http.patch(`${API_ENDPOINTS.projectsPage.testimonials}/${id}/toggle`, {
    is_active: isActive,
  });
  return unwrapEntity<ProjectTestimonial>(response.data);
};

export const updateProjectsCta = async (payload: ProjectsCtaSection) => {
  const response = await http.put(API_ENDPOINTS.projectsPage.cta, payload);
  return unwrapEntity<ProjectsCtaSection | { cta?: ProjectsCtaSection }>(response.data);
};
