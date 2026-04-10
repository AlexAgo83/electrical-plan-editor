import type { DeleteDependencySummaryCategory, DeleteImpactDialogVariant } from "./delete-impact-dialog";

export type ConfirmDialogIntent = "neutral" | "warning" | "danger";

export interface ChoiceDialogOption {
  id: string;
  label: string;
  intent?: ConfirmDialogIntent;
}

export interface ConfirmDialogRequest {
  title: string;
  message: string;
  details?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: ConfirmDialogIntent;
  closeOnBackdrop?: boolean;
  confirmOnEnter?: boolean;
  variant?: "standard" | DeleteImpactDialogVariant;
  summaryCategories?: DeleteDependencySummaryCategory[];
  summaryNote?: string;
}

export interface ChoiceDialogRequest {
  title: string;
  message: string;
  details?: string;
  discardLabel?: string;
  options: ChoiceDialogOption[];
  closeOnBackdrop?: boolean;
}
