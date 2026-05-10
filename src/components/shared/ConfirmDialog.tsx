import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmDialog = ({
  confirmLabel = 'Delete',
  description,
  isLoading,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) => {
  return (
    <Modal
      description={description}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button isLoading={isLoading} onClick={onConfirm} type="button" variant="danger">
            {confirmLabel}
          </Button>
        </div>
      }
      onClose={onClose}
      open={open}
      size="md"
      title={title}
    >
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </Modal>
  );
};
