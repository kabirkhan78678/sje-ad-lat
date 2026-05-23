import {
  projectsCalculatorDefaultValues,
  projectsCalculatorFields,
  projectsCalculatorSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type { ProjectsCalculatorFormValues } from '@/modules/catalog/types/projectsPage';

type ProjectsCalculatorFormProps = {
  values: ProjectsCalculatorFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  onSubmit: (values: ProjectsCalculatorFormValues) => void;
};

export const ProjectsCalculatorForm = ({
  isLoading,
  isSaving,
  onSubmit,
  values,
}: ProjectsCalculatorFormProps) => (
  <ProjectsSectionForm
    defaultValues={projectsCalculatorDefaultValues}
    description="Configure the calculator copy, slider bounds, CTA behavior, and formula JSON used by the public Projects page."
    fields={projectsCalculatorFields}
    footerNote="Validation ensures the default value stays between the configured min and max, and that either a button link or action key is present."
    isLoading={isLoading}
    isSaving={isSaving}
    onSubmit={onSubmit}
    schema={projectsCalculatorSchema}
    submitLabel="Save Calculator Section"
    title="Production Capacity Calculator"
    values={values}
  />
);
