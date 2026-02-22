import type { ReactElement } from "react";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingConnectorFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isConnectorSubScreen,
    connectorFormMode,
    openCreateConnectorForm,
    handleConnectorSubmit,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    connectorTechnicalIdAlreadyUsed,
    cavityCount,
    setCavityCount,
    cancelConnectorEdit,
    connectorFormError
  } = props;

  return (
<article className="panel" hidden={!isConnectorSubScreen}>
  {renderFormHeader(
    connectorFormMode === "create" ? "Create Connector" : connectorFormMode === "edit" ? "Edit Connector" : "Connector form",
    connectorFormMode
  )}
  {connectorFormMode === "idle" ? renderIdleCopy("connector", openCreateConnectorForm) : (
  <form className="stack-form" onSubmit={handleConnectorSubmit}>
    <label>
      Functional name
      <input value={connectorName} onChange={(event) => setConnectorName(event.target.value)} placeholder="Rear body connector" required />
    </label>
    <label>
      Technical ID
      <input value={connectorTechnicalId} onChange={(event) => setConnectorTechnicalId(event.target.value)} placeholder="C-001" required />
    </label>
    {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <label>
      Cavity count
      <input type="number" min={1} step={1} value={cavityCount} onChange={(event) => setCavityCount(event.target.value)} required />
    </label>
    <div className="row-actions">
      <button
        type="submit"
        className="button-with-icon"
        disabled={connectorTechnicalIdAlreadyUsed}
      >
        {connectorFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {connectorFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {connectorFormMode === "create" ? "Create" : "Save"}
      </button>
      <button type="button" className={connectorFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelConnectorEdit}>
        {connectorFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {connectorFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {connectorFormError !== null ? <small className="inline-error">{connectorFormError}</small> : null}
  </form>
  )}
</article>
  );
}
