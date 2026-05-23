import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CertificationComplianceContentForm } from '@/modules/catalog/components/CertificationComplianceContentForm';
import { CertificationProcessStepsManager } from '@/modules/catalog/components/CertificationProcessStepsManager';
import { CertificationServicesManager } from '@/modules/catalog/components/CertificationServicesManager';
import { CertificationTestingGroupsManager } from '@/modules/catalog/components/CertificationTestingGroupsManager';
import { CertificationTrainingProgramsManager } from '@/modules/catalog/components/CertificationTrainingProgramsManager';
import { CertificationWhyChooseUsManager } from '@/modules/catalog/components/CertificationWhyChooseUsManager';
import type {
  CertificationComplianceContentFormValues,
  CertificationComplianceContentResponse,
  CertificationProcessStep,
  CertificationProcessStepFormValues,
  CertificationService,
  CertificationServiceFormValues,
  CertificationTestingGroup,
  CertificationTestingGroupFormValues,
  CertificationTrainingProgram,
  CertificationTrainingProgramFormValues,
  CertificationWhyChooseUsItem,
  CertificationWhyChooseUsItemFormValues,
} from '@/modules/catalog/types/certificationCompliance';
import {
  createCertificationComplianceProcessStep,
  createCertificationComplianceService,
  createCertificationComplianceTestingGroup,
  createCertificationComplianceTrainingProgram,
  createCertificationComplianceWhyChooseUsItem,
  deleteCertificationComplianceProcessStep,
  deleteCertificationComplianceService,
  deleteCertificationComplianceTestingGroup,
  deleteCertificationComplianceTrainingProgram,
  deleteCertificationComplianceWhyChooseUsItem,
  getCertificationComplianceContent,
  getCertificationComplianceProcessSteps,
  getCertificationComplianceServices,
  getCertificationComplianceTestingGroups,
  getCertificationComplianceTrainingPrograms,
  getCertificationComplianceWhyChooseUsItems,
  updateCertificationComplianceContent,
  updateCertificationComplianceProcessStep,
  updateCertificationComplianceService,
  updateCertificationComplianceTestingGroup,
  updateCertificationComplianceTrainingProgram,
  updateCertificationComplianceWhyChooseUsItem,
} from '@/services/api/certificationCompliance';
import { getErrorMessage } from '@/utils/error';

type ActiveTab =
  | 'content'
  | 'services'
  | 'process-steps'
  | 'training-programs'
  | 'testing-groups'
  | 'why-choose-us';

type SavingState = {
  content: boolean;
  services: boolean;
  processSteps: boolean;
  trainingPrograms: boolean;
  testingGroups: boolean;
  whyChooseUs: boolean;
};

const tabOptions: Array<{ id: ActiveTab; label: string; description: string }> = [
  { id: 'content', label: 'Page Content', description: 'Hero, section titles, testing callouts, and CTA content.' },
  { id: 'services', label: 'Certification Services', description: 'Service cards, CTA links, and bullet items.' },
  { id: 'process-steps', label: 'Certification Process Steps', description: 'Process cards with step labels and deliverables.' },
  { id: 'training-programs', label: 'Training Programs', description: 'Program cards, CTA details, and topic lists.' },
  { id: 'testing-groups', label: 'Testing Groups', description: 'Testing group blocks and item lists.' },
  { id: 'why-choose-us', label: 'Why Choose Us Items', description: 'Trust-building cards with icons and descriptions.' },
];

const defaultSavingState: SavingState = {
  content: false,
  services: false,
  processSteps: false,
  trainingPrograms: false,
  testingGroups: false,
  whyChooseUs: false,
};

const toRecord = (value: unknown) =>
  (typeof value === 'object' && value ? value : {}) as Record<string, unknown>;

const toString = (value: unknown) => (value === null || value === undefined ? '' : String(value));

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }

  return Boolean(value);
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => toString(item).trim()).filter(Boolean) : [];

const sanitizeStringArray = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

const normalizeService = (value: unknown): CertificationService => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    description: toString(item.description),
    icon: toString(item.icon),
    cta_text: toString(item.cta_text),
    cta_link: toString(item.cta_link),
    items: toStringArray(item.items),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeProcessStep = (value: unknown): CertificationProcessStep => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    step_number: toString(item.step_number),
    title: toString(item.title),
    duration: toString(item.duration),
    description: toString(item.description),
    deliverables: toStringArray(item.deliverables),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeTrainingProgram = (value: unknown): CertificationTrainingProgram => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    icon: toString(item.icon),
    duration: toString(item.duration),
    level: toString(item.level),
    certificate_text: toString(item.certificate_text),
    cta_text: toString(item.cta_text),
    cta_link: toString(item.cta_link),
    topics: toStringArray(item.topics),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeTestingGroup = (value: unknown): CertificationTestingGroup => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    items: toStringArray(item.items),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeWhyChooseUsItem = (value: unknown): CertificationWhyChooseUsItem => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    description: toString(item.description),
    icon: toString(item.icon),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const buildContentPayload = (values: CertificationComplianceContentFormValues) => ({
  hero_badge_text: values.hero_badge_text.trim(),
  hero_badge_icon: values.hero_badge_icon.trim(),
  hero_title: values.hero_title.trim(),
  hero_subtitle: values.hero_subtitle.trim(),
  hero_primary_cta_text: values.hero_primary_cta_text.trim(),
  hero_primary_cta_link: values.hero_primary_cta_link.trim(),
  hero_secondary_cta_text: values.hero_secondary_cta_text.trim(),
  hero_secondary_cta_link: values.hero_secondary_cta_link.trim(),
  services_section_title: values.services_section_title.trim(),
  services_section_subtitle: values.services_section_subtitle.trim(),
  process_section_title: values.process_section_title.trim(),
  process_section_subtitle: values.process_section_subtitle.trim(),
  process_bottom_cta_text: values.process_bottom_cta_text.trim(),
  process_bottom_cta_link: values.process_bottom_cta_link.trim(),
  training_section_title: values.training_section_title.trim(),
  training_section_subtitle: values.training_section_subtitle.trim(),
  testing_section_title: values.testing_section_title.trim(),
  testing_section_subtitle: values.testing_section_subtitle.trim(),
  testing_service_title: values.testing_service_title.trim(),
  testing_service_icon: values.testing_service_icon.trim(),
  testing_turnaround_time: values.testing_turnaround_time.trim(),
  testing_cta_text: values.testing_cta_text.trim(),
  testing_cta_link: values.testing_cta_link.trim(),
  why_choose_us_section_title: values.why_choose_us_section_title.trim(),
  why_choose_us_section_subtitle: values.why_choose_us_section_subtitle.trim(),
  cta_section_title: values.cta_section_title.trim(),
  cta_section_subtitle: values.cta_section_subtitle.trim(),
  cta_primary_cta_text: values.cta_primary_cta_text.trim(),
  cta_primary_cta_link: values.cta_primary_cta_link.trim(),
  cta_secondary_cta_text: values.cta_secondary_cta_text.trim(),
  cta_secondary_cta_link: values.cta_secondary_cta_link.trim(),
  cta_secondary_cta_icon: values.cta_secondary_cta_icon.trim(),
  is_active: values.is_active ? 1 : 0,
});

const buildServicePayload = (values: CertificationServiceFormValues) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  icon: values.icon.trim(),
  cta_text: values.cta_text.trim(),
  cta_link: values.cta_link.trim(),
  items: sanitizeStringArray(values.items),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

const buildProcessStepPayload = (values: CertificationProcessStepFormValues) => ({
  step_number: values.step_number.trim(),
  title: values.title.trim(),
  duration: values.duration.trim(),
  description: values.description.trim(),
  deliverables: sanitizeStringArray(values.deliverables),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

const buildTrainingProgramPayload = (values: CertificationTrainingProgramFormValues) => ({
  title: values.title.trim(),
  icon: values.icon.trim(),
  duration: values.duration.trim(),
  level: values.level.trim(),
  certificate_text: values.certificate_text.trim(),
  cta_text: values.cta_text.trim(),
  cta_link: values.cta_link.trim(),
  topics: sanitizeStringArray(values.topics),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

const buildTestingGroupPayload = (values: CertificationTestingGroupFormValues) => ({
  title: values.title.trim(),
  items: sanitizeStringArray(values.items),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

const buildWhyChooseUsPayload = (values: CertificationWhyChooseUsItemFormValues) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  icon: values.icon.trim(),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

export const CertificationCompliancePage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');
  const [content, setContent] = useState<CertificationComplianceContentResponse | null>(null);
  const [services, setServices] = useState<CertificationService[]>([]);
  const [processSteps, setProcessSteps] = useState<CertificationProcessStep[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<CertificationTrainingProgram[]>([]);
  const [testingGroups, setTestingGroups] = useState<CertificationTestingGroup[]>([]);
  const [whyChooseUsItems, setWhyChooseUsItems] = useState<CertificationWhyChooseUsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingState, setSavingState] = useState<SavingState>(defaultSavingState);
  const [error, setError] = useState<string | null>(null);

  const setSaving = (key: keyof SavingState, value: boolean) => {
    setSavingState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const fetchServices = async () => {
    const response = await getCertificationComplianceServices();
    return response.items.map((item) => normalizeService(item));
  };

  const fetchProcessSteps = async () => {
    const response = await getCertificationComplianceProcessSteps();
    return response.items.map((item) => normalizeProcessStep(item));
  };

  const fetchTrainingPrograms = async () => {
    const response = await getCertificationComplianceTrainingPrograms();
    return response.items.map((item) => normalizeTrainingProgram(item));
  };

  const fetchTestingGroups = async () => {
    const response = await getCertificationComplianceTestingGroups();
    return response.items.map((item) => normalizeTestingGroup(item));
  };

  const fetchWhyChooseUsItems = async () => {
    const response = await getCertificationComplianceWhyChooseUsItems();
    return response.items.map((item) => normalizeWhyChooseUsItem(item));
  };

  const loadServices = async () => {
    setServices(await fetchServices());
  };

  const loadProcessSteps = async () => {
    setProcessSteps(await fetchProcessSteps());
  };

  const loadTrainingPrograms = async () => {
    setTrainingPrograms(await fetchTrainingPrograms());
  };

  const loadTestingGroups = async () => {
    setTestingGroups(await fetchTestingGroups());
  };

  const loadWhyChooseUsItems = async () => {
    setWhyChooseUsItems(await fetchWhyChooseUsItems());
  };

  const loadPage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        contentResponse,
        nextServices,
        nextProcessSteps,
        nextTrainingPrograms,
        nextTestingGroups,
        nextWhyChooseUsItems,
      ] = await Promise.all([
        getCertificationComplianceContent(),
        fetchServices(),
        fetchProcessSteps(),
        fetchTrainingPrograms(),
        fetchTestingGroups(),
        fetchWhyChooseUsItems(),
      ]);

      setContent(contentResponse);
      setServices(nextServices);
      setProcessSteps(nextProcessSteps);
      setTrainingPrograms(nextTrainingPrograms);
      setTestingGroups(nextTestingGroups);
      setWhyChooseUsItems(nextWhyChooseUsItems);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load Certification & Compliance CMS data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const saveContent = async (values: CertificationComplianceContentFormValues) => {
    setSaving('content', true);

    try {
      const response = await updateCertificationComplianceContent(buildContentPayload(values));
      setContent(response);
      showToast({
        title: 'Certification & Compliance content updated',
        description: 'Page-level hero, section headings, and CTA content were saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save page content',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('content', false);
    }
  };

  const createService = async (values: CertificationServiceFormValues) => {
    setSaving('services', true);

    try {
      await createCertificationComplianceService(buildServicePayload(values));
      await loadServices();
      showToast({
        title: 'Service created',
        description: 'The certification service card was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create service',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('services', false);
    }
  };

  const updateService = async (item: CertificationService, values: CertificationServiceFormValues) => {
    setSaving('services', true);

    try {
      await updateCertificationComplianceService(item.id, buildServicePayload(values));
      await loadServices();
      showToast({
        title: 'Service updated',
        description: 'The certification service card was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update service',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('services', false);
    }
  };

  const deleteService = async (item: CertificationService) => {
    setSaving('services', true);

    try {
      await deleteCertificationComplianceService(item.id);
      await loadServices();
      showToast({
        title: 'Service deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete service',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('services', false);
    }
  };

  const createProcessStep = async (values: CertificationProcessStepFormValues) => {
    setSaving('processSteps', true);

    try {
      await createCertificationComplianceProcessStep(buildProcessStepPayload(values));
      await loadProcessSteps();
      showToast({
        title: 'Process step created',
        description: 'The certification process step was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create process step',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('processSteps', false);
    }
  };

  const updateProcessStep = async (
    item: CertificationProcessStep,
    values: CertificationProcessStepFormValues,
  ) => {
    setSaving('processSteps', true);

    try {
      await updateCertificationComplianceProcessStep(item.id, buildProcessStepPayload(values));
      await loadProcessSteps();
      showToast({
        title: 'Process step updated',
        description: 'The certification process step was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update process step',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('processSteps', false);
    }
  };

  const deleteProcessStep = async (item: CertificationProcessStep) => {
    setSaving('processSteps', true);

    try {
      await deleteCertificationComplianceProcessStep(item.id);
      await loadProcessSteps();
      showToast({
        title: 'Process step deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete process step',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('processSteps', false);
    }
  };

  const createTrainingProgram = async (values: CertificationTrainingProgramFormValues) => {
    setSaving('trainingPrograms', true);

    try {
      await createCertificationComplianceTrainingProgram(buildTrainingProgramPayload(values));
      await loadTrainingPrograms();
      showToast({
        title: 'Training program created',
        description: 'The training program card was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create training program',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('trainingPrograms', false);
    }
  };

  const updateTrainingProgram = async (
    item: CertificationTrainingProgram,
    values: CertificationTrainingProgramFormValues,
  ) => {
    setSaving('trainingPrograms', true);

    try {
      await updateCertificationComplianceTrainingProgram(item.id, buildTrainingProgramPayload(values));
      await loadTrainingPrograms();
      showToast({
        title: 'Training program updated',
        description: 'The training program card was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update training program',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('trainingPrograms', false);
    }
  };

  const deleteTrainingProgram = async (item: CertificationTrainingProgram) => {
    setSaving('trainingPrograms', true);

    try {
      await deleteCertificationComplianceTrainingProgram(item.id);
      await loadTrainingPrograms();
      showToast({
        title: 'Training program deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete training program',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('trainingPrograms', false);
    }
  };

  const createTestingGroup = async (values: CertificationTestingGroupFormValues) => {
    setSaving('testingGroups', true);

    try {
      await createCertificationComplianceTestingGroup(buildTestingGroupPayload(values));
      await loadTestingGroups();
      showToast({
        title: 'Testing group created',
        description: 'The testing group was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create testing group',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('testingGroups', false);
    }
  };

  const updateTestingGroup = async (
    item: CertificationTestingGroup,
    values: CertificationTestingGroupFormValues,
  ) => {
    setSaving('testingGroups', true);

    try {
      await updateCertificationComplianceTestingGroup(item.id, buildTestingGroupPayload(values));
      await loadTestingGroups();
      showToast({
        title: 'Testing group updated',
        description: 'The testing group was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update testing group',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('testingGroups', false);
    }
  };

  const deleteTestingGroup = async (item: CertificationTestingGroup) => {
    setSaving('testingGroups', true);

    try {
      await deleteCertificationComplianceTestingGroup(item.id);
      await loadTestingGroups();
      showToast({
        title: 'Testing group deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete testing group',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('testingGroups', false);
    }
  };

  const createWhyChooseUsItem = async (values: CertificationWhyChooseUsItemFormValues) => {
    setSaving('whyChooseUs', true);

    try {
      await createCertificationComplianceWhyChooseUsItem(buildWhyChooseUsPayload(values));
      await loadWhyChooseUsItems();
      showToast({
        title: 'Why Choose Us item created',
        description: 'The Why Choose Us card was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create Why Choose Us item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('whyChooseUs', false);
    }
  };

  const updateWhyChooseUsItem = async (
    item: CertificationWhyChooseUsItem,
    values: CertificationWhyChooseUsItemFormValues,
  ) => {
    setSaving('whyChooseUs', true);

    try {
      await updateCertificationComplianceWhyChooseUsItem(item.id, buildWhyChooseUsPayload(values));
      await loadWhyChooseUsItems();
      showToast({
        title: 'Why Choose Us item updated',
        description: 'The Why Choose Us card was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update Why Choose Us item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('whyChooseUs', false);
    }
  };

  const deleteWhyChooseUsItem = async (item: CertificationWhyChooseUsItem) => {
    setSaving('whyChooseUs', true);

    try {
      await deleteCertificationComplianceWhyChooseUsItem(item.id);
      await loadWhyChooseUsItems();
      showToast({
        title: 'Why Choose Us item deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete Why Choose Us item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('whyChooseUs', false);
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void loadPage()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={() => void loadPage()} variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
        description="Manage all Certification & Compliance page content and supporting repeatable sections from backend CMS APIs."
        title="Certification & Compliance"
      />

      <div className="flex flex-wrap gap-3">
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              activeTab === tab.id
                ? 'border-brand-400 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{tab.label}</span>
              {activeTab === tab.id ? <Badge tone="info">Active</Badge> : null}
            </div>
            <p className="mt-1 text-sm opacity-80">{tab.description}</p>
          </button>
        ))}
      </div>

      {activeTab === 'content' ? (
        <CertificationComplianceContentForm
          data={content}
          isLoading={isLoading}
          isSaving={savingState.content}
          onSubmit={(values) => void saveContent(values)}
        />
      ) : null}

      {activeTab === 'services' ? (
        <CertificationServicesManager
          isLoading={isLoading}
          isSaving={savingState.services}
          items={services}
          onCreate={(values) => void createService(values)}
          onDelete={(item) => void deleteService(item)}
          onUpdate={(item, values) => void updateService(item, values)}
        />
      ) : null}

      {activeTab === 'process-steps' ? (
        <CertificationProcessStepsManager
          isLoading={isLoading}
          isSaving={savingState.processSteps}
          items={processSteps}
          onCreate={(values) => void createProcessStep(values)}
          onDelete={(item) => void deleteProcessStep(item)}
          onUpdate={(item, values) => void updateProcessStep(item, values)}
        />
      ) : null}

      {activeTab === 'training-programs' ? (
        <CertificationTrainingProgramsManager
          isLoading={isLoading}
          isSaving={savingState.trainingPrograms}
          items={trainingPrograms}
          onCreate={(values) => void createTrainingProgram(values)}
          onDelete={(item) => void deleteTrainingProgram(item)}
          onUpdate={(item, values) => void updateTrainingProgram(item, values)}
        />
      ) : null}

      {activeTab === 'testing-groups' ? (
        <CertificationTestingGroupsManager
          isLoading={isLoading}
          isSaving={savingState.testingGroups}
          items={testingGroups}
          onCreate={(values) => void createTestingGroup(values)}
          onDelete={(item) => void deleteTestingGroup(item)}
          onUpdate={(item, values) => void updateTestingGroup(item, values)}
        />
      ) : null}

      {activeTab === 'why-choose-us' ? (
        <CertificationWhyChooseUsManager
          isLoading={isLoading}
          isSaving={savingState.whyChooseUs}
          items={whyChooseUsItems}
          onCreate={(values) => void createWhyChooseUsItem(values)}
          onDelete={(item) => void deleteWhyChooseUsItem(item)}
          onUpdate={(item, values) => void updateWhyChooseUsItem(item, values)}
        />
      ) : null}
    </div>
  );
};
