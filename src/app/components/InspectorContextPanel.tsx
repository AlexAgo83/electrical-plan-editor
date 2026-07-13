import { translateCurrent as t } from "../lib/i18n";
import type { ReactElement } from "react";
import { CABLE_COLOR_BY_ID, getWireColorLabel, isWireFreeColorMode, type WireColorMode } from "../../core/cableColors";
import type { CatalogItem, Connector, NetworkNode, Segment, Splice, SpliceId, Wire } from "../../core/entities";
import type { SelectionState } from "../../store/types";
import { EntityReferenceButton } from "./workspace/EntityReferenceButton";

interface InspectorContextPanelProps {
  mode: "open" | "collapsed";
  canExpandFromCollapsed: boolean;
  canCollapseToCollapsed: boolean;
  onExpandFromCollapsed: () => void;
  onCollapseToCollapsed: () => void;
  onCloseInspector: () => void;
  selected: SelectionState | null;
  selectedSubScreen: "catalog" | "connector" | "splice" | "node" | "segment" | "wire" | null;
  selectedCatalogItem: CatalogItem | null;
  selectedConnector: Connector | null;
  selectedSplice: Splice | null;
  selectedNode: NetworkNode | null;
  selectedSegment: Segment | null;
  selectedWire: Wire | null;
  connectorOccupiedCount: number;
  spliceOccupiedCount: number;
  describeNode: (node: NetworkNode) => string;
  onEditSelected: () => void;
  onSelectCatalogItem: (catalogItemId: CatalogItem["id"]) => void;
  onClearSelection: () => void;
  onSuggestOptimizedSplicePlacement: (spliceId: SpliceId) => void;
}

export function InspectorContextPanel({
  mode,
  canExpandFromCollapsed,
  canCollapseToCollapsed,
  onExpandFromCollapsed,
  onCollapseToCollapsed,
  onCloseInspector,
  selected,
  selectedSubScreen,
  selectedCatalogItem,
  selectedConnector,
  selectedSplice,
  selectedNode,
  selectedSegment,
  selectedWire,
  connectorOccupiedCount,
  spliceOccupiedCount,
  describeNode,
  onEditSelected,
  onSelectCatalogItem,
  onClearSelection,
  onSuggestOptimizedSplicePlacement
}: InspectorContextPanelProps): ReactElement {
  function renderCatalogReference(reference: string, catalogItemId: CatalogItem["id"] | undefined): ReactElement | string {
    if (catalogItemId === undefined) {
      return reference;
    }

    return (
      <EntityReferenceButton title={`Open catalog item ${reference}`} onClick={() => onSelectCatalogItem(catalogItemId)}>
        <span className="technical-id">{reference}</span>
      </EntityReferenceButton>
    );
  }

  function renderCableColorSwatches(
    colorMode: WireColorMode | null | undefined,
    primaryColorId: string | null,
    secondaryColorId: string | null,
    freeColorLabel?: string | null
  ): ReactElement | string | null {
    const wireColor = { colorMode, primaryColorId, secondaryColorId, freeColorLabel };
    if (isWireFreeColorMode(wireColor)) {
      if (freeColorLabel === null || freeColorLabel === undefined) {
        return null;
      }
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={getWireColorLabel(wireColor)}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "2rem",
              padding: "0.05rem 0.35rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: "0.75rem"
            }}
          >
            
            {t("ui.free")}
          </span>
          <span>{getWireColorLabel(wireColor)}</span>
        </span>
      );
    }

    if (primaryColorId === null) {
      return null;
    }

    const primary = CABLE_COLOR_BY_ID[primaryColorId];
    const secondary = secondaryColorId === null ? null : CABLE_COLOR_BY_ID[secondaryColorId];
    const colorLabel =
      secondaryColorId === null
        ? primary?.label ?? `Unknown (${primaryColorId})`
        : `${primary?.label ?? `Unknown (${primaryColorId})`} / ${secondary?.label ?? `Unknown (${secondaryColorId})`}`;
    const colorCode = secondaryColorId === null ? primaryColorId : `${primaryColorId}/${secondaryColorId}`;

    const swatchStyleBase = {
      display: "inline-block",
      width: "0.75rem",
      height: "0.75rem",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.25)",
      verticalAlign: "middle"
    } satisfies React.CSSProperties;
    const unknownSwatchColor = "#7a7a7a";

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }} title={colorLabel}>
        <span
          aria-hidden="true"
          style={{ ...swatchStyleBase, background: primary?.hex ?? unknownSwatchColor }}
        />
        {secondary !== null || secondaryColorId !== null ? (
          <span
            aria-hidden="true"
            style={{ ...swatchStyleBase, background: secondary?.hex ?? unknownSwatchColor }}
          />
        ) : null}
        <span className="technical-id">{colorCode}</span>
        <span>{colorLabel}</span>
      </span>
    );
  }

  const isCollapsed = mode === "collapsed";
  const detailRows: Array<{ label: string; value: ReactElement | string }> = [];

  if (selectedCatalogItem !== null) {
    detailRows.push({
      label: t("ui.manufacturerReference"),
      value: <span className="technical-id">{selectedCatalogItem.manufacturerReference}</span>
    });
    detailRows.push({ label: t("ui.name"), value: selectedCatalogItem.name ?? "" });
    detailRows.push({ label: "Connections", value: String(selectedCatalogItem.connectionCount) });
  }

  if (selectedConnector !== null) {
    detailRows.push({ label: t("ui.name"), value: selectedConnector.name });
    detailRows.push({ label: t("ui.technicalID"), value: <span className="technical-id">{selectedConnector.technicalId}</span> });
    if ((selectedConnector.manufacturerReference?.trim() ?? "").length > 0) {
      detailRows.push({
        label: t("ui.manufacturerReference"),
        value: renderCatalogReference(selectedConnector.manufacturerReference as string, selectedConnector.catalogItemId)
      });
    }
    detailRows.push({ label: t("ui.ways"), value: `${selectedConnector.cavityCount} / Occupied ${connectorOccupiedCount}` });
  }

  if (selectedSplice !== null) {
    detailRows.push({ label: t("ui.name"), value: selectedSplice.name });
    detailRows.push({ label: t("ui.technicalID"), value: <span className="technical-id">{selectedSplice.technicalId}</span> });
    if ((selectedSplice.manufacturerReference?.trim() ?? "").length > 0) {
      detailRows.push({
        label: t("ui.manufacturerReference"),
        value: renderCatalogReference(selectedSplice.manufacturerReference as string, selectedSplice.catalogItemId)
      });
    }
    detailRows.push({ label: t("ui.ports"), value: `${selectedSplice.portCount} / Occupied ${spliceOccupiedCount}` });
  }

  if (selectedNode !== null) {
    detailRows.push({ label: t("ui.nodeKind"), value: selectedNode.kind });
    detailRows.push({ label: t("ui.reference"), value: describeNode(selectedNode) });
  }

  if (selectedSegment !== null) {
    detailRows.push({ label: t("ui.nodeA"), value: <span className="technical-id">{selectedSegment.nodeA}</span> });
    detailRows.push({ label: t("ui.nodeB"), value: <span className="technical-id">{selectedSegment.nodeB}</span> });
    detailRows.push({ label: t("ui.length"), value: `${selectedSegment.lengthMm} mm` });
  }

  if (selectedWire !== null) {
    detailRows.push({ label: t("ui.name"), value: selectedWire.name });
    detailRows.push({ label: t("ui.technicalID"), value: <span className="technical-id">{selectedWire.technicalId}</span> });
    if ((selectedWire.twistGroupLabel ?? "").trim().length > 0) {
      detailRows.push({ label: "Twist group", value: selectedWire.twistGroupLabel as string });
    }
    detailRows.push({ label: "Section", value: `${selectedWire.sectionMm2} mm²` });
    const cableColors = renderCableColorSwatches(
      selectedWire.colorMode,
      selectedWire.primaryColorId,
      selectedWire.secondaryColorId,
      selectedWire.freeColorLabel
    );
    if (cableColors !== null) {
      detailRows.push({
        label: t("ui.cableColors"),
        value: cableColors
      });
    }
    if ((selectedWire.endpointAConnectionReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: t("ui.endpointAConnectionRef"), value: selectedWire.endpointAConnectionReference as string });
    }
    if ((selectedWire.endpointASealReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: t("ui.endpointASealRef"), value: selectedWire.endpointASealReference as string });
    }
    if ((selectedWire.endpointBConnectionReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: t("ui.endpointBConnectionRef"), value: selectedWire.endpointBConnectionReference as string });
    }
    if ((selectedWire.endpointBSealReference?.trim() ?? "").length > 0) {
      detailRows.push({ label: t("ui.endpointBSealRef"), value: selectedWire.endpointBSealReference as string });
    }
    detailRows.push({
      label: "Route",
      value: `${selectedWire.isRouteLocked ? t("ui.locked") : t("ui.auto")} / ${
        selectedWire.routeSegmentIds.length === 0 ? t("ui.none2") : selectedWire.routeSegmentIds.join(" -> ")
      }`
    });
  }

  const focusedEntityDisplayId =
    selectedCatalogItem?.manufacturerReference ??
    selectedConnector?.technicalId ??
    selectedSplice?.technicalId ??
    selectedWire?.technicalId ??
    selected?.id ??
    "";

  return (
    <article className={isCollapsed ? "panel inspector-context-panel is-collapsed" : "panel inspector-context-panel"}>
      <div className="inspector-context-header">
        <h2>{t("ui.inspectorContext")}</h2>
        <div className="inspector-context-header-actions">
          {isCollapsed && canExpandFromCollapsed ? (
            <button type="button" className="inspector-context-toggle" onClick={onExpandFromCollapsed}>
              <span className="inspector-context-toggle-icon" aria-hidden="true" />
              
              {t("ui.expand")}
            </button>
          ) : null}
          {!isCollapsed && canCollapseToCollapsed ? (
            <button type="button" className="inspector-context-toggle" onClick={onCollapseToCollapsed}>
              <span className="inspector-context-toggle-icon is-collapse" aria-hidden="true" />
              
              {t("ui.collapse")}
            </button>
          ) : null}
          <button
            type="button"
            className="inspector-context-toggle inspector-context-close-button"
            onClick={onCloseInspector}
            aria-label={t("ui.closeInspector")}
          >
            <span className="action-button-icon is-cancel" aria-hidden="true" />
          </button>
        </div>
      </div>
      {isCollapsed ? (
        selected === null ? (
          <p className="empty-copy">{t("ui.noEntitySelectedSelectARowOrACanvasItem")}</p>
        ) : (
          <p className="meta-line">
            
            {t("ui.focusedEntity")} <strong>{selected.kind}</strong> <span className="technical-id">{focusedEntityDisplayId}</span>
          </p>
        )
      ) : selected === null ? (
        <p className="empty-copy">{t("ui.noEntitySelectedSelectARowOrACanvasItem")}</p>
      ) : (
        <>
          <div className="inspector-entity-line">
            <span className="inspector-entity-label">{t("ui.focusedEntity")}</span>
            <span className="inspector-kind-chip">{selected.kind}</span>
            <span className="technical-id inspector-entity-id">{focusedEntityDisplayId}</span>
          </div>
          <dl className="inspector-detail-grid">
            {detailRows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="row-actions compact inspector-actions">
            {selectedSplice !== null ? (
              <button
                type="button"
                className="button-with-icon"
                onClick={() => onSuggestOptimizedSplicePlacement(selectedSplice.id)}
              >
                <span className="action-button-icon is-analysis" aria-hidden="true" />
                
                {t("ui.suggestOptimizedLengths")}
              </button>
            ) : null}
            {selectedSubScreen !== null ? (
              <button type="button" className="button-with-icon" onClick={onEditSelected} disabled={selectedSubScreen === null}>
                <span className="action-button-icon is-edit" aria-hidden="true" />
                
                {t("ui.edit")}
              </button>
            ) : null}
            <button type="button" className="button-with-icon" onClick={onClearSelection}>
              <span className="action-button-icon is-unselect" aria-hidden="true" />
              
              {t("ui.clear")}
            </button>
          </div>
        </>
      )}
    </article>
  );
}
