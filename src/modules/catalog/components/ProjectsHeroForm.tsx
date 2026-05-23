import {
  projectsHeroDefaultValues,
  projectsHeroFields,
  projectsHeroSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type { ProjectsHeroFormValues } from '@/modules/catalog/types/projectsPage';

type ProjectsHeroFormProps = {
  values: ProjectsHeroFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  onSubmit: (values: ProjectsHeroFormValues) => void;
};

export const ProjectsHeroForm = ({ isLoading, isSaving, onSubmit, values }: ProjectsHeroFormProps) => (
  <ProjectsSectionForm
    defaultValues={projectsHeroDefaultValues}
    description="Manage the Projects page hero copy, CTA links, and publishing state."
    fields={projectsHeroFields}
    isLoading={isLoading}
    isSaving={isSaving}
    onSubmit={onSubmit}
    schema={projectsHeroSchema}
    submitLabel="Save Hero Section"
    title="Hero Section"
    values={values}
  />
);
