import {
  projectsTestimonialsSectionDefaultValues,
  projectsTestimonialsSectionFields,
  projectsTestimonialsSectionSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type { ProjectsTestimonialsSectionFormValues } from '@/modules/catalog/types/projectsPage';

type ProjectsTestimonialsSectionFormProps = {
  values: ProjectsTestimonialsSectionFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  onSubmit: (values: ProjectsTestimonialsSectionFormValues) => void;
};

export const ProjectsTestimonialsSectionForm = ({
  isLoading,
  isSaving,
  onSubmit,
  values,
}: ProjectsTestimonialsSectionFormProps) => (
  <ProjectsSectionForm
    defaultValues={projectsTestimonialsSectionDefaultValues}
    description="Update the heading content shown above client testimonials on the Projects page."
    fields={projectsTestimonialsSectionFields}
    isLoading={isLoading}
    isSaving={isSaving}
    onSubmit={onSubmit}
    schema={projectsTestimonialsSectionSchema}
    submitLabel="Save Testimonials Section"
    title="Client Testimonials Section"
    values={values}
  />
);
