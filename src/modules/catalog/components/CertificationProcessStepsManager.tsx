import { Badge } from '@/components/ui/Badge';
import { CertificationComplianceCollectionManager } from '@/modules/catalog/components/CertificationComplianceCollectionManager';
import type {
  CertificationProcessStep,
  CertificationProcessStepFormValues,
} from '@/modules/catalog/types/certificationCompliance';
import type { FieldConfig } from '@/types/resources';
import { z } from 'zod';

const schema = z.object({
  step_number: z.string().trim().min(1, 'Step number is required.'),
  title: z.string().trim().min(1, 'Title is required.'),
  duration: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const defaultValues: CertificationProcessStepFormValues = {
  step_number: '',
  title: '',
  duration: '',
  description: '',
  deliverables: [],
  display_order: 1,
  is_active: true,
};

const fields: FieldConfig[] = [
  { name: 'step_number', label: 'Step Number', type: 'text', required: true },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'duration', label: 'Duration', type: 'text' },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
  {
    name: 'deliverables',
    label: 'Deliverables',
    type: 'arrayText',
    addLabel: 'Add Deliverable',
    itemLabel: 'Deliverable',
    colSpan: 2,
  },
];

type CertificationProcessStepsManagerProps = {
  items: CertificationProcessStep[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: CertificationProcessStepFormValues) => void;
  onUpdate: (item: CertificationProcessStep, values: CertificationProcessStepFormValues) => void;
  onDelete: (item: CertificationProcessStep) => void;
};

export const CertificationProcessStepsManager = ({
  items,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: CertificationProcessStepsManagerProps) => (
  <CertificationComplianceCollectionManager
    addLabel="Add Process Step"
    columns={[
      { key: 'step_number', label: 'Step No.' },
      { key: 'title', label: 'Title' },
      { key: 'duration', label: 'Duration' },
      {
        key: 'deliverables',
        label: 'Deliverables',
        render: (item) => <Badge tone="neutral">{item.deliverables.length} items</Badge>,
      },
      { key: 'display_order', label: 'Order' },
      {
        key: 'is_active',
        label: 'Status',
        render: (item) => (
          <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
        ),
      },
    ]}
    defaultValues={defaultValues}
    description="Manage the step-by-step certification process cards and their deliverables."
    emptyState={{
      title: 'No process steps yet',
      description: 'Add process steps to populate the certification journey section.',
    }}
    entityLabel="Process Step"
    fields={fields}
    isLoading={isLoading}
    isSaving={isSaving}
    items={items}
    mapItemToFormValues={(item) => ({
      step_number: item.step_number,
      title: item.title,
      duration: item.duration,
      description: item.description,
      deliverables: item.deliverables,
      display_order: item.display_order,
      is_active: item.is_active,
    })}
    onCreate={onCreate}
    onDelete={onDelete}
    onUpdate={onUpdate}
    schema={schema}
    title="Certification Process Steps"
  />
);
