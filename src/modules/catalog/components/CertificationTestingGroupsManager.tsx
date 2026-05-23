import { Badge } from '@/components/ui/Badge';
import { CertificationComplianceCollectionManager } from '@/modules/catalog/components/CertificationComplianceCollectionManager';
import type {
  CertificationTestingGroup,
  CertificationTestingGroupFormValues,
} from '@/modules/catalog/types/certificationCompliance';
import type { FieldConfig } from '@/types/resources';
import { z } from 'zod';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  items: z.array(z.string()),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const defaultValues: CertificationTestingGroupFormValues = {
  title: '',
  items: [],
  display_order: 1,
  is_active: true,
};

const fields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
  {
    name: 'items',
    label: 'Items',
    type: 'arrayText',
    addLabel: 'Add Testing Item',
    itemLabel: 'Testing Item',
    colSpan: 2,
  },
];

type CertificationTestingGroupsManagerProps = {
  items: CertificationTestingGroup[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: CertificationTestingGroupFormValues) => void;
  onUpdate: (item: CertificationTestingGroup, values: CertificationTestingGroupFormValues) => void;
  onDelete: (item: CertificationTestingGroup) => void;
};

export const CertificationTestingGroupsManager = ({
  items,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: CertificationTestingGroupsManagerProps) => (
  <CertificationComplianceCollectionManager
    addLabel="Add Testing Group"
    columns={[
      { key: 'title', label: 'Title' },
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
    description="Manage the testing group blocks and their repeatable item lists from the admin panel."
    emptyState={{
      title: 'No testing groups yet',
      description: 'Add testing groups to populate the testing services area.',
    }}
    entityLabel="Testing Group"
    fields={fields}
    isLoading={isLoading}
    isSaving={isSaving}
    items={items}
    mapItemToFormValues={(item) => ({
      title: item.title,
      items: item.items,
      display_order: item.display_order,
      is_active: item.is_active,
    })}
    onCreate={onCreate}
    onDelete={onDelete}
    onUpdate={onUpdate}
    schema={schema}
    title="Testing Groups"
  />
);
