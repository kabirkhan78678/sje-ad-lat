import { FormProvider, type UseFormReturn } from 'react-hook-form';
import { Save } from 'lucide-react';

import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { FieldConfig } from '@/types/resources';
import type { CoreServicePillarCard, CoreServicePillarCardFormValues } from '@/modules/home-content/types/coreServicePillars';

const cardFields: FieldConfig[] = [
  {
    name: 'image',
    label: 'Image',
    type: 'file',
    description: 'Upload a card image. This is required for new cards and optional while editing.',
    accept: 'image/*',
    colSpan: 2,
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'Laboratory Infrastructure & Equipment',
    colSpan: 2,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Describe the service pillar in a clear, benefit-led way.',
    colSpan: 2,
  },
  {
    name: 'bullet_items',
    label: 'Bullet Items',
    type: 'arrayText',
    addLabel: 'Add bullet point',
    itemLabel: 'Bullet point',
    colSpan: 2,
  },
  {
    name: 'learn_more_label',
    label: 'Learn More Label',
    type: 'text',
    required: true,
    placeholder: 'Learn More',
  },
  {
    name: 'learn_more_url',
    label: 'Learn More URL',
    type: 'text',
    required: true,
    placeholder: '/catalog?cat=lab-infrastructure',
  },
  {
    name: 'get_quote_label',
    label: 'Get Quote Label',
    type: 'text',
    required: true,
    placeholder: 'Get Quote',
  },
  {
    name: 'get_quote_url',
    label: 'Get Quote URL',
    type: 'text',
    required: true,
    placeholder: '#contact',
  },
  {
    name: 'sort_order',
    label: 'Sort Order',
    type: 'number',
    required: true,
    placeholder: '1',
  },
  {
    name: 'is_active',
    label: 'Active',
    type: 'switch',
    description: 'Only up to 3 cards can stay active at the same time.',
    colSpan: 2,
  },
];

type CoreServicePillarCardModalProps = {
  activeCard: CoreServicePillarCard | null;
  form: UseFormReturn<CoreServicePillarCardFormValues>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  open: boolean;
};

export const CoreServicePillarCardModal = ({
  activeCard,
  form,
  isSubmitting,
  onClose,
  onSubmit,
  open,
}: CoreServicePillarCardModalProps) => {
  return (
    <Modal
      description={
        activeCard
          ? 'Update the selected service pillar card and save your changes.'
          : 'Create a new service pillar card with image, links, and bullet points.'
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} onClick={onSubmit} type="button">
            <Save className="h-4 w-4" />
            {activeCard ? 'Save changes' : 'Create card'}
          </Button>
        </div>
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={activeCard ? 'Edit Service Card' : 'Add New Service Card'}
    >
      <FormProvider {...form}>
        <div className="field-grid">
          {cardFields.map((field) => (
            <FormFieldRenderer field={field} key={field.name} />
          ))}
        </div>
      </FormProvider>
    </Modal>
  );
};
