import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  getConnectorLayoutWayDisplayLabel,
  resolveConnectorLayout
} from "../../../core/connectorLayout";
import { resolvePinElectricalRoleDescriptor } from "../../../core/pinElectricalRole";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { formatOccupantRefForDisplay, parseWireOccupantRef } from "../../lib/app-utils-networking";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { getWireColorCsvValue, renderWireColorPrefixMarker } from "../../lib/wireColorPresentation";
import {
  formatPinElectricalRoleDrafts,
  hasInvalidPinElectricalRoleDraft,
  serializePinElectricalRoleDrafts,
  type ConnectorPinElectricalRoleDrafts
} from "../../hooks/connectorPinElectricalRoles";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { ConnectorPhysicalView } from "./ConnectorPhysicalView";
import { EntityReferenceButton } from "./EntityReferenceButton";
import { PinElectricalRolesEditor } from "./PinElectricalRolesEditor";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

export function AnalysisConnectorWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isConnectorSubScreen,
    selectedConnector,
    selectedConnectorId,
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    connectorFilterField,
    setConnectorFilterField,
    connectorFilterQuery,
    setConnectorFilterQuery,
    connectors,
    catalogItems,
    visibleConnectors,
    wires,
    selectedWireId,
    connectorOccupiedCountById,
    onSelectConnector,
    onSelectCatalogItem,
    onOpenConnectorOnboardingHelp,
    cavityIndexInput,
    setCavityIndexInput,
    connectorOccupantRefInput,
    setConnectorOccupantRefInput,
    handleReserveCavity,
    handleReleaseCavity,
    connectorCavityStatuses,
    onOpenWireFromAnalysisTable,
    onOpenConnectorFromAnalysisTable,
    onOpenSpliceFromAnalysisTable,
    showEntityTables = true,
    sortedConnectorSynthesisRows,
    connectorSynthesisSort: _connectorSynthesisSort,
    setConnectorSynthesisSort: _setConnectorSynthesisSort,
    connectorAnalysisView,
    setConnectorAnalysisView,
    connectorApplyCatalogPlugs,
    setConnectorApplyCatalogPlugs,
    connectorApplyCatalogSeals,
    setConnectorApplyCatalogSeals,
    connectorTerminalOverridesText,
    setConnectorTerminalOverridesText,
    onClearConnectorTerminalAndSealOverrides,
    onSaveConnectorCatalogMaterialApplication,
    onSaveConnectorPinElectricalRoles,
    getSortIndicator: _getSortIndicator
  } = props;
  void _connectorSynthesisSort;
  void _setConnectorSynthesisSort;
  void _getSortIndicator;
  type ConnectorAnalysisTableSortField = "name" | "technicalId" | "manufacturerReference" | "cavityCount" | "occupiedCount";
  type ConnectorSynthesisTableSortField = "name" | "technicalId" | "sectionMm2" | "color" | "twistGroup" | "functionalTag" | "localWay" | "destination" | "lengthMm";
  const isMobileViewport = useIsMobileViewport();
  const [connectorTableSort, setConnectorTableSort] = useState<{ field: ConnectorAnalysisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const [connectorSynthesisTableSort, setConnectorSynthesisTableSort] = useState<{ field: ConnectorSynthesisTableSortField; direction: "asc" | "desc" }>({ field: "name", direction: "asc" });
  const [pinRoleDrafts, setPinRoleDrafts] = useState<ConnectorPinElectricalRoleDrafts>({});
  const [pinRoleSelection, setPinRoleSelection] = useState<number[]>([]);
  const [pinRoleSaveMessage, setPinRoleSaveMessage] = useState<string | null>(null);
  const [catalogMaterialSaveMessage, setCatalogMaterialSaveMessage] = useState<string | null>(null);
  const [catalogMaterialSaveIsError, setCatalogMaterialSaveIsError] = useState(false);
  const catalogItemById = useMemo(() => new Map(catalogItems.map((item) => [item.id, item] as const)), [catalogItems]);
  const selectedConnectorCatalogItem = selectedConnector?.catalogItemId === undefined ? undefined : catalogItemById.get(selectedConnector.catalogItemId);
  const pinRoleDraftsAreInvalid = hasInvalidPinElectricalRoleDraft(pinRoleDrafts);
  const connectorFilterPlaceholder =
    connectorFilterField === "name" ? t("ui.connectorName") : connectorFilterField === "technicalId" ? t("ui.technicalID") : t("ui.nameOrTechnicalID2");
  const sortedVisibleConnectors = useMemo(
    () =>
      sortByTableColumns(
        visibleConnectors,
        connectorTableSort,
        (connector, field) => {
          if (field === "name") return connector.name;
          if (field === "technicalId") return connector.technicalId;
          if (field === "manufacturerReference") return connector.manufacturerReference;
          if (field === "cavityCount") return connector.cavityCount;
          return connectorOccupiedCountById.get(connector.id) ?? 0;
        },
        (connector) => connector.id
      ),
    [connectorOccupiedCountById, connectorTableSort, visibleConnectors]
  );
  const wireTechnicalIdById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire.technicalId] as const)), [wires]);
  const wireById = useMemo(() => new Map(wires.map((wire) => [wire.id, wire] as const)), [wires]);
  const selectedConnectorLayout = selectedConnector === null ? null : resolveConnectorLayout(selectedConnectorCatalogItem?.connectorLayout, selectedConnector.cavityCount);
  const formatOccupantRef = (occupantRef: string | null): string =>
    occupantRef === null ? "" : formatOccupantRefForDisplay(occupantRef, wireTechnicalIdById);
  const formatConnectorOccupantRef = (occupantRef: string | null): string => formatOccupantRef(occupantRef).replace(/^Wire /, "");
  const parseOccupantWireId = (occupantRef: string | null) => {
    const parsed = occupantRef === null ? null : parseWireOccupantRef(occupantRef);
    return parsed !== null && wireById.has(parsed.wireId) ? parsed.wireId : null;
  };
  const sortedConnectorSynthesisRowsByColumns = useMemo(
    () =>
      sortByTableColumns(
        sortedConnectorSynthesisRows,
        connectorSynthesisTableSort,
        (row, field) => {
          if (field === "name") return row.wireName;
          if (field === "technicalId") return row.wireTechnicalId;
          if (field === "sectionMm2") return row.sectionMm2;
          if (field === "color") return getWireColorCsvValue(wireById.get(row.wireId) ?? { colorMode: "catalog", primaryColorId: null, secondaryColorId: null, freeColorLabel: null });
          if (field === "twistGroup") return row.twistGroupLabel ?? "";
          if (field === "functionalTag") return row.functionalDomainTag ?? "";
          if (field === "localWay") return row.localEndpointLabel;
          if (field === "destination") return row.remoteEndpointLabel;
          return row.lengthMm;
        },
        (row) => `${row.wireId}-${row.localEndpointLabel}`
      ),
    [connectorSynthesisTableSort, sortedConnectorSynthesisRows, wireById]
  );
  const connectorListSortIndicator = (field: ConnectorAnalysisTableSortField) =>
    connectorTableSort.field === field ? (connectorTableSort.direction === "asc" ? "▲" : "▼") : "";
  const connectorSynthesisSortIndicator = (field: ConnectorSynthesisTableSortField) =>
    connectorSynthesisTableSort.field === field ? (connectorSynthesisTableSort.direction === "asc" ? "▲" : "▼") : "";
  const renderDestinationReference = (row: (typeof sortedConnectorSynthesisRowsByColumns)[number]): ReactElement => {
    if (row.remoteEndpoint.kind === "connectorCavity") {
      const connectorId = row.remoteEndpoint.connectorId;
      return (
        <EntityReferenceButton
          title={t("ui.analysisconnectorworkspacepanelsOpenConnectorRemoteEndpointLabel", { remoteEndpointLabel: row.remoteEndpointLabel })}
          onClick={() => onOpenConnectorFromAnalysisTable(connectorId)}
        >
          {row.remoteEndpointLabel}
        </EntityReferenceButton>
      );
    }

    const spliceId = row.remoteEndpoint.spliceId;
    return (
      <EntityReferenceButton
        title={t("ui.analysisconnectorworkspacepanelsOpenSpliceRemoteEndpointLabel", { remoteEndpointLabel: row.remoteEndpointLabel })}
        onClick={() => onOpenSpliceFromAnalysisTable(spliceId)}
      >
        {row.remoteEndpointLabel}
      </EntityReferenceButton>
    );
  };
  const nextFreeCavityIndex = connectorCavityStatuses.find((slot) => !slot.isOccupied)?.cavityIndex ?? null;
  const parsedCavityIndex = Number.parseInt(cavityIndexInput, 10);
  const cavityIndexIsInteger = Number.isInteger(parsedCavityIndex) && parsedCavityIndex > 0;
  const selectedCavitySlot = cavityIndexIsInteger
    ? connectorCavityStatuses.find((slot) => slot.cavityIndex === parsedCavityIndex) ?? null
    : null;
  const cavityIsOccupied = selectedCavitySlot?.isOccupied === true;
  const cavityIndexOutOfRange =
    selectedConnector !== null &&
    cavityIndexIsInteger &&
    (parsedCavityIndex < 1 || parsedCavityIndex > selectedConnector.cavityCount);
  const connectorReserveValidationMessage =
    selectedConnector === null || cavityIndexInput.trim() === ""
      ? null
      : !cavityIndexIsInteger
        ? t("ui.enterAValidWayIndex")
        : cavityIndexOutOfRange
          ? t("ui.wayIndexRange", { max: selectedConnector.cavityCount })
          : cavityIsOccupied
            ? `${t("ui.wayAlreadyUsed", { index: parsedCavityIndex, occupant: formatOccupantRef(selectedCavitySlot.occupantRef) })} ${
                nextFreeCavityIndex === null ? t("ui.noAvailableWays") : t("ui.suggestedWay", { index: nextFreeCavityIndex })
              }`
            : null;
  const canReserveCavity =
    selectedConnector !== null &&
    cavityIndexInput.trim() !== "" &&
    connectorOccupantRefInput.trim() !== "" &&
    cavityIndexIsInteger &&
    !cavityIndexOutOfRange &&
    !cavityIsOccupied;

  useEffect(() => {
    if (selectedConnector === null) {
      return;
    }
    if (nextFreeCavityIndex === null) {
      setCavityIndexInput("");
      return;
    }
    if (nextFreeCavityIndex < 1 || nextFreeCavityIndex > selectedConnector.cavityCount) {
      setCavityIndexInput("");
      return;
    }
    const suggestedSlot = connectorCavityStatuses.find((slot) => slot.cavityIndex === nextFreeCavityIndex) ?? null;
    if (suggestedSlot === null || suggestedSlot.isOccupied) {
      setCavityIndexInput("");
      return;
    }
    setCavityIndexInput(String(nextFreeCavityIndex));
  }, [
    selectedConnectorId,
    connectorCavityStatuses,
    nextFreeCavityIndex,
    selectedConnector,
    setCavityIndexInput
  ]);

  function handleReserveCavitySubmit(event: FormEvent<HTMLFormElement>): void {
    if (!canReserveCavity) {
      event.preventDefault();
      return;
    }
    handleReserveCavity(event);
  }

  function renderConnectorWayDetails(): ReactElement | null {
    if (selectedConnectorLayout === null) {
      return null;
    }
    const statusByCavity = new Map(connectorCavityStatuses.map((status) => [status.cavityIndex, status] as const));
    return (
      <div className="cavity-grid connector-physical-way-list" aria-label={t("ui.analysisconnectorworkspacepanelsConnectorWayDetails")}>
        {selectedConnectorLayout.ways.map((way) => {
          const status = statusByCavity.get(way.cavityIndex);
          const occupantRefs =
            status?.occupantRefs ?? (status?.occupantRef !== null && status?.occupantRef !== undefined ? [status.occupantRef] : []);
          const isOccupied = occupantRefs.length > 0;
          const isShared = occupantRefs.length > 1;
          const wayLabel = getConnectorLayoutWayDisplayLabel(way);
          return (
            <article key={way.cavityIndex} className={`cavity${isOccupied ? " is-occupied" : ""}${isShared ? " is-shared" : ""}`}>
              <h3>
                {wayLabel}
                {isShared ? <span className="cavity-shared-badge" title={t("ui.analysisconnectorworkspacepanelsSharedWaySeveralWiresCrimpedTogether")}> {t("ui.analysisconnectorworkspacepanelsShared")}{occupantRefs.length}</span> : null}
              </h3>
              {isOccupied ? (
                occupantRefs.map((occupantRef) => {
                  const occupantWireId = parseOccupantWireId(occupantRef);
                  const wire = occupantWireId === null ? null : wireById.get(occupantWireId);
                  return (
                    <div key={occupantRef} className="cavity-occupant-entry">
                      <p className="cavity-occupant-line">
                        <span className="action-button-icon is-wires cavity-occupant-ref-icon" aria-hidden="true" />
                        {renderWireColorPrefixMarker(wire)}
                        {formatConnectorOccupantRef(occupantRef)}
                      </p>
                      <div className="cavity-actions">
                        {occupantWireId === null ? (
                          <button type="button" className="button-with-icon" onClick={() => handleReleaseCavity(way.cavityIndex, occupantRef)}>
                            {t("ui.analysisconnectorworkspacepanelsRelease")}</button>
                        ) : (
                          <button
                            type="button"
                            className="validation-row-go-to-button button-with-icon"
                            onClick={() => onOpenWireFromAnalysisTable(occupantWireId)}
                          >
                            <span className="action-button-icon is-open" aria-hidden="true" />
                            
                            {t("ui.goTo")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="cavity-occupant-line">{t("ui.free")}</p>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  function handleSavePinElectricalRoles(): void {
    if (selectedConnector === null) {
      return;
    }
    if (pinRoleDraftsAreInvalid) {
      setPinRoleSaveMessage("Fix invalid pin role values before saving.");
      return;
    }
    onSaveConnectorPinElectricalRoles(
      selectedConnector.id,
      serializePinElectricalRoleDrafts(pinRoleDrafts, selectedConnector.cavityCount)
    );
    setPinRoleSelection([]);
    setPinRoleSaveMessage("Roles saved.");
  }

  function handleSaveCatalogMaterialApplication(): void {
    if (selectedConnector === null) {
      return;
    }
    const result = onSaveConnectorCatalogMaterialApplication(selectedConnector.id, {
      applyCatalogPlugs: connectorApplyCatalogPlugs,
      applyCatalogSeals: connectorApplyCatalogSeals,
      terminalOverridesText: connectorTerminalOverridesText
    });
    if (!result.ok) {
      setCatalogMaterialSaveIsError(true);
      setCatalogMaterialSaveMessage(result.message);
      return;
    }
    setCatalogMaterialSaveIsError(false);
    setCatalogMaterialSaveMessage("Catalog material application saved.");
  }

  useEffect(() => {
    if (selectedConnector === null) {
      setPinRoleDrafts({});
      setPinRoleSelection([]);
      setPinRoleSaveMessage(null);
      return;
    }
    setPinRoleDrafts(formatPinElectricalRoleDrafts(selectedConnector.pinElectricalRoles, selectedConnector.cavityCount));
    setPinRoleSelection([]);
    setPinRoleSaveMessage(null);
    setCatalogMaterialSaveMessage(null);
    setCatalogMaterialSaveIsError(false);
  }, [selectedConnector]);

  return (
    <>
<section className="panel" hidden={!isConnectorSubScreen || !showEntityTables}>
  <header className="list-panel-header list-panel-header-mobile-inline-tools">
    <h2>{t("ui.connectors")}</h2>
    <div className="list-panel-header-tools">
      <div className="list-panel-header-tools-row is-title-actions">
        <div className="chip-group list-panel-filters" role="group" aria-label={t("ui.connectorOccupancyFilter")}>
          {([
            ["all", t("ui.all")],
            ["occupied", t("ui.occupied")],
            ["free", t("ui.free")]
          ] as const).map(([filterId, label]) => (
            <button
              key={filterId}
              type="button"
              className={connectorOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"}
              onClick={() => setConnectorOccupancyFilter(filterId)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="filter-chip table-export-button"
          onClick={() =>
            downloadCsvFile(
              "analysis-connectors",
              [t("ui.name"), t("ui.technicalID"), t("ui.mfrRef"), t("ui.ways"), t("ui.occupied")],
              sortedVisibleConnectors.map((connector) => [
                connector.name,
                connector.technicalId,
                connector.manufacturerReference ?? "",
                connector.cavityCount,
                connectorOccupiedCountById.get(connector.id) ?? 0
              ])
            )
          }
          disabled={sortedVisibleConnectors.length === 0}
        >
          <span className="table-export-icon" aria-hidden="true" />
          CSV
        </button>
        {onOpenConnectorOnboardingHelp !== undefined ? (
          <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenConnectorOnboardingHelp}>
            <span className="action-button-icon is-help" aria-hidden="true" />
            <span>{t("ui.help")}</span>
          </button>
        ) : null}
      </div>
      <div className="list-panel-header-tools-row is-filter-row">
        <TableFilterBar
          label={t("ui.filter")}
          fieldLabel={t("ui.connectorFilterField")}
          fieldValue={connectorFilterField}
          onFieldChange={(value) => setConnectorFilterField(value as "name" | "technicalId" | "any")}
          fieldOptions={[
            { value: "name", label: t("ui.name") },
            { value: "technicalId", label: t("ui.technicalID") },
            { value: "any", label: t("ui.any") }
          ]}
          queryValue={connectorFilterQuery}
          onQueryChange={setConnectorFilterQuery}
          placeholder={connectorFilterPlaceholder}
        />
      </div>
    </div>
  </header>
  {connectors.length === 0 ? (
    <p className="empty-copy">{t("ui.noConnectorYet")}</p>
  ) : sortedVisibleConnectors.length === 0 ? (
    <>
      <p className="empty-copy">{t("ui.noConnectorMatchesTheCurrentFilters")}</p>
      <TableEntryCountFooter count={0} />
    </>
  ) : (
    <>
      <table className="data-table">
        <thead>
          <tr>
          <th aria-sort={getTableAriaSort(connectorTableSort, "name")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() =>
                setConnectorTableSort((current) => ({
                  field: "name",
                  direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc"
                }))
              }
            >
              
              {t("ui.name")} <span className="sort-indicator">{connectorListSortIndicator("name")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "technicalId")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() =>
                setConnectorTableSort((current) => ({
                  field: "technicalId",
                  direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc"
                }))
              }
            >
              {isMobileViewport ? t("ui.id") : t("ui.technicalID")} <span className="sort-indicator">{connectorListSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "manufacturerReference")}>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "manufacturerReference", direction: current.field === "manufacturerReference" && current.direction === "asc" ? "desc" : "asc" }))}>
              
              {t("ui.mfrRef")} <span className="sort-indicator">{connectorListSortIndicator("manufacturerReference")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "cavityCount")}>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "cavityCount", direction: current.field === "cavityCount" && current.direction === "asc" ? "desc" : "asc" }))}>
              
              {t("ui.ways")} <span className="sort-indicator">{connectorListSortIndicator("cavityCount")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorTableSort, "occupiedCount")}>
            <button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "occupiedCount", direction: current.field === "occupiedCount" && current.direction === "asc" ? "desc" : "asc" }))}>
              {isMobileViewport ? t("ui.occup") : t("ui.occupied")} <span className="sort-indicator">{connectorListSortIndicator("occupiedCount")}</span>
            </button>
          </th>
          </tr>
        </thead>
        <tbody>
          {sortedVisibleConnectors.map((connector) => {
            const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
            const isSelected = selectedConnectorId === connector.id;
            const linkedCatalogItemId = connector.catalogItemId;
            const linkedCatalogItem = linkedCatalogItemId === undefined ? undefined : catalogItemById.get(linkedCatalogItemId);
            return (
              <tr
                key={connector.id}
                className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onSelectConnector(connector.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectConnector(connector.id);
                  }
                }}
              >
                <td>{connector.name}</td>
                <td className="technical-id">{connector.technicalId}</td>
                <td className="technical-id">
                  {linkedCatalogItemId !== undefined && linkedCatalogItem !== undefined ? (
                    <EntityReferenceButton
                      className="technical-id"
                      title={t("ui.analysisconnectorworkspacepanelsOpenCatalogItemManufacturerReference", { manufacturerReference: connector.manufacturerReference ?? linkedCatalogItem.manufacturerReference })}
                      onClick={() => onSelectCatalogItem(linkedCatalogItemId)}
                    >
                      {connector.manufacturerReference ?? linkedCatalogItem.manufacturerReference}
                    </EntityReferenceButton>
                  ) : (
                    connector.manufacturerReference ?? ""
                  )}
                </td>
                <td>{connector.cavityCount}</td>
                <td>{occupiedCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TableEntryCountFooter count={sortedVisibleConnectors.length} />
    </>
  )}
</section>

<section className="panel" hidden={!isConnectorSubScreen}>
  <header className="list-panel-header">
    <h2>{t("ui.connectorAnalysis")}</h2>
    <div className="list-panel-header-tools">
      <div className="chip-group list-panel-filters" role="group" aria-label={t("ui.connectorAnalysisView")}>
        <button
          type="button"
          className={connectorAnalysisView === "physical" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "physical"}
          onClick={() => setConnectorAnalysisView("physical")}
        >
          {t("ui.analysisconnectorworkspacepanelsPhysical")}</button>
        <button
          type="button"
          className={connectorAnalysisView === "ways" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "ways"}
          onClick={() => setConnectorAnalysisView("ways")}
        >
          
          {t("ui.ways")}
        </button>
        <button
          type="button"
          className={connectorAnalysisView === "roles" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "roles"}
          onClick={() => setConnectorAnalysisView("roles")}
        >
          {t("ui.analysisconnectorworkspacepanelsRoles")}</button>
        <button
          type="button"
          className={connectorAnalysisView === "catalogMaterial" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "catalogMaterial"}
          onClick={() => setConnectorAnalysisView("catalogMaterial")}
        >
          {t("ui.analysisconnectorworkspacepanelsCatalogMaterial")}</button>
        <button
          type="button"
          className={connectorAnalysisView === "synthesis" ? "filter-chip is-active" : "filter-chip"}
          aria-pressed={connectorAnalysisView === "synthesis"}
          onClick={() => setConnectorAnalysisView("synthesis")}
        >
          {t("ui.analysisconnectorworkspacepanelsSynthesis")}</button>
      </div>
      <button
        type="button"
        className="filter-chip table-export-button"
        onClick={() => {
          if (connectorAnalysisView === "ways" || connectorAnalysisView === "roles" || connectorAnalysisView === "physical" || connectorAnalysisView === "catalogMaterial") {
            downloadCsvFile(
              `analysis-connector-ways-${selectedConnector?.technicalId ?? "selection"}`,
              ["Way", "Status", t("ui.occupantReference"), "Role", "Max current (A)", "Label", "Role source"],
              connectorCavityStatuses.map((slot) => {
                const roleDescriptor = resolvePinElectricalRoleDescriptor(selectedConnector ?? undefined, selectedConnectorCatalogItem, slot.cavityIndex);
                return [
                  `C${slot.cavityIndex}`,
                  slot.isOccupied ? t("ui.occupied") : t("ui.free"),
                  formatOccupantRef(slot.occupantRef),
                  roleDescriptor.role.role,
                  roleDescriptor.role.currentA ?? "",
                  roleDescriptor.role.label ?? "",
                  roleDescriptor.source
                ];
              })
            );
            return;
          }
          downloadCsvFile(
            `analysis-connector-synthesis-${selectedConnector?.technicalId ?? "selection"}`,
              [t("ui.wire"), t("ui.technicalID"), t("ui.sectionMm2"), t("ui.color"), "Twist group", "Functional tag", t("ui.localWay"), "Destination", t("ui.lengthMm")],
            sortedConnectorSynthesisRowsByColumns.map((row) => [
              row.wireName,
              row.wireTechnicalId,
              row.sectionMm2,
              getWireColorCsvValue(wireById.get(row.wireId) ?? { colorMode: "catalog", primaryColorId: null, secondaryColorId: null, freeColorLabel: null }),
              row.twistGroupLabel ?? "",
              row.functionalDomainTag ?? "",
              row.localEndpointLabel,
              row.remoteEndpointLabel,
              row.lengthMm
            ])
          );
        }}
        disabled={
          selectedConnector === null ||
          (connectorAnalysisView === "ways"
            || connectorAnalysisView === "roles"
            || connectorAnalysisView === "physical"
            || connectorAnalysisView === "catalogMaterial"
            ? connectorCavityStatuses.length === 0
            : sortedConnectorSynthesisRowsByColumns.length === 0)
        }
      >
        <span className="table-export-icon" aria-hidden="true" />
        CSV
      </button>
    </div>
  </header>
  {selectedConnector === null ? (
    <p className="empty-copy">{t("ui.selectAConnectorToViewWaysAndSynthesis")}</p>
  ) : connectorAnalysisView === "ways" ? (
    <>
      <p className="meta-line">
        <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
      </p>
      <div className="connector-ways-view">
        <section className="connector-ways-assignment-panel" aria-label={t("ui.analysisconnectorworkspacepanelsManualWayAssignment")}>
          <form className="row-form connector-ways-assignment-form" onSubmit={handleReserveCavitySubmit}>
            <label>
              
              {t("ui.wayIndex")}
              <input
                type="number"
                min={1}
                max={selectedConnector.cavityCount}
                step={1}
                value={cavityIndexInput}
                onChange={(event) => setCavityIndexInput(event.target.value)}
                aria-invalid={connectorReserveValidationMessage !== null ? true : undefined}
                required
              />
            </label>

            <label>
              
              {t("ui.occupantReference")}
              <input
                value={connectorOccupantRefInput}
                onChange={(event) => setConnectorOccupantRefInput(event.target.value)}
                placeholder="wire-draft-001:A"
                required
              />
            </label>

            <button type="submit" className="button-with-icon" disabled={!canReserveCavity}>
              <span className="action-button-icon is-lock-move" aria-hidden="true" />
              
              {t("ui.reserveWay")}
            </button>
          </form>
          {connectorReserveValidationMessage !== null ? <small className="inline-error">{connectorReserveValidationMessage}</small> : null}
          {connectorReserveValidationMessage === null && nextFreeCavityIndex !== null ? (
            <small className="inline-help">{t("ui.suggestedNextFreeWayC")}{nextFreeCavityIndex}</small>
          ) : null}
          {connectorReserveValidationMessage === null && nextFreeCavityIndex === null ? (
            <small className="inline-help">{t("ui.noAvailableWaysOnThisConnector")}</small>
          ) : null}
        </section>
        {renderConnectorWayDetails()}
      </div>
    </>
  ) : connectorAnalysisView === "roles" ? (
    <>
      <p className="meta-line">
        <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
      </p>
      <div className="connector-roles-view">
        <PinElectricalRolesEditor
          mode="panel"
          title={t("ui.functionalschematicpanelElectricalRoles")}
          showPanelHeader={false}
          cavityCount={selectedConnector.cavityCount}
          drafts={pinRoleDrafts}
          setDrafts={(nextDrafts) => {
            setPinRoleDrafts(nextDrafts);
            setPinRoleSaveMessage(null);
          }}
          selection={pinRoleSelection}
          setSelection={setPinRoleSelection}
          catalogItem={selectedConnectorCatalogItem}
          connectorLayout={selectedConnectorCatalogItem?.connectorLayout}
          allowInheritedRoles={true}
          footerActions={
            <>
              <button
                type="button"
                className="button-with-icon"
                disabled={pinRoleDraftsAreInvalid}
                onClick={handleSavePinElectricalRoles}
              >
                <span className="action-button-icon is-save" aria-hidden="true" />
                {t("ui.analysisconnectorworkspacepanelsSaveRoles")}</button>
              {pinRoleSaveMessage === null ? null : (
                <small className={pinRoleDraftsAreInvalid ? "inline-error" : "inline-help"}>{pinRoleSaveMessage}</small>
              )}
            </>
          }
        />
      </div>
    </>
  ) : connectorAnalysisView === "physical" ? (
    <>
      <p className="meta-line">
        <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
      </p>
      <ConnectorPhysicalView
        connector={selectedConnector}
        catalogItem={selectedConnectorCatalogItem}
        connectorCavityStatuses={connectorCavityStatuses}
        wireById={wireById}
        selectedWireId={selectedWireId}
        parseOccupantWireId={parseOccupantWireId}
        onGoToWire={onOpenWireFromAnalysisTable}
        onReleaseCavity={handleReleaseCavity}
      />
    </>
  ) : connectorAnalysisView === "catalogMaterial" ? (
    <>
      <div className="stack-form catalog-material-application-form">
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={connectorApplyCatalogSeals}
            onChange={(event) => {
              setConnectorApplyCatalogSeals(event.target.checked);
              setCatalogMaterialSaveMessage(null);
            }}
          />
          {t("ui.analysisconnectorworkspacepanelsApplyCatalogSeals")}</label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={connectorApplyCatalogPlugs}
            onChange={(event) => {
              setConnectorApplyCatalogPlugs(event.target.checked);
              setCatalogMaterialSaveMessage(null);
            }}
          />
          {t("ui.analysisconnectorworkspacepanelsApplyCatalogPlugs")}</label>
        <label>
          {t("ui.analysisconnectorworkspacepanelsTerminalAndSealOverrides")}<textarea
            value={connectorTerminalOverridesText}
            onChange={(event) => {
              setConnectorTerminalOverridesText(event.target.value);
              setCatalogMaterialSaveMessage(null);
            }}
            placeholder={"1,TERM-A,SEAL-A,Terminal name,Seal name\n2,TERM-B,SEAL-B"}
            rows={5}
          />
        </label>
      </div>
      <div className="row-actions compact">
        <button type="button" className="button-with-icon" onClick={handleSaveCatalogMaterialApplication}>
          <span className="action-button-icon is-save" aria-hidden="true" />
          {t("ui.analysisconnectorworkspacepanelsSaveMaterialApplication")}</button>
        <button
          type="button"
          className="button-with-icon"
          onClick={() => {
            onClearConnectorTerminalAndSealOverrides();
            setCatalogMaterialSaveMessage(null);
          }}
        >
          <span className="action-button-icon is-cancel" aria-hidden="true" />
          {t("ui.analysisconnectorworkspacepanelsClearTerminalAndSealOverrides")}</button>
        {catalogMaterialSaveMessage === null ? null : (
          <small className={catalogMaterialSaveIsError ? "inline-error" : "inline-help"}>{catalogMaterialSaveMessage}</small>
        )}
      </div>
    </>
  ) : sortedConnectorSynthesisRowsByColumns.length === 0 ? (
    <p className="empty-copy">{t("ui.noWireCurrentlyConnectedToThisConnector")}</p>
  ) : (
    <table className="data-table">
      <thead>
        <tr>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "name")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              
              {t("ui.wire")} <span className="sort-indicator">{connectorSynthesisSortIndicator("name")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "technicalId")}>
            <button
              type="button"
              className="sort-header-button"
              onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" }))}
            >
              {isMobileViewport ? t("ui.id") : t("ui.technicalID")} <span className="sort-indicator">{connectorSynthesisSortIndicator("technicalId")}</span>
            </button>
          </th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "sectionMm2")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "sectionMm2", direction: current.field === "sectionMm2" && current.direction === "asc" ? "desc" : "asc" }))}>{t("ui.sectionMm2")} <span className="sort-indicator">{connectorSynthesisSortIndicator("sectionMm2")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "color")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "color", direction: current.field === "color" && current.direction === "asc" ? "desc" : "asc" }))}>{t("ui.color")} <span className="sort-indicator">{connectorSynthesisSortIndicator("color")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "twistGroup")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "twistGroup", direction: current.field === "twistGroup" && current.direction === "asc" ? "desc" : "asc" }))}>{t("ui.analysisconnectorworkspacepanelsTwistGroup")}<span className="sort-indicator">{connectorSynthesisSortIndicator("twistGroup")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "functionalTag")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "functionalTag", direction: current.field === "functionalTag" && current.direction === "asc" ? "desc" : "asc" }))}>{t("ui.analysisconnectorworkspacepanelsFunctionalTag")}<span className="sort-indicator">{connectorSynthesisSortIndicator("functionalTag")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "localWay")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "localWay", direction: current.field === "localWay" && current.direction === "asc" ? "desc" : "asc" }))}>{t("ui.localWay")} <span className="sort-indicator">{connectorSynthesisSortIndicator("localWay")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "destination")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "destination", direction: current.field === "destination" && current.direction === "asc" ? "desc" : "asc" }))}>{t("ui.analysisconnectorworkspacepanelsDestination")}<span className="sort-indicator">{connectorSynthesisSortIndicator("destination")}</span></button></th>
          <th aria-sort={getTableAriaSort(connectorSynthesisTableSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setConnectorSynthesisTableSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" }))}>{isMobileViewport ? t("ui.len") : t("ui.lengthMm")} <span className="sort-indicator">{connectorSynthesisSortIndicator("lengthMm")}</span></button></th>
        </tr>
      </thead>
      <tbody>
        {sortedConnectorSynthesisRowsByColumns.map((row) => {
          const wire = wireById.get(row.wireId);
          return (
          <tr key={`${row.wireId}-${row.localEndpointLabel}`}>
            <td>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                {renderWireColorPrefixMarker(wire)}
                <EntityReferenceButton
                  title={t("ui.analysisconnectorworkspacepanelsOpenWireWireTechnicalId", { wireTechnicalId: row.wireTechnicalId })}
                  onClick={() => onOpenWireFromAnalysisTable(row.wireId)}
                >
                  {row.wireName}
                </EntityReferenceButton>
              </span>
            </td>
            <td className="technical-id">
              {row.wireTechnicalId}
            </td>
            <td>{row.sectionMm2}</td>
            <td>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                {renderWireColorPrefixMarker(wire)}
                <span className="technical-id">{wire === undefined ? "" : getWireColorCsvValue(wire)}</span>
              </span>
            </td>
            <td>{row.twistGroupLabel ?? ""}</td>
            <td>{row.functionalDomainTag ?? ""}</td>
            <td>{row.localEndpointLabel}</td>
            <td>{renderDestinationReference(row)}</td>
            <td>{row.lengthMm}</td>
          </tr>
          );
        })}
      </tbody>
    </table>
  )}
</section>
    </>
  );
}
