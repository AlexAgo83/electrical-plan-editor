import type { ReactElement } from "react";

interface PreviewLoadingDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
}

export function PreviewLoadingDialog({
  isOpen,
  themeHostClassName,
  title,
  message
}: PreviewLoadingDialogProps): ReactElement | null {
  if (!isOpen) {
    return null;
  }

  const titleId = "preview-loading-dialog-title";
  const messageId = "preview-loading-dialog-message";

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <div className="confirm-dialog-backdrop preview-loading-backdrop" aria-hidden="true" />
      <section
        className="confirm-dialog panel preview-loading-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        aria-busy="true"
      >
        <div className="preview-loading-spinner" aria-hidden="true" />
        <div className="preview-loading-copy" role="status">
          <h2 id={titleId}>{title}</h2>
          <p id={messageId}>{message}</p>
        </div>
      </section>
    </div>
  );
}
