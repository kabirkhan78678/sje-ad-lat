import { Drawer } from '@/components/ui/Drawer';

type JSONPreviewDrawerProps = {
  open: boolean;
  title: string;
  data: unknown;
  onClose: () => void;
};

export const JSONPreviewDrawer = ({ data, onClose, open, title }: JSONPreviewDrawerProps) => {
  return (
    <Drawer
      description="A read-only view of the most recently loaded API payload for this page."
      onClose={onClose}
      open={open}
      title={title}
      width="lg"
    >
      <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </Drawer>
  );
};
