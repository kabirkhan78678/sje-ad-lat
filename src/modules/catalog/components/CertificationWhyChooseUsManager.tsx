import { Badge } from '@/components/ui/Badge';
import { CertificationComplianceCollectionManager } from '@/modules/catalog/components/CertificationComplianceCollectionManager';
import type {
  CertificationWhyChooseUsItem,
  CertificationWhyChooseUsItemFormValues,
} from '@/modules/catalog/types/certificationCompliance';
import type { FieldConfig } from '@/types/resources';
import { z } from 'zod';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string(),
  icon: z.string(),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const defaultValues: CertificationWhyChooseUsItemFormValues = {
  title: '',
  description: '',
  icon: '',
  display_order: 1,
  is_active: true,
};

const fields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
];

type CertificationWhyChooseUsManagerProps = {
  items: CertificationWhyChooseUsItem[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: CertificationWhyChooseUsItemFormValues) => void;
  onUpdate: (item: CertificationWhyChooseUsItem, values: CertificationWhyChooseUsItemFormValues) => void;
  onDelete: (item: CertificationWhyChooseUsItem) => void;
};

export const CertificationWhyChooseUsManager = ({
  items,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: CertificationWhyChooseUsManagerProps) => (
  <CertificationComplianceCollectionManager
    addLabel="Add Why Choose Us Item"
    columns={[
      { key: 'title', label: 'Title' },
      { key: 'icon', label: 'Icon', render: (item) => <Badge tone="info">{item.icon || '—'}</Badge> },
      { key: 'description', label: 'Description' },
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
    description="Maintain the trust and differentiation items shown in the Why Choose Us section."
    emptyState={{
      title: 'No Why Choose Us items yet',
      description: 'Add items to populate the Why Choose Us section.',
    }}
    entityLabel="Why Choose Us Item"
    fields={fields}
    isLoading={isLoading}
    isSaving={isSaving}
    items={items}
    mapItemToFormValues={(item) => ({
      title: item.title,
      description: item.description,
      icon: item.icon,
      display_order: item.display_order,
      is_active: item.is_active,
    })}
    onCreate={onCreate}
    onDelete={onDelete}
    onUpdate={onUpdate}
    schema={schema}
    title="Why Choose Us Items"
  />
);
