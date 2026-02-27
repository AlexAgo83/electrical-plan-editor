export type ConfirmDialogIntent = "neutral" | "warning" | "danger";

export interface ConfirmDialogRequest {
  title: string;
  message: string;
  details?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: ConfirmDialogIntent;
  closeOnBackdrop?: boolean;
}
