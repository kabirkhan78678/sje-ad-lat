import { Save } from 'lucide-react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { FieldConfig } from '@/types/resources';
import type { CsrInitiative, CsrInitiativeFormValues } from '@/modules/home-content/types/ourContribution';

const initiativeFields: FieldConfig[] = [
  {
    name: 'image',
    label: 'Image',
    type: 'file',
    description: 'Upload a CSR initiative image. Required for new initiatives and optional during edits.',
    accept: 'image/*',
    colSpan: 2,
  },
  {
    name: 'badge',
    label: 'Badge',
    type: 'text',
    required: true,
    placeholder: 'Student Welfare',
  },
  {
    name: 'display_order',
    label: 'Display Order',
    type: 'number',
    required: true,
    placeholder: '1',
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'Educational Support',
    colSpan: 2,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 5,
    placeholder: 'Describe the initiative and its impact.',
    colSpan: 2,
  },
  {
    name: 'is_active',
    label: 'Active',
    type: 'switch',
    description: 'Inactive initiatives stay hidden on the homepage.',
    colSpan: 2,
  },
];

type OurContributionInitiativeModalProps = {
  activeInitiative: CsrInitiative | null;
  form: UseFormReturn<CsrInitiativeFormValues>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  open: boolean;
};

export const OurContributionInitiativeModal = ({
  activeInitiative,
  form,
  isSubmitting,
  onClose,
  onSubmit,
  open,
}: OurContributionInitiativeModalProps) => {
  return (
    <Modal
      description={
        activeInitiative
          ? 'Update the selected CSR initiative and optionally replace its image.'
          : 'Create a new CSR initiative card with image, badge, and description.'
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} onClick={onSubmit} type="button">
            <Save className="h-4 w-4" />
            {activeInitiative ? 'Save changes' : 'Create initiative'}
          </Button>
        </div>
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={activeInitiative ? 'Edit Initiative' : 'Add New Initiative'}
    >
      <FormProvider {...form}>
        <div className="field-grid">
          {initiativeFields.map((field) => (
            <FormFieldRenderer field={field} key={field.name} />
          ))}
        </div>
      </FormProvider>
    </Modal>
  );
};
