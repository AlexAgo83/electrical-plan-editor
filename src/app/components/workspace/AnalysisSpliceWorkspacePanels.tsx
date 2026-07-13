import { translateCurrent as t } from "../../lib/i18n";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import type { Segment, Splice, SpliceId } from "../../../core/entities";
import { resolveSplicePortMode } from "../../../core/splicePortMode";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import {
  formatOccupantRefForDisplay,
  parseWireOccupantRef,
} from "../../lib/app-utils-networking";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { renderWireColorPrefixMarker } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { EntityReferenceButton } from "./EntityReferenceButton";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

export function AnalysisSpliceWorkspacePanels(
  props: AnalysisWorkspaceContentProps,
): ReactElement {
  const {
    isSpliceSubScreen,
    selectedSplice,
    selectedSpliceId,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    spliceFilterField,
    setSpliceFilterField,
    spliceFilterQuery,
    setSpliceFilterQuery,
    splices,
    nodes,
    describeNode,
    segments,
    catalogItems,
    visibleSplices,
    wires,
    spliceSort: _spliceSort,
    setSpliceSort: _setSpliceSort,
    onSelectSplice,
    onSelectCatalogItem,
    onOpenSpliceOnboardingHelp,
    splicePortStatuses,
    portIndexInput,
    setPortIndexInput,
    spliceOccupantRefInput,
    setSpliceOccupantRefInput,
    handleReservePort,
    handleReleasePort,
    onGoToWireFromAnalysis,
    onOpenWireFromAnalysisTable,
    onOpenConnectorFromAnalysisTable,
    onOpenSpliceFromAnalysisTable,
    showEntityTables = true,
    sortedSpliceSynthesisRows,
    spliceSynthesisSort: _spliceSynthesisSort,
    setSpliceSynthesisSort: _setSpliceSynthesisSort,
    spliceAnalysisView,
    setSpliceAnalysisView,
    getSortIndicator: _getSortIndicator,
  } = props;
  void _spliceSort;
  void _setSpliceSort;
  void _spliceSynthesisSort;
  void _setSpliceSynthesisSort;
  void _getSortIndicator;

  type SpliceAnalysisTableSortField =
    | "name"
    | "technicalId"
    | "manufacturerReference"
    | "hostSegment"
    | "offsetMm"
    | "connectedWireCount";
  type SpliceSynthesisTableSortField =
    | "name"
    | "technicalId"
    | "sectionMm2"
    | "localPort"
    | "destination"
    | "localCoveredLengthMm"
    | "remoteCoveredLengthMm"
    | "lengthMm";

  const isMobileViewport = useIsMobileViewport();
  const [spliceTableSort, setSpliceTableSort] = useState<{
    field: SpliceAnalysisTableSortField;
    direction: "asc" | "desc";
  }>({ field: "name", direction: "asc" });
  const [spliceSynthesisTableSort, setSpliceSynthesisTableSort] = useState<{
    field: SpliceSynthesisTableSortField;
    direction: "asc" | "desc";
  }>({ field: "name", direction: "asc" });
  const catalogItemById = useMemo(
    () => new Map(catalogItems.map((item) => [item.id, item] as const)),
    [catalogItems],
  );
  const segmentById = useMemo(
    () => new Map(segments.map((segment) => [segment.id, segment] as const)),
    [segments],
  );
  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node] as const)),
    [nodes],
  );
  const spliceFilterPlaceholder =
    spliceFilterField === "name"
      ? t("ui.spliceName")
      : spliceFilterField === "technicalId"
        ? t("ui.technicalID")
        : t("ui.nameOrTechnicalID2");
  const resolveSplicePlacementPresentation = useCallback(
    (
      splice: Splice,
    ): {
      hostSegmentLabel: string;
      fromNodeLabel: string;
      offsetLabel: string;
      hostSegmentSort: string;
      offsetSort: number;
    } => {
      const placement = splice.placement;
      if (placement === undefined) {
        return {
          hostSegmentLabel: "Draft",
          fromNodeLabel: "Unplaced",
          offsetLabel: "Draft",
          hostSegmentSort: "",
          offsetSort: Number.NEGATIVE_INFINITY,
        };
      }

      const hostSegment: Segment | undefined = segmentById.get(
        placement.segmentId,
      );
      const fromNode = nodeById.get(placement.fromNodeId);
      return {
        hostSegmentLabel: hostSegment?.id ?? placement.segmentId,
        fromNodeLabel:
          fromNode === undefined ? placement.fromNodeId : describeNode(fromNode),
        offsetLabel: `${placement.offsetMm} mm`,
        hostSegmentSort: placement.segmentId,
        offsetSort: placement.offsetMm,
      };
    },
    [describeNode, nodeById, segmentById],
  );
  const spliceConnectedWireCountById = useMemo(() => {
    const result = new Map<SpliceId, number>();
    for (const wire of wires) {
      if (wire.endpointA.kind === "splicePort") {
        result.set(
          wire.endpointA.spliceId,
          (result.get(wire.endpointA.spliceId) ?? 0) + 1,
        );
      }
      if (wire.endpointB.kind === "splicePort") {
        result.set(
          wire.endpointB.spliceId,
          (result.get(wire.endpointB.spliceId) ?? 0) + 1,
        );
      }
    }
    return result;
  }, [wires]);
  const sortedVisibleSplices = useMemo(
    () =>
      sortByTableColumns(
        visibleSplices,
        spliceTableSort,
        (splice, field) => {
          if (field === "name") return splice.name;
          if (field === "technicalId") return splice.technicalId;
          if (field === "manufacturerReference")
            return splice.manufacturerReference;
          if (field === "hostSegment")
            return resolveSplicePlacementPresentation(splice).hostSegmentSort;
          if (field === "offsetMm")
            return resolveSplicePlacementPresentation(splice).offsetSort;
          return spliceConnectedWireCountById.get(splice.id) ?? 0;
        },
        (splice) => splice.id,
      ),
    [
      resolveSplicePlacementPresentation,
      spliceConnectedWireCountById,
      spliceTableSort,
      visibleSplices,
    ],
  );
  const wireTechnicalIdById = useMemo(
    () => new Map(wires.map((wire) => [wire.id, wire.technicalId] as const)),
    [wires],
  );
  const wireById = useMemo(
    () => new Map(wires.map((wire) => [wire.id, wire] as const)),
    [wires],
  );
  const formatOccupantRef = (occupantRef: string | null): string =>
    occupantRef === null
      ? ""
      : formatOccupantRefForDisplay(occupantRef, wireTechnicalIdById);
  const sortedSpliceSynthesisRowsByColumns = useMemo(
    () =>
      sortByTableColumns(
        sortedSpliceSynthesisRows,
        spliceSynthesisTableSort,
        (row, field) => {
          if (field === "name") return row.wireName;
          if (field === "technicalId") return row.wireTechnicalId;
          if (field === "sectionMm2") return row.sectionMm2;
          if (field === "localPort") return row.localEndpointLabel;
          if (field === "destination") return row.remoteEndpointLabel;
          if (field === "localCoveredLengthMm")
            return row.localCoveredLengthMm ?? Number.NEGATIVE_INFINITY;
          if (field === "remoteCoveredLengthMm")
            return row.remoteCoveredLengthMm ?? Number.NEGATIVE_INFINITY;
          return row.lengthMm;
        },
        (row) => `${row.wireId}-${row.localEndpointLabel}`,
      ),
    [sortedSpliceSynthesisRows, spliceSynthesisTableSort],
  );
  const spliceListSortIndicator = (field: SpliceAnalysisTableSortField) =>
    spliceTableSort.field === field
      ? spliceTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";
  const spliceSynthesisSortIndicator = (
    field: SpliceSynthesisTableSortField,
  ) =>
    spliceSynthesisTableSort.field === field
      ? spliceSynthesisTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";
  const renderDestinationReference = (
    row: (typeof sortedSpliceSynthesisRowsByColumns)[number],
  ): ReactElement => {
    if (row.remoteEndpoint.kind === "connectorCavity") {
      const connectorId = row.remoteEndpoint.connectorId;
      return (
        <EntityReferenceButton
          title={t("ui.openNamedTarget", { target: `${t("ui.connector").toLowerCase()} ${row.remoteEndpointLabel}` })}
          onClick={() => onOpenConnectorFromAnalysisTable(connectorId)}
        >
          {row.remoteEndpointLabel}
        </EntityReferenceButton>
      );
    }

    const spliceId = row.remoteEndpoint.spliceId;
    return (
      <EntityReferenceButton
        title={t("ui.openNamedTarget", { target: `${t("ui.splice").toLowerCase()} ${row.remoteEndpointLabel}` })}
        onClick={() => onOpenSpliceFromAnalysisTable(spliceId)}
      >
        {row.remoteEndpointLabel}
      </EntityReferenceButton>
    );
  };
  const selectedSplicePortMode =
    selectedSplice === null ? "bounded" : resolveSplicePortMode(selectedSplice);
  const selectedSpliceHasFinitePorts =
    selectedSplicePortMode !== "unbounded";
  const [unboundedVisibleFreePortCount, setUnboundedVisibleFreePortCount] =
    useState(0);
  const splicePortStatusByIndex = useMemo(
    () => new Map(splicePortStatuses.map((slot) => [slot.portIndex, slot] as const)),
    [splicePortStatuses],
  );
  const occupiedPortIndexSet = useMemo(() => {
    const occupied = new Set<number>();
    for (const slot of splicePortStatuses) {
      if (slot.isOccupied) {
        occupied.add(slot.portIndex);
      }
    }
    return occupied;
  }, [splicePortStatuses]);
  const displayedSplicePortStatuses = useMemo(() => {
    if (selectedSplice === null || selectedSpliceHasFinitePorts) {
      return splicePortStatuses;
    }

    const visibleFreePortTarget = 2 + unboundedVisibleFreePortCount;
    const visibleIndexes = new Set<number>(occupiedPortIndexSet);
    let nextCandidateIndex = 1;
    let freeSlotsAdded = 0;
    while (freeSlotsAdded < visibleFreePortTarget) {
      if (!occupiedPortIndexSet.has(nextCandidateIndex)) {
        visibleIndexes.add(nextCandidateIndex);
        freeSlotsAdded += 1;
      }
      nextCandidateIndex += 1;
    }

    return [...visibleIndexes]
      .sort((left, right) => left - right)
      .map((portIndex) => {
        const existing = splicePortStatusByIndex.get(portIndex);
        if (existing !== undefined) {
          return existing;
        }
        return {
          portIndex,
          occupantRef: null,
          isOccupied: false,
        };
      });
  }, [
    selectedSplice,
    selectedSpliceHasFinitePorts,
    splicePortStatuses,
    unboundedVisibleFreePortCount,
    occupiedPortIndexSet,
    splicePortStatusByIndex,
  ]);
  const nextFreePortIndex =
    selectedSplice === null
      ? null
      : selectedSpliceHasFinitePorts
        ? (splicePortStatuses.find((slot) => !slot.isOccupied)?.portIndex ??
          null)
        : (() => {
            let candidate = 1;
            while (occupiedPortIndexSet.has(candidate)) {
              candidate += 1;
            }
            return candidate;
          })();
  const parsedPortIndex = Number.parseInt(portIndexInput, 10);
  const portIndexIsInteger =
    Number.isInteger(parsedPortIndex) && parsedPortIndex > 0;
  const selectedPortSlot = portIndexIsInteger
    ? splicePortStatusByIndex.get(parsedPortIndex) ?? null
    : null;
  const portIsOccupied = selectedPortSlot?.isOccupied === true;
  const portIndexOutOfRange =
    selectedSplice !== null &&
    selectedSpliceHasFinitePorts &&
    portIndexIsInteger &&
    (parsedPortIndex < 1 || parsedPortIndex > selectedSplice.portCount);
  const spliceReserveValidationMessage =
    selectedSplice === null || portIndexInput.trim() === ""
      ? null
      : !portIndexIsInteger
        ? t("ui.enterAValidPortIndex")
        : portIndexOutOfRange
          ? t("ui.portIndexRange", { max: selectedSplice.portCount })
          : portIsOccupied
            ? `${t("ui.portAlreadyUsed", { index: parsedPortIndex, occupant: formatOccupantRef(selectedPortSlot.occupantRef) })} ${
                nextFreePortIndex === null
                  ? t("ui.noAvailablePorts")
                  : t("ui.suggestedPort", { index: nextFreePortIndex })
              }`
            : null;
  const canReservePort =
    selectedSplice !== null &&
    portIndexInput.trim() !== "" &&
    spliceOccupantRefInput.trim() !== "" &&
    portIndexIsInteger &&
    !portIndexOutOfRange &&
    !portIsOccupied;
  const selectedSplicePlacement =
    selectedSplice === null
      ? null
      : resolveSplicePlacementPresentation(selectedSplice);

  useEffect(() => {
    setUnboundedVisibleFreePortCount(0);
  }, [selectedSpliceId, selectedSplicePortMode]);

  useEffect(() => {
    if (selectedSplice === null) {
      return;
    }
    if (nextFreePortIndex === null) {
      setPortIndexInput("");
      return;
    }
    if (
      selectedSpliceHasFinitePorts &&
      (nextFreePortIndex < 1 || nextFreePortIndex > selectedSplice.portCount)
    ) {
      setPortIndexInput("");
      return;
    }
    const suggestedSlot = splicePortStatusByIndex.get(nextFreePortIndex) ?? null;
    if (suggestedSlot?.isOccupied) {
      setPortIndexInput("");
      return;
    }
    setPortIndexInput(String(nextFreePortIndex));
  }, [
    selectedSpliceId,
    splicePortStatuses,
    nextFreePortIndex,
    selectedSplice,
    selectedSpliceHasFinitePorts,
    setPortIndexInput,
    splicePortStatusByIndex,
  ]);

  function handleReservePortSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!canReservePort) {
      event.preventDefault();
      return;
    }
    handleReservePort(event);
  }

  return (
    <>
      <section className="panel" hidden={!isSpliceSubScreen || !showEntityTables}>
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.splices")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <div
                className="chip-group list-panel-filters"
                role="group"
                aria-label={t("ui.spliceOccupancyFilter")}
              >
                {(
                  [
                    ["all", t("ui.all")],
                    ["occupied", t("ui.occupied")],
                    ["free", t("ui.free")],
                  ] as const
                ).map(([filterId, label]) => (
                  <button
                    key={filterId}
                    type="button"
                    className={
                      spliceOccupancyFilter === filterId
                        ? "filter-chip is-active"
                        : "filter-chip"
                    }
                    onClick={() => setSpliceOccupancyFilter(filterId)}
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
                    "analysis-splices",
                    [
                      t("ui.name"),
                      t("ui.technicalID"),
                      t("ui.mfrRef"),
                      "Host segment",
                      "Reference node",
                      "Offset (mm)",
                      t("ui.connectedWires"),
                    ],
                    sortedVisibleSplices.map((splice) => {
                      const placement =
                        resolveSplicePlacementPresentation(splice);
                      return [
                        splice.name,
                        splice.technicalId,
                        splice.manufacturerReference ?? "",
                        placement.hostSegmentLabel,
                        placement.fromNodeLabel,
                        splice.placement?.offsetMm ?? "",
                        spliceConnectedWireCountById.get(splice.id) ?? 0,
                      ];
                    }),
                  )
                }
                disabled={sortedVisibleSplices.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenSpliceOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenSpliceOnboardingHelp}
                >
                  <span
                    className="action-button-icon is-help"
                    aria-hidden="true"
                  />
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.spliceFilterField")}
                fieldValue={spliceFilterField}
                onFieldChange={(value) =>
                  setSpliceFilterField(value as "name" | "technicalId" | "any")
                }
                fieldOptions={[
                  { value: "name", label: t("ui.name") },
                  { value: "technicalId", label: t("ui.technicalID") },
                  { value: "any", label: t("ui.any") },
                ]}
                queryValue={spliceFilterQuery}
                onQueryChange={setSpliceFilterQuery}
                placeholder={spliceFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {splices.length === 0 ? (
          <p className="empty-copy">{t("ui.noSpliceYet")}</p>
        ) : sortedVisibleSplices.length === 0 ? (
          <>
            <p className="empty-copy">{t("ui.noSpliceMatchesTheCurrentFilters")}</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th aria-sort={getTableAriaSort(spliceTableSort, "name")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.name")}{" "}
                      <span className="sort-indicator">
                        {spliceListSortIndicator("name")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(spliceTableSort, "technicalId")}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? t("ui.id") : t("ui.technicalID")}{" "}
                      <span className="sort-indicator">
                        {spliceListSortIndicator("technicalId")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      spliceTableSort,
                      "manufacturerReference",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "manufacturerReference",
                          direction:
                            current.field === "manufacturerReference" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.mfrRef")}{" "}
                      <span className="sort-indicator">
                        {spliceListSortIndicator("manufacturerReference")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      spliceTableSort,
                      "hostSegment",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "hostSegment",
                          direction:
                            current.field === "hostSegment" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.segment")}{" "}
                      <span className="sort-indicator">
                        {spliceListSortIndicator("hostSegment")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(spliceTableSort, "offsetMm")}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "offsetMm",
                          direction:
                            current.field === "offsetMm" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {t("ui.analysisspliceworkspacepanelsOffset")}{" "}
                      <span className="sort-indicator">
                        {spliceListSortIndicator("offsetMm")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      spliceTableSort,
                      "connectedWireCount",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "connectedWireCount",
                          direction:
                            current.field === "connectedWireCount" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.connectedWires")}{" "}
                      <span className="sort-indicator">
                        {spliceListSortIndicator("connectedWireCount")}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVisibleSplices.map((splice) => {
                  const connectedWireCount =
                    spliceConnectedWireCountById.get(splice.id) ?? 0;
                  const isSelected = selectedSpliceId === splice.id;
                  const linkedCatalogItemId = splice.catalogItemId;
                  const linkedCatalogItem =
                    linkedCatalogItemId === undefined
                      ? undefined
                      : catalogItemById.get(linkedCatalogItemId);
                  const placement =
                    resolveSplicePlacementPresentation(splice);
                  return (
                    <tr
                      key={splice.id}
                      className={
                        isSelected
                          ? "is-selected is-focusable-row"
                          : "is-focusable-row"
                      }
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => onSelectSplice(splice.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectSplice(splice.id);
                        }
                      }}
                    >
                      <td>{splice.name}</td>
                      <td className="technical-id">{splice.technicalId}</td>
                      <td className="technical-id">
                        {linkedCatalogItemId !== undefined &&
                        linkedCatalogItem !== undefined ? (
                          <EntityReferenceButton
                            className="technical-id"
                            title={t("ui.openNamedTarget", { target: `${t("ui.catalogItem").toLowerCase()} ${splice.manufacturerReference ?? linkedCatalogItem.manufacturerReference}` })}
                            onClick={() =>
                              onSelectCatalogItem(linkedCatalogItemId)
                            }
                          >
                            {splice.manufacturerReference ??
                              linkedCatalogItem.manufacturerReference}
                          </EntityReferenceButton>
                        ) : (
                          splice.manufacturerReference ?? ""
                        )}
                      </td>
                      <td>
                        <span>{placement.hostSegmentLabel}</span>
                        <br />
                        <small>{placement.fromNodeLabel}</small>
                      </td>
                      <td>{placement.offsetLabel}</td>
                      <td>{connectedWireCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleSplices.length} />
          </>
        )}
      </section>

      <section className="panel" hidden={!isSpliceSubScreen}>
        <header className="list-panel-header">
          <h2>{t("ui.spliceAnalysis")}</h2>
          <div className="list-panel-header-tools">
            <div
              className="chip-group list-panel-filters"
              role="group"
              aria-label={t("ui.spliceAnalysisView")}
            >
              <button
                type="button"
                className={
                  spliceAnalysisView === "ports"
                    ? "filter-chip is-active"
                    : "filter-chip"
                }
                aria-pressed={spliceAnalysisView === "ports"}
                onClick={() => setSpliceAnalysisView("ports")}
              >
                
                {t("ui.ports")}
              </button>
              <button
                type="button"
                className={
                  spliceAnalysisView === "synthesis"
                    ? "filter-chip is-active"
                    : "filter-chip"
                }
                aria-pressed={spliceAnalysisView === "synthesis"}
                onClick={() => setSpliceAnalysisView("synthesis")}
              >
                {t("ui.analysisconnectorworkspacepanelsSynthesis")}</button>
            </div>
            <button
              type="button"
              className="filter-chip table-export-button"
              onClick={() => {
                if (spliceAnalysisView === "ports") {
                  downloadCsvFile(
                    `analysis-splice-ports-${selectedSplice?.technicalId ?? "selection"}`,
                    ["Port", "Status", t("ui.occupantReference")],
                    displayedSplicePortStatuses.map((slot) => [
                      `P${slot.portIndex}`,
                      slot.isOccupied ? t("ui.occupied") : t("ui.free"),
                      formatOccupantRef(slot.occupantRef),
                    ]),
                  );
                  return;
                }
                downloadCsvFile(
                  `analysis-splice-synthesis-${selectedSplice?.technicalId ?? "selection"}`,
                  [
                    t("ui.wire"),
                    t("ui.technicalID"),
                    t("ui.sectionMm2"),
                    t("ui.localPort"),
                    "Destination",
                    "Covered from splice (mm)",
                    "Covered from remote endpoint (mm)",
                    t("ui.lengthMm"),
                  ],
                  sortedSpliceSynthesisRowsByColumns.map((row) => [
                    row.wireName,
                    row.wireTechnicalId,
                    row.sectionMm2,
                    row.localEndpointLabel,
                    row.remoteEndpointLabel,
                    row.localCoveredLengthMm ?? "",
                    row.remoteCoveredLengthMm ?? "",
                    row.lengthMm,
                  ]),
                );
              }}
              disabled={
                selectedSplice === null ||
                (spliceAnalysisView === "ports"
                  ? displayedSplicePortStatuses.length === 0
                  : sortedSpliceSynthesisRowsByColumns.length === 0)
              }
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
        {selectedSplice === null ? (
          <p className="empty-copy">{t("ui.selectASpliceToViewPortsAndSynthesis")}</p>
        ) : spliceAnalysisView === "ports" ? (
          <>
            <p className="meta-line">
              <span className="splice-badge">{t("ui.analysisspliceworkspacepanelsJunction")}</span>{" "}
              <strong>{selectedSplice.name}</strong> ({selectedSplice.technicalId})
            </p>
            {selectedSplicePlacement !== null ? (
              <p className="meta-line">
                {t("ui.analysisspliceworkspacepanelsPlacement")}{selectedSplicePlacement.hostSegmentLabel}  {t("ui.from")}{" "}
                {selectedSplicePlacement.fromNodeLabel} {t("ui.analysisspliceworkspacepanelsAt")}{" "}
                {selectedSplicePlacement.offsetLabel}
              </p>
            ) : null}
            <p className="meta-line">
              
              {t("ui.capacity")}{" "}
              {selectedSplicePortMode === "unbounded"
                ? t("ui.unbounded2")
                : `${selectedSplice.portCount} ports`}
            </p>
            <p className="meta-line">
              
              {t("ui.branchCount")}{" "}
              {splicePortStatuses.filter((slot) => slot.isOccupied).length}
            </p>
            <div className="connector-ways-view splice-ports-view">
              <section
                className="connector-ways-assignment-panel splice-ports-assignment-panel"
                aria-label={t("ui.analysisspliceworkspacepanelsManualPortAssignment")}
              >
                <form
                  className="row-form connector-ways-assignment-form splice-ports-assignment-form"
                  onSubmit={handleReservePortSubmit}
                >
                  <label>
                    
                    {t("ui.portIndex")}
                    <input
                      type="number"
                      min={1}
                      max={
                        selectedSpliceHasFinitePorts
                          ? selectedSplice.portCount
                          : undefined
                      }
                      step={1}
                      value={portIndexInput}
                      onChange={(event) => setPortIndexInput(event.target.value)}
                      aria-invalid={
                        spliceReserveValidationMessage !== null
                          ? true
                          : undefined
                      }
                      required
                    />
                  </label>

                  <label>
                    
                    {t("ui.occupantReference")}
                    <input
                      value={spliceOccupantRefInput}
                      onChange={(event) =>
                        setSpliceOccupantRefInput(event.target.value)
                      }
                      placeholder="wire-draft-001:B"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="button-with-icon"
                    disabled={!canReservePort}
                  >
                    <span
                      className="action-button-icon is-lock-move"
                      aria-hidden="true"
                    />
                    
                    {t("ui.reservePort")}
                  </button>
                </form>
                {spliceReserveValidationMessage !== null ? (
                  <small className="inline-error">
                    {spliceReserveValidationMessage}
                  </small>
                ) : null}
                {spliceReserveValidationMessage === null &&
                nextFreePortIndex !== null ? (
                  <small className="inline-help">
                    
                    {t("ui.suggestedNextFreePortP")}{nextFreePortIndex}
                  </small>
                ) : null}
                {spliceReserveValidationMessage === null &&
                nextFreePortIndex === null &&
                selectedSpliceHasFinitePorts ? (
                  <small className="inline-help">
                    
                    {t("ui.noAvailablePortsOnThisSplice")}
                  </small>
                ) : null}
                {selectedSplicePortMode === "unbounded" ? (
                  <div className="row-actions splice-ports-assignment-actions">
                    <button
                      type="button"
                      className="button-with-icon"
                      onClick={() =>
                        setUnboundedVisibleFreePortCount(
                          (current) => current + 1,
                        )
                      }
                    >
                      <span
                        className="action-button-icon is-add"
                        aria-hidden="true"
                      />
                      
                      {t("ui.addVisiblePortS")}
                    </button>
                  </div>
                ) : null}
              </section>

              <div
                className="cavity-grid connector-ways-cavity-grid splice-ports-cavity-grid"
                aria-label={t("ui.splicePortOccupancyGrid")}
              >
                {displayedSplicePortStatuses.map((slot) => {
                  const parsedOccupantRef =
                    slot.occupantRef === null
                      ? null
                      : parseWireOccupantRef(slot.occupantRef);
                  const canGoToWire =
                    parsedOccupantRef !== null &&
                    wireById.has(parsedOccupantRef.wireId);

                  return (
                    <article
                      key={slot.portIndex}
                      className={slot.isOccupied ? "cavity is-occupied" : "cavity"}
                    >
                      <h3>P{slot.portIndex}</h3>
                      <p>
                        {slot.isOccupied
                          ? formatOccupantRef(slot.occupantRef)
                          : t("ui.free")}
                      </p>
                      {slot.isOccupied ? (
                        <div className="cavity-actions">
                          <button
                            type="button"
                            className="validation-row-go-to-button button-with-icon"
                            disabled={!canGoToWire}
                            onClick={() => {
                              if (!canGoToWire || parsedOccupantRef === null) {
                                return;
                              }
                              onGoToWireFromAnalysis(parsedOccupantRef.wireId);
                            }}
                          >
                            <span
                              className="action-button-icon is-open"
                              aria-hidden="true"
                            />
                            
                            {t("ui.goTo")}
                          </button>
                          <button
                            type="button"
                            className="button-with-icon"
                            onClick={() => handleReleasePort(slot.portIndex)}
                          >
                            <span
                              className="action-button-icon is-cancel"
                              aria-hidden="true"
                            />
                            {t("ui.analysisconnectorworkspacepanelsRelease")}</button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        ) : sortedSpliceSynthesisRowsByColumns.length === 0 ? (
          <p className="empty-copy">{t("ui.noWireCurrentlyConnectedToThisSplice")}</p>
        ) : (
          <>
          <table className="data-table">
            <thead>
              <tr>
                <th aria-sort={getTableAriaSort(spliceSynthesisTableSort, "name")}>
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "name",
                        direction:
                          current.field === "name" && current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    
                    {t("ui.wire")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("name")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "technicalId",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "technicalId",
                        direction:
                          current.field === "technicalId" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    {isMobileViewport ? t("ui.id") : t("ui.technicalID")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("technicalId")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "sectionMm2",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "sectionMm2",
                        direction:
                          current.field === "sectionMm2" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    {isMobileViewport ? t("ui.analysisspliceworkspacepanelsSect") : t("ui.sectionMm2")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("sectionMm2")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "localPort",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "localPort",
                        direction:
                          current.field === "localPort" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    
                    {t("ui.localPort")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("localPort")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "destination",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "destination",
                        direction:
                          current.field === "destination" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    {t("ui.analysisconnectorworkspacepanelsDestination")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("destination")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "localCoveredLengthMm",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "localCoveredLengthMm",
                        direction:
                          current.field === "localCoveredLengthMm" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    {isMobileViewport
                      ? t("ui.analysisspliceworkspacepanelsLocalMm")
                      : t("ui.analysisspliceworkspacepanelsCoveredFromSpliceMm")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("localCoveredLengthMm")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "remoteCoveredLengthMm",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "remoteCoveredLengthMm",
                        direction:
                          current.field === "remoteCoveredLengthMm" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    {isMobileViewport
                      ? t("ui.analysisspliceworkspacepanelsRemoteMm")
                      : t("ui.analysisspliceworkspacepanelsCoveredFromRemoteMm")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("remoteCoveredLengthMm")}
                    </span>
                  </button>
                </th>
                <th
                  aria-sort={getTableAriaSort(
                    spliceSynthesisTableSort,
                    "lengthMm",
                  )}
                >
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() =>
                      setSpliceSynthesisTableSort((current) => ({
                        field: "lengthMm",
                        direction:
                          current.field === "lengthMm" &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    {isMobileViewport ? t("ui.len") : t("ui.lengthMm")}{" "}
                    <span className="sort-indicator">
                      {spliceSynthesisSortIndicator("lengthMm")}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSpliceSynthesisRowsByColumns.map((row) => {
                const wire = wireById.get(row.wireId);
                return (
                  <tr key={`${row.wireId}-${row.localEndpointLabel}`}>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {renderWireColorPrefixMarker(wire)}
                        <EntityReferenceButton
                          title={t("ui.openNamedTarget", { target: `${t("ui.wire").toLowerCase()} ${row.wireTechnicalId}` })}
                          onClick={() => onOpenWireFromAnalysisTable(row.wireId)}
                        >
                          {row.wireName}
                        </EntityReferenceButton>
                      </span>
                    </td>
                    <td className="technical-id">{row.wireTechnicalId}</td>
                    <td>{row.sectionMm2}</td>
                    <td>{row.localEndpointLabel}</td>
                    <td>{renderDestinationReference(row)}</td>
                    <td>{row.localCoveredLengthMm ?? ""}</td>
                    <td>{row.remoteCoveredLengthMm ?? ""}</td>
                    <td>{row.lengthMm}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TableEntryCountFooter
            count={sortedSpliceSynthesisRowsByColumns.length}
          />
          </>
        )}
      </section>
    </>
  );
}
