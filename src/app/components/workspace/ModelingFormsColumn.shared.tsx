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
        {mode === "create" ? "Create mode" : mode === "edit" ? "Edit mode" : "Idle"}
      </span>
    </header>
  );
}

export function renderIdleCopy(entityLabel: string, onCreate: () => void): ReactElement {
  return (
    <>
      <p className="empty-copy">
        Select a {entityLabel} row to view or edit it, or create a new one.
      </p>
      <div className="row-actions compact idle-panel-actions">
        <button type="button" onClick={onCreate}>
          Create
        </button>
      </div>
    </>
  );
}
