import { translateCurrent as t } from "../../lib/i18n";
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
    splicePlacementSegmentId,
    setSplicePlacementSegmentId,
    splicePlacementFromNodeId,
    setSplicePlacementFromNodeId,
    splicePlacementOffsetMm,
    setSplicePlacementOffsetMm,
    spliceTechnicalIdAlreadyUsed,
    portCount,
    setPortCount,
    spliceFormInfo,
    cancelSpliceEdit,
    spliceFormError,
    segments,
    nodes,
    describeNode
  } = props;
  const hasCatalogItems = catalogItems.length > 0;
  const isCatalogLinked = spliceCatalogItemId.trim().length > 0;
  const isUnbounded = splicePortMode === "unbounded";
  const isDirectional = splicePortMode === "directional";
  const selectedCatalogItem = catalogItems.find((item) => item.id === spliceCatalogItemId);
  const selectablePlacementSegments = segments.filter((segment) => segment.role !== "rearBackshellLink");
  const selectedPlacementSegment =
    splicePlacementSegmentId.trim().length === 0
      ? undefined
      : selectablePlacementSegments.find((segment) => segment.id === splicePlacementSegmentId);
  const placementReferenceNodeIds =
    selectedPlacementSegment === undefined
      ? []
      : [selectedPlacementSegment.nodeA, selectedPlacementSegment.nodeB];
  const nodeById = new Map(nodes.map((node) => [node.id, node] as const));
  const catalogItemOptions = buildModelingDynamicSelectOptions({
    options: catalogItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturerReference}${item.name?.trim() ? ` - ${item.name.trim()}` : ""} (${item.connectionCount})`
    })),
    selectedValue: spliceCatalogItemId,
    missingOption: isCatalogLinked ? { label: t("ui.missingCatalogItemValue", { itemId: spliceCatalogItemId }) } : null
  });

  return (
<article className="panel" hidden={!isSpliceSubScreen} data-form-panel={FORM_PANEL_IDS.splice}>
  {renderFormHeader(
    spliceFormMode === "create" ? t("ui.createSplice") : spliceFormMode === "edit" ? t("ui.editSplice") : t("ui.spliceForm"),
    spliceFormMode
  )}
  {spliceFormMode === "idle" ? renderIdleCopy("splice", openCreateSpliceForm) : (
  <form className="stack-form" onSubmit={handleSpliceSubmit}>
    <label>
      
      {t("ui.functionalName")}
      <input value={spliceName} onChange={(event) => setSpliceName(event.target.value)} placeholder={t("ui.cabinJunction")} required />
    </label>
    <label>
      
      {t("ui.technicalID")}
      <input value={spliceTechnicalId} onChange={(event) => setSpliceTechnicalId(event.target.value)} placeholder="S-001" required />
    </label>
    <label>
      
      {t("ui.catalogItemManufacturerReference")}
      <select
        value={spliceCatalogItemId}
        onChange={(event) => setSpliceCatalogItemId(event.target.value)}
      >
        <option value="">{t("ui.noCatalogItem")}</option>
        {catalogItemOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    {!hasCatalogItems ? (
      <div className="row-actions compact">
        <small className="inline-help">{t("ui.noCatalogItemIsRequiredForSplicesCreateOneOnly")}</small>
        <button type="button" className="button-with-icon" onClick={openCatalogSubScreen}>
          <span className="action-button-icon is-catalog" aria-hidden="true" />
          
          {t("ui.openCatalog")}
        </button>
      </div>
    ) : null}
    {spliceManufacturerReference.trim().length > 0 ? (
      <small className="meta-line">
        {selectedCatalogItem === undefined ? (
          t("ui.manufacturerReferenceValue", { reference: spliceManufacturerReference })
        ) : (
          <EntityReferenceButton
            title={t("ui.modelingspliceformpanelOpenCatalogItemSpliceManufacturerReference", { spliceManufacturerReference: spliceManufacturerReference })}
            onClick={() => onSelectCatalogItem(selectedCatalogItem.id)}
          >
            
            {t("ui.manufacturerReference2")} <span className="technical-id">{spliceManufacturerReference}</span>
          </EntityReferenceButton>
        )}
      </small>
    ) : null}
    {isCatalogLinked ? (
      <small className="inline-help">Catalog-linked directional splices keep L/R sides; legacy bounded splices derive port count from catalog connection count.</small>
    ) : null}
    {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">{t("ui.thisTechnicalIDIsAlreadyUsed")}</small> : null}
    {spliceFormMode === "create" ? (
      <label>
        {t("ui.modelingspliceformpanelSpliceType")}<select
          value={splicePortMode}
          onChange={(event) => setSplicePortMode(event.target.value as "bounded" | "unbounded" | "directional")}
        >
          <option value="bounded">{t("ui.modelingspliceformpanelLegacyBoundedPorts")}</option>
          <option value="unbounded" disabled={isCatalogLinked}>{t("ui.modelingspliceformpanelLegacyUnboundedPorts")}</option>
          <option value="directional">{t("ui.modelingspliceformpanelAutomaticLRDirectional")}</option>
        </select>
      </label>
    ) : null}
    {spliceFormMode === "edit" && !isDirectional ? (
      <>
        <label>
          {t("ui.modelingspliceformpanelLegacyCapacityMode")}<select
            value={splicePortMode}
            onChange={(event) => setSplicePortMode(event.target.value as "bounded" | "unbounded")}
            disabled={isCatalogLinked}
          >
            <option value="bounded">{t("ui.bounded")}</option>
            <option value="unbounded">{t("ui.modelingspliceformpanelUnboundedInfinity")}</option>
          </select>
        </label>
        <div className="row-actions compact">
          <button type="button" className="button-with-icon" onClick={handleConvertSpliceToDirectional}>
            <span className="action-button-icon is-swap" aria-hidden="true" />
            {t("ui.modelingspliceformpanelConvertToAutomaticLR")}</button>
        </div>
      </>
    ) : null}
    {isDirectional ? (
      <small className="inline-help">{t("ui.modelingspliceformpanelDirectionalSpliceWireEndpointsAreAssignedAutomaticallyToLOr")}</small>
    ) : null}
    {isDirectional ? (
      <>
        <label>
          {t("ui.modelingspliceformpanelDirectionalPorts")}<input value="L / R" readOnly aria-readonly="true" />
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={spliceSideInverted}
            onChange={(event) => setSpliceSideInverted(event.target.checked)}
          />{" "}
          {t("ui.modelingspliceformpanelInvertAllLRAssignments")}</label>
        {spliceFormMode === "edit" ? (
          <div className="row-actions compact">
            <button type="button" className="button-with-icon" onClick={handleRerouteSpliceConnectedWires}>
              <span className="action-button-icon is-swap" aria-hidden="true" />
              {t("ui.modelingspliceformpanelRerouteConnectedWires")}</button>
          </div>
        ) : null}
      </>
    ) : isUnbounded ? (
      <label>
        
        {t("ui.portCount")}
        <input value="infinity" readOnly aria-readonly="true" />
      </label>
    ) : (
      <label>
        {isCatalogLinked ? t("ui.portCountFromCatalog") : t("ui.portCount")}
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
    <label>
      {t("ui.modelingspliceformpanelHostSegment")}<select
        value={splicePlacementSegmentId}
        onChange={(event) => {
          const nextSegmentId = event.target.value;
          setSplicePlacementSegmentId(nextSegmentId);
          const nextSegment = selectablePlacementSegments.find((segment) => segment.id === nextSegmentId);
          setSplicePlacementFromNodeId(nextSegment?.nodeA ?? "");
          if (nextSegmentId.length === 0) {
            setSplicePlacementOffsetMm("0");
          }
        }}
      >
        <option value="">{t("ui.modelingspliceformpanelUnplacedDraft")}</option>
        {selectablePlacementSegments.map((segment) => {
          const nodeA = nodeById.get(segment.nodeA);
          const nodeB = nodeById.get(segment.nodeB);
          return (
            <option key={segment.id} value={segment.id}>
              {segment.id} ({nodeA === undefined ? segment.nodeA : describeNode(nodeA)} ↔ {nodeB === undefined ? segment.nodeB : describeNode(nodeB)}, {segment.lengthMm} {t("ui.modelingspliceformpanelMm")}</option>
          );
        })}
      </select>
    </label>
    {selectedPlacementSegment !== undefined ? (
      <>
        <label>
          {t("ui.modelingspliceformpanelReferenceNode")}<select
            value={splicePlacementFromNodeId}
            onChange={(event) => setSplicePlacementFromNodeId(event.target.value)}
          >
            {placementReferenceNodeIds.map((nodeId) => {
              const node = nodeById.get(nodeId);
              return (
                <option key={nodeId} value={nodeId}>
                  {node === undefined ? nodeId : describeNode(node)}
                </option>
              );
            })}
          </select>
        </label>
        <label>
          {t("ui.modelingspliceformpanelOffsetFromReferenceMm")}<input
            type="number"
            min={0}
            step={1}
            value={splicePlacementOffsetMm}
            onChange={(event) => setSplicePlacementOffsetMm(event.target.value)}
          />
        </label>
        <small className="inline-help">
          {t("ui.modelingspliceformpanelHostSegmentLength")}{selectedPlacementSegment.lengthMm} {t("ui.modelingspliceformpanelMm0AndTheFullSegmentLengthAreValidPlacements")}</small>
      </>
    ) : (
      <small className="inline-help">
        {t("ui.modelingspliceformpanelUnplacedSplicesStayOutOfNetworkSummaryAndCannotBe")}</small>
    )}
    <div className="row-actions">
      <button
        type="submit"
        className="button-with-icon"
        disabled={spliceTechnicalIdAlreadyUsed}
      >
        {spliceFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {spliceFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {spliceFormMode === "create" ? t("ui.create") : t("ui.save")}
      </button>
      {spliceFormMode === "edit" && spliceEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={openCreateSpliceForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          
          {t("ui.new")}
        </button>
      ) : null}
      <button type="button" className={spliceFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelSpliceEdit}>
        {spliceFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {spliceFormMode === "edit" ? t("ui.cancelEdit") : t("ui.cancel")}
      </button>
      {spliceFormMode === "edit" && isDirectional ? (
        <button type="button" className="button-with-icon" onClick={handleSuggestOptimizedSplicePlacement}>
          <span className="action-button-icon is-analysis" aria-hidden="true" />
          
          {t("ui.suggestOptimizedLengths")}
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
