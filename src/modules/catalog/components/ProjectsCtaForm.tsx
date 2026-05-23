import {
  projectsCtaDefaultValues,
  projectsCtaFields,
  projectsCtaSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type { ProjectsCtaFormValues } from '@/modules/catalog/types/projectsPage';

type ProjectsCtaFormProps = {
  values: ProjectsCtaFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  onSubmit: (values: ProjectsCtaFormValues) => void;
};

export const ProjectsCtaForm = ({ isLoading, isSaving, onSubmit, values }: ProjectsCtaFormProps) => (
  <ProjectsSectionForm
    defaultValues={projectsCtaDefaultValues}
    description="Manage the closing conversion block with both CTA buttons and publishing state."
    fields={projectsCtaFields}
    isLoading={isLoading}
    isSaving={isSaving}
    onSubmit={onSubmit}
    schema={projectsCtaSchema}
    submitLabel="Save Final CTA"
    title="Final CTA Section"
    values={values}
  />
);
