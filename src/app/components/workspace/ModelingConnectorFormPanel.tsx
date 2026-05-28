import type { ReactElement } from "react";
import { useConnectorHandlersContext } from "../controller/ModelingController.context";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import { buildModelingDynamicSelectOptions } from "../../lib/modelingSelectOptions";
import { EntityReferenceButton } from "./EntityReferenceButton";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingConnectorFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isConnectorSubScreen,
    connectorFormMode,
    connectorEditAfterCreate,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    catalogItems,
    openCatalogSubScreen,
    onSelectCatalogItem,
    connectorCatalogItemId,
    setConnectorCatalogItemId,
    connectorManufacturerReference,
    connectorIsMainHarnessConnector,
    setConnectorIsMainHarnessConnector,
    connectorApplyCatalogPlugs,
    setConnectorApplyCatalogPlugs,
    connectorApplyCatalogSeals,
    setConnectorApplyCatalogSeals,
    connectorTerminalOverridesText,
    setConnectorTerminalOverridesText,
    connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode,
    connectorTechnicalIdAlreadyUsed,
    cavityCount,
    connectorFormError
  } = props;
  const connectorHandlers = useConnectorHandlersContext();
  const hasCatalogItems = catalogItems.length > 0;
  const selectedCatalogItem = catalogItems.find((item) => item.id === connectorCatalogItemId);
  const catalogItemOptions = buildModelingDynamicSelectOptions({
    options: catalogItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturerReference}${item.name?.trim() ? ` - ${item.name.trim()}` : ""} (${item.connectionCount})`
    })),
    selectedValue: connectorCatalogItemId,
    missingOption:
      connectorCatalogItemId.trim().length === 0
        ? null
        : { label: `Missing catalog item (${connectorCatalogItemId})` }
  });

  return (
<article className="panel" hidden={!isConnectorSubScreen} data-form-panel={FORM_PANEL_IDS.connector}>
  {renderFormHeader(
    connectorFormMode === "create" ? "Create Connector" : connectorFormMode === "edit" ? "Edit Connector" : "Connector form",
    connectorFormMode
  )}
  {connectorFormMode === "idle" ? renderIdleCopy("connector", connectorHandlers.resetConnectorForm) : (
  <form className="stack-form" onSubmit={connectorHandlers.handleConnectorSubmit}>
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
        {catalogItemOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
      <small className="meta-line">
        {selectedCatalogItem === undefined ? (
          `Manufacturer reference: ${connectorManufacturerReference}`
        ) : (
          <EntityReferenceButton
            title={`Open catalog item ${connectorManufacturerReference}`}
            onClick={() => onSelectCatalogItem(selectedCatalogItem.id)}
          >
            Manufacturer reference: <span className="technical-id">{connectorManufacturerReference}</span>
          </EntityReferenceButton>
        )}
      </small>
    ) : null}
    {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <label>
      Way count (from catalog)
      <input type="number" min={1} step={1} value={cavityCount} readOnly required />
    </label>
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={connectorIsMainHarnessConnector}
        onChange={(event) => setConnectorIsMainHarnessConnector(event.target.checked)}
      />
      Main harness connector for functional view
    </label>
    <fieldset className="inline-fieldset catalog-material-application-fieldset">
      <legend>Catalog material application</legend>
      <label className="settings-checkbox">
        <input
          type="checkbox"
          checked={connectorApplyCatalogSeals}
          onChange={(event) => setConnectorApplyCatalogSeals(event.target.checked)}
        />
        Apply catalog seals
      </label>
      <label className="settings-checkbox">
        <input
          type="checkbox"
          checked={connectorApplyCatalogPlugs}
          onChange={(event) => setConnectorApplyCatalogPlugs(event.target.checked)}
        />
        Apply catalog plugs
      </label>
      <label>
        Terminal and seal overrides
        <textarea
          value={connectorTerminalOverridesText}
          onChange={(event) => setConnectorTerminalOverridesText(event.target.value)}
          placeholder={"1,TERM-A,SEAL-A,Terminal name,Seal name\n2,TERM-B,SEAL-B"}
          rows={3}
        />
      </label>
      <button
        type="button"
        className="button-with-icon"
        onClick={() => setConnectorTerminalOverridesText("")}
      >
        <span className="action-button-icon is-delete" aria-hidden="true" />
        Clear terminal and seal overrides
      </button>
    </fieldset>
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
      {connectorFormMode === "edit" && connectorEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={connectorHandlers.resetConnectorForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          New
        </button>
      ) : null}
      <button
        type="button"
        className={connectorFormMode === "edit" ? "button-with-icon" : undefined}
        onClick={connectorHandlers.cancelConnectorEdit}
      >
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
