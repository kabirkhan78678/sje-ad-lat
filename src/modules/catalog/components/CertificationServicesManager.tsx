import { Badge } from '@/components/ui/Badge';
import { CertificationComplianceCollectionManager } from '@/modules/catalog/components/CertificationComplianceCollectionManager';
import type {
  CertificationService,
  CertificationServiceFormValues,
} from '@/modules/catalog/types/certificationCompliance';
import type { FieldConfig } from '@/types/resources';
import { z } from 'zod';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string(),
  icon: z.string(),
  cta_text: z.string(),
  cta_link: z.string(),
  items: z.array(z.string()),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const defaultValues: CertificationServiceFormValues = {
  title: '',
  description: '',
  icon: '',
  cta_text: '',
  cta_link: '',
  items: [],
  display_order: 1,
  is_active: true,
};

const fields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'cta_text', label: 'CTA Text', type: 'text' },
  { name: 'cta_link', label: 'CTA Link', type: 'text' },
  {
    name: 'items',
    label: 'Bullet Items',
    type: 'arrayText',
    addLabel: 'Add Bullet Item',
    itemLabel: 'Bullet Item',
    colSpan: 2,
  },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
];

type CertificationServicesManagerProps = {
  items: CertificationService[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: CertificationServiceFormValues) => void;
  onUpdate: (item: CertificationService, values: CertificationServiceFormValues) => void;
  onDelete: (item: CertificationService) => void;
};

export const CertificationServicesManager = ({
  items,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: CertificationServicesManagerProps) => (
  <CertificationComplianceCollectionManager
    addLabel="Add Service"
    columns={[
      { key: 'title', label: 'Title' },
      { key: 'icon', label: 'Icon', render: (item) => <Badge tone="info">{item.icon || '—'}</Badge> },
      { key: 'items', label: 'Items', render: (item) => <Badge tone="neutral">{item.items.length} items</Badge> },
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
    description="Create and maintain the certification service cards rendered on the public page."
    emptyState={{
      title: 'No certification services yet',
      description: 'Add service cards to populate the Certification & Compliance page.',
    }}
    entityLabel="Service"
    fields={fields}
    isLoading={isLoading}
    isSaving={isSaving}
    items={items}
    mapItemToFormValues={(item) => ({
      title: item.title,
      description: item.description,
      icon: item.icon,
      cta_text: item.cta_text,
      cta_link: item.cta_link,
      items: item.items,
      display_order: item.display_order,
      is_active: item.is_active,
    })}
    onCreate={onCreate}
    onDelete={onDelete}
    onUpdate={onUpdate}
    schema={schema}
    title="Certification Services"
  />
);
