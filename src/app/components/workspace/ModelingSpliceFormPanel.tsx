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
    splicePortMode,
    setSplicePortMode,
    spliceManufacturerReference,
    spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode,
    spliceTechnicalIdAlreadyUsed,
    portCount,
    setPortCount,
    spliceFormInfo,
    cancelSpliceEdit,
    spliceFormError
  } = props;
  const hasCatalogItems = catalogItems.length > 0;
  const isCatalogLinked = spliceCatalogItemId.trim().length > 0;
  const isUnbounded = splicePortMode === "unbounded";

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
      >
        <option value="">No catalog item</option>
        {catalogItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.manufacturerReference} ({item.connectionCount})
          </option>
        ))}
      </select>
    </label>
    {!hasCatalogItems ? (
      <div className="row-actions compact">
        <small className="inline-help">No catalog item is required for splices. Create one only when you need a linked product reference.</small>
        <button type="button" className="button-with-icon" onClick={openCatalogSubScreen}>
          <span className="action-button-icon is-catalog" aria-hidden="true" />
          Open Catalog
        </button>
      </div>
    ) : null}
    {spliceManufacturerReference.trim().length > 0 ? (
      <small className="meta-line">{`Manufacturer reference: ${spliceManufacturerReference}`}</small>
    ) : null}
    {isCatalogLinked ? (
      <small className="inline-help">Catalog-linked splices are always bounded and derive port count from catalog connection count.</small>
    ) : null}
    {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <label>
      Capacity mode
      <select
        value={splicePortMode}
        onChange={(event) => setSplicePortMode(event.target.value as "bounded" | "unbounded")}
        disabled={isCatalogLinked}
      >
        <option value="bounded">Bounded</option>
        <option value="unbounded">Unbounded (∞)</option>
      </select>
    </label>
    {isUnbounded ? (
      <label>
        Port count
        <input value="∞" readOnly aria-readonly="true" />
      </label>
    ) : (
      <label>
        {isCatalogLinked ? "Port count (from catalog)" : "Port count"}
        <input
          type="number"
          min={1}
          step={1}
          value={portCount}
          onChange={(event) => setPortCount(event.target.value)}
          readOnly={isCatalogLinked}
          required={!isUnbounded}
        />
      </label>
    )}
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
        disabled={spliceTechnicalIdAlreadyUsed}
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
    {spliceFormInfo !== null ? <small className="inline-help">{spliceFormInfo}</small> : null}
    {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
  </form>
  )}
</article>
  );
}
