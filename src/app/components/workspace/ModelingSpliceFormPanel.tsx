import type { ReactElement } from "react";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingSpliceFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isSpliceSubScreen,
    spliceFormMode,
    openCreateSpliceForm,
    handleSpliceSubmit,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    catalogItems,
    openCatalogSubScreen,
    spliceCatalogItemId,
    setSpliceCatalogItemId,
    spliceManufacturerReference,
    spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode,
    spliceTechnicalIdAlreadyUsed,
    portCount,
    cancelSpliceEdit,
    spliceFormError
  } = props;
  const hasCatalogItems = catalogItems.length > 0;

  return (
<article className="panel" hidden={!isSpliceSubScreen}>
  {renderFormHeader(
    spliceFormMode === "create" ? "Create Splice" : spliceFormMode === "edit" ? "Edit Splice" : "Splice form",
    spliceFormMode
  )}
  {spliceFormMode === "idle" ? renderIdleCopy("splice", openCreateSpliceForm) : (
  <form className="stack-form" onSubmit={handleSpliceSubmit}>
    <label>
      Functional name
      <input value={spliceName} onChange={(event) => setSpliceName(event.target.value)} placeholder="Cabin junction" required />
    </label>
    <label>
      Technical ID
      <input value={spliceTechnicalId} onChange={(event) => setSpliceTechnicalId(event.target.value)} placeholder="S-001" required />
    </label>
    <label>
      Catalog item (manufacturer reference)
      <select
        value={spliceCatalogItemId}
        onChange={(event) => setSpliceCatalogItemId(event.target.value)}
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
    {spliceManufacturerReference.trim().length > 0 ? (
      <small className="meta-line">Manufacturer reference: {spliceManufacturerReference}</small>
    ) : null}
    {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <label>
      Port count (from catalog)
      <input type="number" min={1} step={1} value={portCount} readOnly required />
    </label>
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={spliceAutoCreateLinkedNode}
        onChange={(event) => setSpliceAutoCreateLinkedNode(event.target.checked)}
        disabled={spliceFormMode !== "create"}
      />
      Auto-create linked node on splice creation
    </label>
    <div className="row-actions">
      <button
        type="submit"
        className="button-with-icon"
        disabled={spliceTechnicalIdAlreadyUsed || !hasCatalogItems || spliceCatalogItemId.trim().length === 0}
      >
        {spliceFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {spliceFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {spliceFormMode === "create" ? "Create" : "Save"}
      </button>
      <button type="button" className={spliceFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelSpliceEdit}>
        {spliceFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {spliceFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
  </form>
  )}
</article>
  );
}
