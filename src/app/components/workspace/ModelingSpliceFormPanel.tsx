import type { ReactElement } from "react";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import { buildModelingDynamicSelectOptions } from "../../lib/modelingSelectOptions";
import { EntityReferenceButton } from "./EntityReferenceButton";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingSpliceFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isSpliceSubScreen,
    spliceFormMode,
    spliceEditAfterCreate,
    openCreateSpliceForm,
    handleSpliceSubmit,
    handleConvertSpliceToDirectional,
    handleRerouteSpliceConnectedWires,
    handleSuggestOptimizedSplicePlacement,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    catalogItems,
    openCatalogSubScreen,
    onSelectCatalogItem,
    spliceCatalogItemId,
    setSpliceCatalogItemId,
    splicePortMode,
    setSplicePortMode,
    spliceSideInverted,
    setSpliceSideInverted,
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
  const isDirectional = splicePortMode === "directional";
  const selectedCatalogItem = catalogItems.find((item) => item.id === spliceCatalogItemId);
  const catalogItemOptions = buildModelingDynamicSelectOptions({
    options: catalogItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturerReference}${item.name?.trim() ? ` - ${item.name.trim()}` : ""} (${item.connectionCount})`
    })),
    selectedValue: spliceCatalogItemId,
    missingOption: isCatalogLinked ? { label: `Missing catalog item (${spliceCatalogItemId})` } : null
  });

  return (
<article className="panel" hidden={!isSpliceSubScreen} data-form-panel={FORM_PANEL_IDS.splice}>
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
        {catalogItemOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
      <small className="meta-line">
        {selectedCatalogItem === undefined ? (
          `Manufacturer reference: ${spliceManufacturerReference}`
        ) : (
          <EntityReferenceButton
            title={`Open catalog item ${spliceManufacturerReference}`}
            onClick={() => onSelectCatalogItem(selectedCatalogItem.id)}
          >
            Manufacturer reference: <span className="technical-id">{spliceManufacturerReference}</span>
          </EntityReferenceButton>
        )}
      </small>
    ) : null}
    {isCatalogLinked ? (
      <small className="inline-help">Catalog-linked directional splices keep L/R sides; legacy bounded splices derive port count from catalog connection count.</small>
    ) : null}
    {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    {spliceFormMode === "create" ? (
      <label>
        Splice type
        <select
          value={splicePortMode}
          onChange={(event) => setSplicePortMode(event.target.value as "bounded" | "unbounded" | "directional")}
        >
          <option value="bounded">Legacy bounded ports</option>
          <option value="unbounded" disabled={isCatalogLinked}>Legacy unbounded ports</option>
          <option value="directional">Automatic L/R directional</option>
        </select>
      </label>
    ) : null}
    {spliceFormMode === "edit" && !isDirectional ? (
      <>
        <label>
          Legacy capacity mode
          <select
            value={splicePortMode}
            onChange={(event) => setSplicePortMode(event.target.value as "bounded" | "unbounded")}
            disabled={isCatalogLinked}
          >
            <option value="bounded">Bounded</option>
            <option value="unbounded">Unbounded (infinity)</option>
          </select>
        </label>
        <div className="row-actions compact">
          <button type="button" className="button-with-icon" onClick={handleConvertSpliceToDirectional}>
            <span className="action-button-icon is-swap" aria-hidden="true" />
            Convert to automatic L/R
          </button>
        </div>
      </>
    ) : null}
    {isDirectional ? (
      <small className="inline-help">Directional splice: wire endpoints are assigned automatically to L or R from routing.</small>
    ) : null}
    {isDirectional ? (
      <>
        <label>
          Directional ports
          <input value="L / R" readOnly aria-readonly="true" />
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={spliceSideInverted}
            onChange={(event) => setSpliceSideInverted(event.target.checked)}
          />{" "}
          Invert all L/R assignments
        </label>
        {spliceFormMode === "edit" ? (
          <div className="row-actions compact">
            <button type="button" className="button-with-icon" onClick={handleRerouteSpliceConnectedWires}>
              <span className="action-button-icon is-swap" aria-hidden="true" />
              Reroute connected wires
            </button>
          </div>
        ) : null}
      </>
    ) : isUnbounded ? (
      <label>
        Port count
        <input value="infinity" readOnly aria-readonly="true" />
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
      {spliceFormMode === "edit" && spliceEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={openCreateSpliceForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          New
        </button>
      ) : null}
      <button type="button" className={spliceFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelSpliceEdit}>
        {spliceFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {spliceFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
      {spliceFormMode === "edit" && isDirectional ? (
        <button type="button" className="button-with-icon" onClick={handleSuggestOptimizedSplicePlacement}>
          <span className="action-button-icon is-analysis" aria-hidden="true" />
          Suggest optimized placement
        </button>
      ) : null}
    </div>
    {spliceFormInfo !== null ? <small className="inline-help">{spliceFormInfo}</small> : null}
    {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
  </form>
  )}
</article>
  );
}
