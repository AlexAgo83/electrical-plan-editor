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
    catalogItems,
    openCatalogSubScreen,
    connectorCatalogItemId,
    setConnectorCatalogItemId,
    connectorManufacturerReference,
    connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode,
    connectorTechnicalIdAlreadyUsed,
    cavityCount,
    cancelConnectorEdit,
    connectorFormError
  } = props;
  const hasCatalogItems = catalogItems.length > 0;

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
    <label>
      Catalog item (manufacturer reference)
      <select
        value={connectorCatalogItemId}
        onChange={(event) => setConnectorCatalogItemId(event.target.value)}
        required
        disabled={!hasCatalogItems}
      >
        <option value="">Select a catalog item</option>
        {catalogItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.manufacturerReference} ({item.connectionCount})
          </option>
        ))}
      </select>
    </label>
    {!hasCatalogItems ? (
      <div className="row-actions compact">
        <small className="inline-error">Create a catalog item first to define manufacturer reference and connection count.</small>
        <button type="button" className="button-with-icon" onClick={openCatalogSubScreen}>
          <span className="action-button-icon is-catalog" aria-hidden="true" />
          Open Catalog
        </button>
      </div>
    ) : null}
    {connectorManufacturerReference.trim().length > 0 ? (
      <small className="meta-line">Manufacturer reference: {connectorManufacturerReference}</small>
    ) : null}
    {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <label>
      Way count (from catalog)
      <input type="number" min={1} step={1} value={cavityCount} readOnly required />
    </label>
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={connectorAutoCreateLinkedNode}
        onChange={(event) => setConnectorAutoCreateLinkedNode(event.target.checked)}
        disabled={connectorFormMode !== "create"}
      />
      Auto-create linked node on connector creation
    </label>
    <div className="row-actions">
      <button
        type="submit"
        className="button-with-icon"
        disabled={connectorTechnicalIdAlreadyUsed || !hasCatalogItems || connectorCatalogItemId.trim().length === 0}
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
