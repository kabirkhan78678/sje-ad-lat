import { Eye, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { JSONPreviewDrawer } from '@/components/shared/JSONPreviewDrawer';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { useDisclosure } from '@/hooks/useDisclosure';
import { FeaturedProjectsManager } from '@/modules/catalog/components/FeaturedProjectsManager';
import { ProjectsCalculatorForm } from '@/modules/catalog/components/ProjectsCalculatorForm';
import { ProjectsCtaForm } from '@/modules/catalog/components/ProjectsCtaForm';
import { ProjectsFeaturedSectionForm } from '@/modules/catalog/components/ProjectsFeaturedSectionForm';
import { ProjectsHeroForm } from '@/modules/catalog/components/ProjectsHeroForm';
import { ProjectsStatsManager } from '@/modules/catalog/components/ProjectsStatsManager';
import { ProjectsTestimonialsManager } from '@/modules/catalog/components/ProjectsTestimonialsManager';
import { ProjectsTestimonialsSectionForm } from '@/modules/catalog/components/ProjectsTestimonialsSectionForm';
import {
  projectsCalculatorDefaultValues,
  projectsCtaDefaultValues,
  projectsFeaturedSectionDefaultValues,
  projectsHeroDefaultValues,
  projectsTestimonialsSectionDefaultValues,
} from '@/modules/catalog/schemas/projectsPage';
import type {
  FeaturedProject,
  FeaturedProjectEquipment,
  FeaturedProjectEquipmentFormValues,
  FeaturedProjectFormValues,
  ProjectTestimonial,
  ProjectTestimonialFormValues,
  ProjectsCalculatorFormValues,
  ProjectsCtaFormValues,
  ProjectsFeaturedSectionFormValues,
  ProjectsHeroFormValues,
  ProjectsPageContent,
  ProjectsTestimonialsSectionFormValues,
  ProjectsTopStat,
  ProjectsTopStatFormValues,
} from '@/modules/catalog/types/projectsPage';
import {
  createFeaturedProject,
  createFeaturedProjectEquipment,
  createProjectsStat,
  createProjectsTestimonial,
  deleteFeaturedEquipment,
  deleteFeaturedProject,
  deleteProjectsStat,
  deleteProjectsTestimonial,
  getProjectsFeaturedProjects,
  getProjectsPageContent,
  getProjectsPagePreview,
  getProjectsStats,
  getProjectsTestimonials,
  reorderFeaturedProjectEquipment,
  reorderFeaturedProjects,
  reorderProjectsStats,
  reorderProjectsTestimonials,
  toggleFeaturedEquipment,
  toggleFeaturedProject,
  toggleProjectsStat,
  toggleProjectsTestimonial,
  updateFeaturedEquipment,
  updateFeaturedProject,
  updateProjectsCalculator,
  updateProjectsCta,
  updateProjectsFeaturedSection,
  updateProjectsHero,
  updateProjectsStat,
  updateProjectsTestimonial,
  updateProjectsTestimonialsSection,
} from '@/services/api/projectsPage';
import { getErrorMessage } from '@/utils/error';

type SavingKey =
  | 'hero'
  | 'stats'
  | 'featuredSection'
  | 'featuredProjects'
  | 'calculator'
  | 'testimonialsSection'
  | 'testimonials'
  | 'cta';

type SavingState = Record<SavingKey, boolean>;

const defaultSavingState: SavingState = {
  hero: false,
  stats: false,
  featuredSection: false,
  featuredProjects: false,
  calculator: false,
  testimonialsSection: false,
  testimonials: false,
  cta: false,
};

const toRecord = (value: unknown) => (typeof value === 'object' && value ? (value as Record<string, unknown>) : {});
const toString = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const toArray = (value: unknown) => (Array.isArray(value) ? value : []);
const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const toBoolean = (value: unknown, fallback = true) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }
  return fallback;
};

const normalizeHero = (value: unknown): ProjectsHeroFormValues => {
  const item = toRecord(value);

  return {
    section_label: toString(item.section_label),
    title: toString(item.title),
    subtitle: toString(item.subtitle),
    primary_cta_label: toString(item.primary_cta_label),
    primary_cta_link: toString(item.primary_cta_link),
    secondary_cta_label: toString(item.secondary_cta_label),
    secondary_cta_link: toString(item.secondary_cta_link),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeStat = (value: unknown): ProjectsTopStat => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    stat_key: toString(item.stat_key),
    stat_value: toString(item.stat_value),
    stat_label: toString(item.stat_label),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeFeaturedSection = (value: unknown): ProjectsFeaturedSectionFormValues => {
  const item = toRecord(value);

  return {
    section_label: toString(item.section_label),
    section_title: toString(item.section_title),
    section_subtitle: toString(item.section_subtitle),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeEquipment = (value: unknown): FeaturedProjectEquipment => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    equipment_title: toString(item.equipment_title),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeFeaturedProject = (value: unknown): FeaturedProject => {
  const item = toRecord(value);
  const nestedEquipment = item.equipment ?? item.equipment_installed ?? item.equipment_items;

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    year: toString(item.year),
    location: toString(item.location),
    industry: toString(item.industry),
    capacity: toString(item.capacity),
    image_url: toString(item.image_url),
    details_link: toString(item.details_link),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active, true),
    equipment: toArray(nestedEquipment)
      .map(normalizeEquipment)
      .sort((left, right) => left.display_order - right.display_order || left.id - right.id),
  };
};

const normalizeCalculator = (value: unknown): ProjectsCalculatorFormValues => {
  const item = toRecord(value);
  const formulaConfig = item.formula_config_json;

  return {
    section_title: toString(item.section_title),
    section_subtitle: toString(item.section_subtitle),
    min_value: toNumber(item.min_value, projectsCalculatorDefaultValues.min_value),
    max_value: toNumber(item.max_value, projectsCalculatorDefaultValues.max_value),
    step_value: toNumber(item.step_value, projectsCalculatorDefaultValues.step_value),
    default_value: toNumber(item.default_value, projectsCalculatorDefaultValues.default_value),
    unit_label: toString(item.unit_label),
    button_label: toString(item.button_label),
    button_link: toString(item.button_link),
    action_key: toString(item.action_key),
    formula_type: toString(item.formula_type),
    formula_config_json:
      typeof formulaConfig === 'string'
        ? formulaConfig
        : JSON.stringify(formulaConfig ?? {}, null, 2),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeTestimonialsSection = (value: unknown): ProjectsTestimonialsSectionFormValues => {
  const item = toRecord(value);

  return {
    section_label: toString(item.section_label),
    section_title: toString(item.section_title),
    section_subtitle: toString(item.section_subtitle),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeTestimonial = (value: unknown): ProjectTestimonial => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    client_name: toString(item.client_name),
    client_role: toString(item.client_role),
    quote: toString(item.quote),
    initials: toString(item.initials),
    avatar_url: toString(item.avatar_url),
    rating: toNumber(item.rating, 5),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active, true),
  };
};

const normalizeCta = (value: unknown): ProjectsCtaFormValues => {
  const item = toRecord(value);

  return {
    title: toString(item.title),
    subtitle: toString(item.subtitle),
    primary_cta_label: toString(item.primary_cta_label),
    primary_cta_link: toString(item.primary_cta_link),
    secondary_cta_label: toString(item.secondary_cta_label),
    secondary_cta_link: toString(item.secondary_cta_link),
    is_active: toBoolean(item.is_active, true),
  };
};

const emptyPageContent: ProjectsPageContent = {
  hero: projectsHeroDefaultValues,
  stats: [],
  featured_section: projectsFeaturedSectionDefaultValues,
  featured_projects: [],
  calculator: projectsCalculatorDefaultValues,
  testimonials_section: projectsTestimonialsSectionDefaultValues,
  testimonials: [],
  cta: projectsCtaDefaultValues,
};

const normalizePageContent = (value: unknown): ProjectsPageContent => {
  const item = toRecord(value);

  return {
    hero: normalizeHero(item.hero ?? item.hero_section ?? projectsHeroDefaultValues),
    stats: toArray(item.stats).map(normalizeStat).sort((left, right) => left.display_order - right.display_order || left.id - right.id),
    featured_section: normalizeFeaturedSection(
      item.featured_section ?? item.featured_projects_section ?? projectsFeaturedSectionDefaultValues,
    ),
    featured_projects: toArray(item.featured_projects)
      .map(normalizeFeaturedProject)
      .sort((left, right) => left.display_order - right.display_order || left.id - right.id),
    calculator: normalizeCalculator(item.calculator ?? projectsCalculatorDefaultValues),
    testimonials_section: normalizeTestimonialsSection(
      item.testimonials_section ?? projectsTestimonialsSectionDefaultValues,
    ),
    testimonials: toArray(item.testimonials)
      .map(normalizeTestimonial)
      .sort((left, right) => left.display_order - right.display_order || left.id - right.id),
    cta: normalizeCta(item.cta ?? item.cta_section ?? projectsCtaDefaultValues),
  };
};

const normalizeList = <TItem,>(items: TItem[], mapper: (value: TItem) => any) =>
  items.map(mapper).sort((left, right) => left.display_order - right.display_order || left.id - right.id);

const moveItem = <TItem extends { id: number; display_order: number }>(
  items: TItem[],
  itemId: number,
  direction: 'up' | 'down',
) => {
  const next = [...items];
  const currentIndex = next.findIndex((item) => item.id === itemId);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= next.length) {
    return items;
  }

  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];

  return next.map((item, index) => ({
    ...item,
    display_order: index + 1,
  }));
};

const mapReorderPayload = (items: Array<{ id: number; display_order: number }>) =>
  items.map((item, index) => ({
    id: item.id,
    display_order: index + 1,
  }));

export const ProjectsPageContentManager = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<SavingState>(defaultSavingState);
  const [pageData, setPageData] = useState<ProjectsPageContent>(emptyPageContent);
  const [adminPreviewData, setAdminPreviewData] = useState<unknown>(null);
  const [publicPreviewData, setPublicPreviewData] = useState<unknown>(null);

  const setSavingState = useCallback((key: SavingKey, value: boolean) => {
    setSaving((current) => ({ ...current, [key]: value }));
  }, []);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProjectsPageContent();
      setPageData(normalizePageContent(response));
      setAdminPreviewData(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPublicPreview = useCallback(async () => {
    try {
      const response = await getProjectsPagePreview();
      setPublicPreviewData(response);
    } catch (previewError) {
      showToast({
        title: 'Unable to load public preview data',
        description: getErrorMessage(previewError),
        tone: 'error',
      });
    }
  }, [showToast]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const previewPayload = useMemo(
    () => ({
      admin_content: adminPreviewData,
      public_preview: publicPreviewData,
    }),
    [adminPreviewData, publicPreviewData],
  );

  const reloadStats = useCallback(async () => {
    const response = await getProjectsStats();
    setPageData((current) => ({
      ...current,
      stats: normalizeList(response.items, normalizeStat),
    }));
  }, []);

  const reloadFeaturedProjects = useCallback(async () => {
    const response = await getProjectsFeaturedProjects();
    setPageData((current) => ({
      ...current,
      featured_projects: normalizeList(response.items, normalizeFeaturedProject),
    }));
  }, []);

  const reloadTestimonials = useCallback(async () => {
    const response = await getProjectsTestimonials();
    setPageData((current) => ({
      ...current,
      testimonials: normalizeList(response.items, normalizeTestimonial),
    }));
  }, []);

  const saveHero = async (values: ProjectsHeroFormValues) => {
    setSavingState('hero', true);
    try {
      const response = await updateProjectsHero(values);
      const resolved = toRecord(response).hero ?? response;
      setPageData((current) => ({ ...current, hero: normalizeHero(resolved) }));
      showToast({ title: 'Hero section saved', description: 'Projects hero content was updated successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to save hero section', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('hero', false);
    }
  };

  const saveFeaturedSection = async (values: ProjectsFeaturedSectionFormValues) => {
    setSavingState('featuredSection', true);
    try {
      const response = await updateProjectsFeaturedSection(values);
      const resolved = toRecord(response).featured_section ?? response;
      setPageData((current) => ({ ...current, featured_section: normalizeFeaturedSection(resolved) }));
      showToast({ title: 'Featured section saved', description: 'Featured projects heading content was updated.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to save featured section', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredSection', false);
    }
  };

  const saveCalculator = async (values: ProjectsCalculatorFormValues) => {
    setSavingState('calculator', true);
    try {
      const response = await updateProjectsCalculator({
        ...values,
        formula_config_json: values.formula_config_json,
      });
      const resolved = toRecord(response).calculator ?? response;
      setPageData((current) => ({ ...current, calculator: normalizeCalculator(resolved) }));
      showToast({ title: 'Calculator section saved', description: 'Production capacity calculator settings were updated.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to save calculator section', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('calculator', false);
    }
  };

  const saveTestimonialsSection = async (values: ProjectsTestimonialsSectionFormValues) => {
    setSavingState('testimonialsSection', true);
    try {
      const response = await updateProjectsTestimonialsSection(values);
      const resolved = toRecord(response).testimonials_section ?? response;
      setPageData((current) => ({ ...current, testimonials_section: normalizeTestimonialsSection(resolved) }));
      showToast({ title: 'Testimonials section saved', description: 'Testimonials heading content was updated.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to save testimonials section', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('testimonialsSection', false);
    }
  };

  const saveCta = async (values: ProjectsCtaFormValues) => {
    setSavingState('cta', true);
    try {
      const response = await updateProjectsCta(values);
      const resolved = toRecord(response).cta ?? response;
      setPageData((current) => ({ ...current, cta: normalizeCta(resolved) }));
      showToast({ title: 'Final CTA saved', description: 'Closing CTA content was updated successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to save final CTA', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('cta', false);
    }
  };

  const createStat = async (values: ProjectsTopStatFormValues) => {
    setSavingState('stats', true);
    try {
      await createProjectsStat(values);
      await reloadStats();
      showToast({ title: 'Stat created', description: 'The top stat item was added successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to create stat', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('stats', false);
    }
  };

  const updateStat = async (item: ProjectsTopStat, values: ProjectsTopStatFormValues) => {
    setSavingState('stats', true);
    try {
      await updateProjectsStat(item.id, values);
      await reloadStats();
      showToast({ title: 'Stat updated', description: 'The top stat item was updated successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to update stat', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('stats', false);
    }
  };

  const deleteStat = async (item: ProjectsTopStat) => {
    setSavingState('stats', true);
    try {
      await deleteProjectsStat(item.id);
      await reloadStats();
      showToast({ title: 'Stat deleted', description: `${item.stat_label} was removed successfully.`, tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to delete stat', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('stats', false);
    }
  };

  const toggleStat = async (item: ProjectsTopStat) => {
    const previousItems = pageData.stats;
    const nextItems = previousItems.map((entry) =>
      entry.id === item.id ? { ...entry, is_active: !entry.is_active } : entry,
    );
    setPageData((current) => ({ ...current, stats: nextItems }));
    try {
      await toggleProjectsStat(item.id, !item.is_active);
      await reloadStats();
    } catch (toggleError) {
      setPageData((current) => ({ ...current, stats: previousItems }));
      showToast({ title: 'Unable to update stat status', description: getErrorMessage(toggleError), tone: 'error' });
    }
  };

  const reorderStat = async (item: ProjectsTopStat, direction: 'up' | 'down') => {
    const previousItems = pageData.stats;
    const nextItems = moveItem(previousItems, item.id, direction);
    if (nextItems === previousItems) {
      return;
    }
    setPageData((current) => ({ ...current, stats: nextItems }));
    setSavingState('stats', true);
    try {
      await reorderProjectsStats(mapReorderPayload(nextItems));
      await reloadStats();
    } catch (reorderError) {
      setPageData((current) => ({ ...current, stats: previousItems }));
      showToast({ title: 'Unable to reorder stats', description: getErrorMessage(reorderError), tone: 'error' });
    } finally {
      setSavingState('stats', false);
    }
  };

  const createProject = async (values: FeaturedProjectFormValues) => {
    setSavingState('featuredProjects', true);
    try {
      await createFeaturedProject(values);
      await reloadFeaturedProjects();
      showToast({ title: 'Featured project created', description: 'The project card was added successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to create featured project', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const updateProject = async (item: FeaturedProject, values: FeaturedProjectFormValues) => {
    setSavingState('featuredProjects', true);
    try {
      await updateFeaturedProject(item.id, values);
      await reloadFeaturedProjects();
      showToast({ title: 'Featured project updated', description: 'The project card was updated successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to update featured project', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const deleteProject = async (item: FeaturedProject) => {
    setSavingState('featuredProjects', true);
    try {
      await deleteFeaturedProject(item.id);
      await reloadFeaturedProjects();
      showToast({ title: 'Featured project deleted', description: `${item.title} was removed successfully.`, tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to delete featured project', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const toggleProject = async (item: FeaturedProject) => {
    const previousItems = pageData.featured_projects;
    const nextItems = previousItems.map((entry) =>
      entry.id === item.id ? { ...entry, is_active: !entry.is_active } : entry,
    );
    setPageData((current) => ({ ...current, featured_projects: nextItems }));
    try {
      await toggleFeaturedProject(item.id, !item.is_active);
      await reloadFeaturedProjects();
    } catch (toggleError) {
      setPageData((current) => ({ ...current, featured_projects: previousItems }));
      showToast({ title: 'Unable to update project status', description: getErrorMessage(toggleError), tone: 'error' });
    }
  };

  const reorderProject = async (item: FeaturedProject, direction: 'up' | 'down') => {
    const previousItems = pageData.featured_projects;
    const nextItems = moveItem(previousItems, item.id, direction);
    if (nextItems === previousItems) {
      return;
    }
    setPageData((current) => ({ ...current, featured_projects: nextItems }));
    setSavingState('featuredProjects', true);
    try {
      await reorderFeaturedProjects(mapReorderPayload(nextItems));
      await reloadFeaturedProjects();
    } catch (reorderError) {
      setPageData((current) => ({ ...current, featured_projects: previousItems }));
      showToast({ title: 'Unable to reorder featured projects', description: getErrorMessage(reorderError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const createEquipment = async (project: FeaturedProject, values: FeaturedProjectEquipmentFormValues) => {
    setSavingState('featuredProjects', true);
    try {
      await createFeaturedProjectEquipment(project.id, values);
      await reloadFeaturedProjects();
      showToast({ title: 'Equipment added', description: 'Equipment item was added to the project successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to add equipment', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const updateEquipment = async (
    project: FeaturedProject,
    item: FeaturedProjectEquipment,
    values: FeaturedProjectEquipmentFormValues,
  ) => {
    setSavingState('featuredProjects', true);
    try {
      await updateFeaturedEquipment(item.id, values);
      await reloadFeaturedProjects();
      showToast({ title: 'Equipment updated', description: `Equipment for ${project.title} was updated.`, tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to update equipment', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const deleteEquipment = async (project: FeaturedProject, item: FeaturedProjectEquipment) => {
    setSavingState('featuredProjects', true);
    try {
      await deleteFeaturedEquipment(item.id);
      await reloadFeaturedProjects();
      showToast({ title: 'Equipment deleted', description: `${item.equipment_title} was removed from ${project.title}.`, tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to delete equipment', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const toggleEquipment = async (project: FeaturedProject, item: FeaturedProjectEquipment) => {
    const previousItems = pageData.featured_projects;
    const nextItems = previousItems.map((entry) =>
      entry.id === project.id
        ? {
            ...entry,
            equipment: entry.equipment.map((equipment) =>
              equipment.id === item.id ? { ...equipment, is_active: !equipment.is_active } : equipment,
            ),
          }
        : entry,
    );
    setPageData((current) => ({ ...current, featured_projects: nextItems }));
    try {
      await toggleFeaturedEquipment(item.id, !item.is_active);
      await reloadFeaturedProjects();
    } catch (toggleError) {
      setPageData((current) => ({ ...current, featured_projects: previousItems }));
      showToast({ title: 'Unable to update equipment status', description: getErrorMessage(toggleError), tone: 'error' });
    }
  };

  const reorderEquipment = async (
    project: FeaturedProject,
    item: FeaturedProjectEquipment,
    direction: 'up' | 'down',
  ) => {
    const previousItems = pageData.featured_projects;
    const nextItems = previousItems.map((entry) =>
      entry.id === project.id
        ? {
            ...entry,
            equipment: moveItem(entry.equipment, item.id, direction),
          }
        : entry,
    );
    setPageData((current) => ({ ...current, featured_projects: nextItems }));
    setSavingState('featuredProjects', true);
    try {
      const projectAfterMove = nextItems.find((entry) => entry.id === project.id);
      await reorderFeaturedProjectEquipment(
        project.id,
        mapReorderPayload(projectAfterMove?.equipment ?? []),
      );
      await reloadFeaturedProjects();
    } catch (reorderError) {
      setPageData((current) => ({ ...current, featured_projects: previousItems }));
      showToast({ title: 'Unable to reorder equipment', description: getErrorMessage(reorderError), tone: 'error' });
    } finally {
      setSavingState('featuredProjects', false);
    }
  };

  const createTestimonial = async (values: ProjectTestimonialFormValues) => {
    setSavingState('testimonials', true);
    try {
      await createProjectsTestimonial(values);
      await reloadTestimonials();
      showToast({ title: 'Testimonial created', description: 'Client testimonial was added successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to create testimonial', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('testimonials', false);
    }
  };

  const updateTestimonial = async (item: ProjectTestimonial, values: ProjectTestimonialFormValues) => {
    setSavingState('testimonials', true);
    try {
      await updateProjectsTestimonial(item.id, values);
      await reloadTestimonials();
      showToast({ title: 'Testimonial updated', description: 'Client testimonial was updated successfully.', tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to update testimonial', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('testimonials', false);
    }
  };

  const deleteTestimonial = async (item: ProjectTestimonial) => {
    setSavingState('testimonials', true);
    try {
      await deleteProjectsTestimonial(item.id);
      await reloadTestimonials();
      showToast({ title: 'Testimonial deleted', description: `${item.client_name} testimonial was removed.`, tone: 'success' });
    } catch (submitError) {
      showToast({ title: 'Unable to delete testimonial', description: getErrorMessage(submitError), tone: 'error' });
    } finally {
      setSavingState('testimonials', false);
    }
  };

  const toggleTestimonial = async (item: ProjectTestimonial) => {
    const previousItems = pageData.testimonials;
    const nextItems = previousItems.map((entry) =>
      entry.id === item.id ? { ...entry, is_active: !entry.is_active } : entry,
    );
    setPageData((current) => ({ ...current, testimonials: nextItems }));
    try {
      await toggleProjectsTestimonial(item.id, !item.is_active);
      await reloadTestimonials();
    } catch (toggleError) {
      setPageData((current) => ({ ...current, testimonials: previousItems }));
      showToast({ title: 'Unable to update testimonial status', description: getErrorMessage(toggleError), tone: 'error' });
    }
  };

  const reorderTestimonial = async (item: ProjectTestimonial, direction: 'up' | 'down') => {
    const previousItems = pageData.testimonials;
    const nextItems = moveItem(previousItems, item.id, direction);
    if (nextItems === previousItems) {
      return;
    }
    setPageData((current) => ({ ...current, testimonials: nextItems }));
    setSavingState('testimonials', true);
    try {
      await reorderProjectsTestimonials(mapReorderPayload(nextItems));
      await reloadTestimonials();
    } catch (reorderError) {
      setPageData((current) => ({ ...current, testimonials: previousItems }));
      showToast({ title: 'Unable to reorder testimonials', description: getErrorMessage(reorderError), tone: 'error' });
    } finally {
      setSavingState('testimonials', false);
    }
  };

  const openPreview = async () => {
    previewDisclosure.open();
    if (!publicPreviewData) {
      await loadPublicPreview();
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void loadPage()} />;
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          actions={
            <>
              <Button onClick={() => void loadPage()} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => void openPreview()} variant="outline">
                <Eye className="h-4 w-4" />
                Preview API Data
              </Button>
            </>
          }
          description="Manage the Catalog > Projects page content section by section. Success Stories and Nationwide Presence are intentionally handled in their own dedicated CMS screens."
          title="Catalog Projects CMS"
        />

        <ProjectsHeroForm isLoading={isLoading} isSaving={saving.hero} onSubmit={saveHero} values={pageData.hero} />

        <ProjectsStatsManager
          isLoading={isLoading}
          isSaving={saving.stats}
          items={pageData.stats}
          onCreate={createStat}
          onDelete={deleteStat}
          onReorder={reorderStat}
          onToggle={toggleStat}
          onUpdate={updateStat}
        />

        <ProjectsFeaturedSectionForm
          isLoading={isLoading}
          isSaving={saving.featuredSection}
          onSubmit={saveFeaturedSection}
          values={pageData.featured_section}
        />

        <FeaturedProjectsManager
          isLoading={isLoading}
          isSaving={saving.featuredProjects}
          items={pageData.featured_projects}
          onCreate={createProject}
          onCreateEquipment={createEquipment}
          onDelete={deleteProject}
          onDeleteEquipment={deleteEquipment}
          onReorder={reorderProject}
          onReorderEquipment={reorderEquipment}
          onToggle={toggleProject}
          onToggleEquipment={toggleEquipment}
          onUpdate={updateProject}
          onUpdateEquipment={updateEquipment}
        />

        <ProjectsCalculatorForm
          isLoading={isLoading}
          isSaving={saving.calculator}
          onSubmit={saveCalculator}
          values={pageData.calculator}
        />

        <ProjectsTestimonialsSectionForm
          isLoading={isLoading}
          isSaving={saving.testimonialsSection}
          onSubmit={saveTestimonialsSection}
          values={pageData.testimonials_section}
        />

        <ProjectsTestimonialsManager
          isLoading={isLoading}
          isSaving={saving.testimonials}
          items={pageData.testimonials}
          onCreate={createTestimonial}
          onDelete={deleteTestimonial}
          onReorder={reorderTestimonial}
          onToggle={toggleTestimonial}
          onUpdate={updateTestimonial}
        />

        <ProjectsCtaForm isLoading={isLoading} isSaving={saving.cta} onSubmit={saveCta} values={pageData.cta} />
      </div>

      <JSONPreviewDrawer
        data={previewPayload}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Projects Page API Preview"
      />
    </>
  );
};
