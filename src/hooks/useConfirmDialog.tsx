/* eslint-disable prettier/prettier */
import { useCallback, useState } from "react";
import { ConfirmDialog, type ConfirmDialogVariant } from "@/components/ConfirmDialog";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void | Promise<void>;
};

export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
  }, []);

  const close = useCallback(() => {
    if (!loading) setOptions(null);
  }, [loading]);

  const handleConfirm = async () => {
    if (!options) return;
    setLoading(true);
    try {
      await options.onConfirm();
      setOptions(null);
    } finally {
      setLoading(false);
    }
  };

  const dialog = (
    <ConfirmDialog
      open={!!options}
      onOpenChange={(open) => !open && close()}
      title={options?.title ?? ""}
      description={options?.description}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      variant={options?.variant}
      loading={loading}
      onConfirm={() => void handleConfirm()}
    />
  );

  return { ask, dialog };
}
