import {
  projectsFeaturedSectionDefaultValues,
  projectsFeaturedSectionFields,
  projectsFeaturedSectionSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type { ProjectsFeaturedSectionFormValues } from '@/modules/catalog/types/projectsPage';

type ProjectsFeaturedSectionFormProps = {
  values: ProjectsFeaturedSectionFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  onSubmit: (values: ProjectsFeaturedSectionFormValues) => void;
};

export const ProjectsFeaturedSectionForm = ({
  isLoading,
  isSaving,
  onSubmit,
  values,
}: ProjectsFeaturedSectionFormProps) => (
  <ProjectsSectionForm
    defaultValues={projectsFeaturedSectionDefaultValues}
    description="Control the heading block above featured projects. Success Stories and Nationwide Presence are intentionally excluded here."
    fields={projectsFeaturedSectionFields}
    isLoading={isLoading}
    isSaving={isSaving}
    onSubmit={onSubmit}
    schema={projectsFeaturedSectionSchema}
    submitLabel="Save Featured Section"
    title="Featured Projects Section"
    values={values}
  />
);
