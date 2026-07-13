import { translateCurrent as t } from "../../lib/i18n";
import type { ReactElement } from "react";

export type ModelingFormMode = "idle" | "create" | "edit";

export function renderFormHeader(title: string, mode: ModelingFormMode): ReactElement {
  return (
    <header className="network-form-header">
      <h2>{title}</h2>
      <span
        className={
          mode === "create"
            ? "network-form-mode-chip is-create"
            : mode === "edit"
              ? "network-form-mode-chip is-edit"
              : "network-form-mode-chip"
        }
      >
        {mode === "create" ? t("ui.createMode") : mode === "edit" ? t("ui.editMode") : t("ui.idle")}
      </span>
    </header>
  );
}

export function renderIdleCopy(entityLabel: string, onCreate: () => void): ReactElement {
  const idleCopy = t("ui.selectEntityRow", { entity: entityLabel.toLowerCase() });
  return (
    <>
      <p className="empty-copy">{idleCopy}</p>
      <div className="row-actions compact idle-panel-actions">
        <button type="button" className="button-with-icon" onClick={onCreate}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          
          {t("ui.create")}
        </button>
      </div>
    </>
  );
}
