/* eslint-disable prettier/prettier */
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "destructive" | "warning";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "destructive",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isWarning = variant === "warning";
  const Icon = isWarning ? AlertTriangle : Trash2;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card p-0 gap-0 overflow-hidden sm:rounded-2xl">
        <div className="px-6 pt-6 pb-4">
          <div
            className={cn(
              "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
              isWarning ? "bg-amber-500/15 text-amber-600" : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <AlertDialogHeader className="space-y-2 text-center sm:text-center">
            <AlertDialogTitle className="font-display text-lg font-semibold">{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-sm leading-relaxed">{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="border-t border-border bg-muted/30 px-6 py-4 sm:justify-center gap-2">
          <AlertDialogCancel disabled={loading} className="rounded-md min-w-[7rem]">
            {cancelLabel}
          </AlertDialogCancel>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              buttonVariants({ variant: isWarning ? "default" : "destructive" }),
              "rounded-md min-w-[7rem]",
              isWarning && "bg-amber-600 text-white hover:bg-amber-600/90",
            )}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Patientez…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
