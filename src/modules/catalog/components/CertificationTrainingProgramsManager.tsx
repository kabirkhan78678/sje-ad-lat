import { Badge } from '@/components/ui/Badge';
import { CertificationComplianceCollectionManager } from '@/modules/catalog/components/CertificationComplianceCollectionManager';
import type {
  CertificationTrainingProgram,
  CertificationTrainingProgramFormValues,
} from '@/modules/catalog/types/certificationCompliance';
import type { FieldConfig } from '@/types/resources';
import { z } from 'zod';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  icon: z.string(),
  duration: z.string(),
  level: z.string(),
  certificate_text: z.string(),
  cta_text: z.string(),
  cta_link: z.string(),
  topics: z.array(z.string()),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const defaultValues: CertificationTrainingProgramFormValues = {
  title: '',
  icon: '',
  duration: '',
  level: '',
  certificate_text: '',
  cta_text: '',
  cta_link: '',
  topics: [],
  display_order: 1,
  is_active: true,
};

const fields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'duration', label: 'Duration', type: 'text' },
  { name: 'level', label: 'Level', type: 'text' },
  { name: 'certificate_text', label: 'Certificate Text', type: 'text', colSpan: 2 },
  { name: 'cta_text', label: 'CTA Text', type: 'text' },
  { name: 'cta_link', label: 'CTA Link', type: 'text' },
  {
    name: 'topics',
    label: 'Topics',
    type: 'arrayText',
    addLabel: 'Add Topic',
    itemLabel: 'Topic',
    colSpan: 2,
  },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
];

type CertificationTrainingProgramsManagerProps = {
  items: CertificationTrainingProgram[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: CertificationTrainingProgramFormValues) => void;
  onUpdate: (item: CertificationTrainingProgram, values: CertificationTrainingProgramFormValues) => void;
  onDelete: (item: CertificationTrainingProgram) => void;
};

export const CertificationTrainingProgramsManager = ({
  items,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: CertificationTrainingProgramsManagerProps) => (
  <CertificationComplianceCollectionManager
    addLabel="Add Training Program"
    columns={[
      { key: 'title', label: 'Title' },
      { key: 'duration', label: 'Duration' },
      { key: 'level', label: 'Level' },
      { key: 'topics', label: 'Topics', render: (item) => <Badge tone="neutral">{item.topics.length} items</Badge> },
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
    description="Maintain the training program cards, course metadata, and topic lists from CMS."
    emptyState={{
      title: 'No training programs yet',
      description: 'Add training program records to populate the training section.',
    }}
    entityLabel="Training Program"
    fields={fields}
    isLoading={isLoading}
    isSaving={isSaving}
    items={items}
    mapItemToFormValues={(item) => ({
      title: item.title,
      icon: item.icon,
      duration: item.duration,
      level: item.level,
      certificate_text: item.certificate_text,
      cta_text: item.cta_text,
      cta_link: item.cta_link,
      topics: item.topics,
      display_order: item.display_order,
      is_active: item.is_active,
    })}
    onCreate={onCreate}
    onDelete={onDelete}
    onUpdate={onUpdate}
    schema={schema}
    title="Training Programs"
  />
);
