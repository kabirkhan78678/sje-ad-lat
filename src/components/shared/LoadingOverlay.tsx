import { Spinner } from "@/components/ui/Spinner";

type LoadingOverlayProps = {
  show?: boolean;
  isLoading?: boolean;
  label?: string;
  message?: string;
};

export const LoadingOverlay = ({
  label = "Saving changes...",
  message,
  show = false,
  isLoading,
}: LoadingOverlayProps) => {
  const displayLabel = message ?? label;
  const shouldShow = isLoading ?? show;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
        <Spinner className="text-brand-600" />
        <span className="text-sm font-semibold text-slate-700">
          {displayLabel}
        </span>
      </div>
    </div>
  );
};
