import { translateCurrent as t } from "../../lib/i18n";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
  type ReactNode,
  type RefObject
} from "react";
import type { NetworkId } from "../../../core/entities";
import type { FileFeedbackDialogModel, ImportOverwriteDialogModel } from "../../hooks/useNetworkImportExport";
import { ImportOverwriteDialog } from "../dialogs/ImportOverwriteDialog";
import { FileFeedbackDialog } from "../dialogs/FileFeedbackDialog";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { focusElementWithoutScroll, nextSortState, sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { FORM_PANEL_IDS, scrollToFormPanel } from "../../lib/form-panel-scroll";
import type { SortState } from "../../types/app-controller";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  networkSort: SortState;
  setNetworkSort: (value: SortState | ((current: SortState) => SortState)) => void;
  networkEntityCountsById: Partial<
    Record<
      NetworkId,
      {
        catalogCount: number;
        connectorCount: number;
        spliceCount: number;
        nodeCount: number;
        segmentCount: number;
        wireCount: number;
      }
    >
  >;
  activeNetworkId: NetworkId | null;
  handleSelectNetwork: (networkId: NetworkId) => void;
  handleOpenNetworkInModeling: (networkId: NetworkId) => void;
  handleDuplicateNetwork: (networkId: NetworkId | null) => void;
  handleExportNetwork: (networkId: NetworkId) => void;
  handleOpenImportPicker: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDeleteNetwork: (networkId: NetworkId | null) => void;
  handleRecomputeNetwork: () => void;
  networkFormMode: "create" | "edit" | null;
  handleOpenCreateNetworkForm: () => void;
  handleOpenEditNetworkForm: (networkId: NetworkId) => void;
  handleCloseNetworkForm: () => void;
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  newNetworkTechnicalId: string;
  setNewNetworkTechnicalId: (value: string) => void;
  newNetworkCreatedAtDate: string;
  setNewNetworkCreatedAtDate: (value: string) => void;
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
  newNetworkAuthor: string;
  setNewNetworkAuthor: (value: string) => void;
  newNetworkVoltageV: string;
  setNewNetworkVoltageV: (value: string) => void;
  newNetworkProjectCode: string;
  setNewNetworkProjectCode: (value: string) => void;
  newNetworkEntityPrefix: string;
  setNewNetworkEntityPrefix: (value: string) => void;
  newNetworkLogoUrl: string;
  setNewNetworkLogoUrl: (value: string) => void;
  newNetworkExportNotes: string;
  setNewNetworkExportNotes: (value: string) => void;
  networkFormError: string | null;
  networkTechnicalIdAlreadyUsed: boolean;
  handleSubmitNetworkForm: (event: FormEvent<HTMLFormElement>) => void;
  focusRequestedNetworkId: NetworkId | null;
  focusRequestedNetworkToken: number;
  onOpenOnboardingHelp?: () => void;
  functionalSchematicPanel?: ReactNode;
  importOverwriteDialog?: ImportOverwriteDialogModel | null;
  importFailureDialog?: FileFeedbackDialogModel | null;
}

export function NetworkScopeWorkspaceContent({
  networks,
  networkSort,
  setNetworkSort,
  networkEntityCountsById,
  activeNetworkId,
  handleSelectNetwork,
  handleOpenNetworkInModeling,
  handleDuplicateNetwork,
  handleExportNetwork,
  handleOpenImportPicker,
  importFileInputRef,
  handleImportFileChange,
  handleDeleteNetwork,
  handleRecomputeNetwork,
  networkFormMode,
  handleOpenCreateNetworkForm,
  handleOpenEditNetworkForm,
  handleCloseNetworkForm,
  newNetworkName,
  setNewNetworkName,
  newNetworkTechnicalId,
  setNewNetworkTechnicalId,
  newNetworkCreatedAtDate,
  setNewNetworkCreatedAtDate,
  newNetworkDescription,
  setNewNetworkDescription,
  newNetworkAuthor,
  setNewNetworkAuthor,
  newNetworkVoltageV,
  setNewNetworkVoltageV,
  newNetworkProjectCode,
  setNewNetworkProjectCode,
  newNetworkEntityPrefix,
  setNewNetworkEntityPrefix,
  newNetworkLogoUrl,
  setNewNetworkLogoUrl,
  newNetworkExportNotes,
  setNewNetworkExportNotes,
  networkFormError,
  networkTechnicalIdAlreadyUsed,
  handleSubmitNetworkForm,
  focusRequestedNetworkId,
  focusRequestedNetworkToken,
  onOpenOnboardingHelp,
  functionalSchematicPanel,
  importOverwriteDialog = null,
  importFailureDialog = null
}: NetworkScopeWorkspaceContentProps): ReactElement {
  type NetworkScopeFilterField = "name" | "technicalId" | "any";
  type NetworkScopeTableSortField = "name" | "technicalId" | "status";
  const isCreateMode = networkFormMode === "create";
  const isEditMode = networkFormMode === "edit";
  const isFormOpen = isCreateMode || isEditMode;
  const [focusedNetworkId, setFocusedNetworkId] = useState<NetworkId | null>(null);
  const [hasExplicitNetworkSelection, setHasExplicitNetworkSelection] = useState(false);
  const [networkFilterField, setNetworkFilterField] = useState<NetworkScopeFilterField>("any");
  const [networkFilterQuery, setNetworkFilterQuery] = useState("");
  const [networkTableSort, setNetworkTableSort] = useState<{ field: NetworkScopeTableSortField; direction: "asc" | "desc" }>({
    field: networkSort.field === "technicalId" ? "technicalId" : "name",
    direction: networkSort.direction
  });
  const isMobileViewport = useIsMobileViewport();
  const rowRefs = useRef<Partial<Record<NetworkId, HTMLTableRowElement | null>>>({});
  const lastHandledFocusRequestTokenRef = useRef<number>(-1);

  const sortedNetworks = useMemo(
    () =>
      sortByTableColumns(
        networks,
        networkTableSort,
        (network, field) => {
          if (field === "name") return network.name;
          if (field === "technicalId") return network.technicalId;
          return activeNetworkId === network.id ? "active" : "available";
        },
        (network) => `${network.technicalId}::${network.name}`
      ),
    [activeNetworkId, networkTableSort, networks]
  );
  const focusedNetwork = focusedNetworkId === null ? null : networks.find((network) => network.id === focusedNetworkId) ?? null;
  const showNetworkFormPanel = isCreateMode || (isEditMode && focusedNetwork !== null && hasExplicitNetworkSelection);
  const focusedNetworkCounts =
    focusedNetworkId === null ? null : networkEntityCountsById[focusedNetworkId] ?? null;
  const networkSortIndicator = (field: NetworkScopeTableSortField): "asc" | "desc" | null => {
    if (networkTableSort.field !== field) {
      return null;
    }
    return networkTableSort.direction;
  };
  const setNetworkTableSortField = (field: NetworkScopeTableSortField) => {
    setNetworkTableSort((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    }));
    if (field === "name" || field === "technicalId") {
      setNetworkSort((current) => nextSortState(current, field));
    }
  };
  const normalizedNetworkFilterQuery = networkFilterQuery.trim().toLocaleLowerCase();
  const visibleNetworks = useMemo(() => {
    if (normalizedNetworkFilterQuery.length === 0) {
      return sortedNetworks;
    }

    return sortedNetworks.filter((network) => {
      const nameText = network.name.toLocaleLowerCase();
      const technicalIdText = network.technicalId.toLocaleLowerCase();
      if (networkFilterField === "name") {
        return nameText.includes(normalizedNetworkFilterQuery);
      }
      if (networkFilterField === "technicalId") {
        return technicalIdText.includes(normalizedNetworkFilterQuery);
      }
      return `${nameText} ${technicalIdText}`.includes(normalizedNetworkFilterQuery);
    });
  }, [networkFilterField, normalizedNetworkFilterQuery, sortedNetworks]);
  const networkFilterPlaceholder =
    networkFilterField === "name"
      ? t("ui.networkName")
      : networkFilterField === "technicalId"
        ? t("ui.technicalID")
        : t("ui.nameOrTechnicalID");
  useEffect(() => {
    if (networks.length === 0) {
      setFocusedNetworkId(null);
      return;
    }

    if (focusedNetworkId === null) {
      return;
    }

    const hasFocusedNetwork = networks.some((network) => network.id === focusedNetworkId);
    if (hasFocusedNetwork) {
      return;
    }

    setFocusedNetworkId(activeNetworkId ?? networks[0]?.id ?? null);
  }, [activeNetworkId, focusedNetworkId, networks]);

  useEffect(() => {
    if (focusRequestedNetworkId === null) {
      return;
    }

    if (lastHandledFocusRequestTokenRef.current === focusRequestedNetworkToken) {
      return;
    }

    if (!networks.some((network) => network.id === focusRequestedNetworkId)) {
      return;
    }

    lastHandledFocusRequestTokenRef.current = focusRequestedNetworkToken;
    setFocusedNetworkId(focusRequestedNetworkId);
    if (typeof window === "undefined") {
      focusElementWithoutScroll(rowRefs.current[focusRequestedNetworkId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(rowRefs.current[focusRequestedNetworkId]);
    });
  }, [focusRequestedNetworkId, focusRequestedNetworkToken, networks]);

  useEffect(() => {
    if (!isEditMode || focusedNetwork !== null) {
      return;
    }

    handleCloseNetworkForm();
  }, [focusedNetwork, handleCloseNetworkForm, isEditMode]);

  useEffect(() => {
    if (isCreateMode) {
      setHasExplicitNetworkSelection(false);
      return;
    }

    if (!isEditMode) {
      setHasExplicitNetworkSelection(false);
    }
  }, [isCreateMode, isEditMode]);

  const indicators = [
    { label: t("ui.catalog"), value: focusedNetworkCounts?.catalogCount ?? 0 },
    { label: t("ui.connectors"), value: focusedNetworkCounts?.connectorCount ?? 0 },
    { label: t("ui.splices"), value: focusedNetworkCounts?.spliceCount ?? 0 },
    { label: t("ui.nodes"), value: focusedNetworkCounts?.nodeCount ?? 0 },
    { label: t("ui.segments"), value: focusedNetworkCounts?.segmentCount ?? 0 },
    { label: t("ui.wires"), value: focusedNetworkCounts?.wireCount ?? 0 }
  ];

  return (
    <>
    <section className="panel-grid network-scope-grid">
      <section className="panel network-scope-panel" data-onboarding-panel="network-scope">
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.networkScope")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "network-scope",
                    [t("ui.name"), t("ui.technicalID"), "Status"],
                    visibleNetworks.map((network) => [
                      network.name,
                      network.technicalId,
                      activeNetworkId === network.id ? "Active" : "Available"
                    ])
                  )
                }
                disabled={visibleNetworks.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.networkFilterField")}
                fieldValue={networkFilterField}
                onFieldChange={(value) => setNetworkFilterField(value as NetworkScopeFilterField)}
                fieldOptions={[
                  { value: "any", label: t("ui.any") },
                  { value: "name", label: t("ui.name") },
                  { value: "technicalId", label: t("ui.technicalID") }
                ]}
                queryValue={networkFilterQuery}
                onQueryChange={setNetworkFilterQuery}
                placeholder={networkFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {networks.length === 0 ? (
          <p className="empty-copy">{t("ui.networkscopeworkspacecontentNoNetworkAvailableCreateOneToEnableModelingAndAnalysis")}</p>
        ) : visibleNetworks.length === 0 ? (
          <>
            <p className="empty-copy">{t("ui.networkscopeworkspacecontentNoNetworkMatchesTheCurrentFilters")}</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <div className="network-scope-list-shell">
              <table className="data-table network-scope-list" aria-label={t("ui.networksList")}>
                <colgroup>
                  <col className="network-scope-col-name" />
                  <col className="network-scope-col-technical-id" />
                  <col className="network-scope-col-status" />
                </colgroup>
                <thead>
                  <tr>
                    <th aria-sort={getTableAriaSort(networkTableSort, "name")}>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() => setNetworkTableSortField("name")}
                      >
                        
                        {t("ui.name")}{" "}
                        <span
                          className={
                            networkSortIndicator("name") === null
                              ? "sort-indicator"
                              : `sort-indicator is-${networkSortIndicator("name")}`
                          }
                          aria-hidden="true"
                        >
                          {networkSortIndicator("name") === null ? "" : "▲"}
                        </span>
                      </button>
                    </th>
                    <th aria-sort={getTableAriaSort(networkTableSort, "technicalId")}>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() => setNetworkTableSortField("technicalId")}
                      >
                        {isMobileViewport ? t("ui.id") : t("ui.technicalID")}{" "}
                        <span
                          className={
                            networkSortIndicator("technicalId") === null
                              ? "sort-indicator"
                              : `sort-indicator is-${networkSortIndicator("technicalId")}`
                          }
                          aria-hidden="true"
                        >
                          {networkSortIndicator("technicalId") === null ? "" : "▲"}
                        </span>
                      </button>
                    </th>
                    <th aria-sort={getTableAriaSort(networkTableSort, "status")}>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() => setNetworkTableSortField("status")}
                      >
                        {t("ui.modelingaiagentpanelStatus")}{" "}
                        <span
                          className={
                            networkSortIndicator("status") === null
                              ? "sort-indicator"
                              : `sort-indicator is-${networkSortIndicator("status")}`
                          }
                          aria-hidden="true"
                        >
                          {networkSortIndicator("status") === null ? "" : "▲"}
                        </span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleNetworks.map((network) => {
                    const isActive = activeNetworkId === network.id;
                    const isFocused = focusedNetworkId === network.id;
                    const canSetActive = !isCreateMode && !isActive;
                    return (
                      <tr
                        key={network.id}
                        ref={(element) => {
                          rowRefs.current[network.id] = element;
                        }}
                        className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                        aria-selected={isFocused}
                        tabIndex={0}
                        onClick={(event) => {
                          event.currentTarget.focus();
                          setFocusedNetworkId(network.id);
                          setHasExplicitNetworkSelection(true);
                          handleOpenEditNetworkForm(network.id);
                        }}
                        onDoubleClick={() => {
                          if (!canSetActive) {
                            return;
                          }
                          handleSelectNetwork(network.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setFocusedNetworkId(network.id);
                            setHasExplicitNetworkSelection(true);
                            handleOpenEditNetworkForm(network.id);
                          }
                        }}
                      >
                        <td>{network.name}</td>
                        <td><span className="technical-id">{network.technicalId}</span></td>
                        <td>
                          <span className={isActive ? "network-scope-status-chip is-active" : "network-scope-status-chip is-available"}>
                            {isActive ? t("ui.networkscopeworkspacecontentActive") : t("ui.networkscopeworkspacecontentAvailable")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TableEntryCountFooter count={visibleNetworks.length} />
          </>
        )}
        <div className="row-actions compact network-scope-list-actions">
          <div className="network-scope-list-actions-row">
            <button
              type="button"
              className="button-with-icon"
              onClick={() => {
                if (focusedNetwork !== null) {
                  handleOpenNetworkInModeling(focusedNetwork.id);
                }
              }}
              disabled={focusedNetwork === null || isCreateMode}
            >
              <span className="action-button-icon is-open" aria-hidden="true" />
              
              {t("ui.open")}
            </button>
            <button
              type="button"
              className="network-scope-create-button button-with-icon"
              onClick={() => {
                handleOpenCreateNetworkForm();
                scrollToFormPanel(FORM_PANEL_IDS.networkScope);
              }}
            >
              <span className="action-button-icon is-new" aria-hidden="true" />
              
              {t("ui.new")}
            </button>
            <button
              type="button"
              className="button-with-icon"
              onClick={() => {
                if (focusedNetwork !== null) {
                  handleDuplicateNetwork(focusedNetwork.id);
                }
              }}
              disabled={focusedNetwork === null || isCreateMode}
            >
              <span className="action-button-icon is-duplicate" aria-hidden="true" />
              {isMobileViewport ? t("ui.networkscopeworkspacecontentDup") : t("ui.networkscopeworkspacecontentDuplicate")}
            </button>
            <button
              type="button"
              className="button-with-icon network-scope-export-button"
              onClick={() => {
                if (focusedNetwork !== null) {
                  handleExportNetwork(focusedNetwork.id);
                }
              }}
              disabled={focusedNetwork === null || isCreateMode}
            >
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              {isMobileViewport ? t("ui.networkscopeworkspacecontentExp") : t("ui.tabularexportpreviewdialogExport")}
            </button>
            <button
              type="button"
              className="button-with-icon"
              onClick={handleOpenImportPicker}
              disabled={isCreateMode}
            >
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              {isMobileViewport ? t("ui.networkscopeworkspacecontentImp") : t("ui.modelingcataloglistpanelImport")}
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                void handleImportFileChange(event);
              }}
              hidden
            />
            {importOverwriteDialog !== null ? (
              <ImportOverwriteDialog
                isOpen
                candidates={importOverwriteDialog.candidates}
                onConfirm={importOverwriteDialog.onConfirm}
                onCancel={importOverwriteDialog.onCancel}
              />
            ) : null}
          </div>
        </div>
      </section>

      {functionalSchematicPanel}

      <section className="panel network-form-panel" hidden={!showNetworkFormPanel} data-form-panel={FORM_PANEL_IDS.networkScope}>
        <header className="network-form-header">
          <h2>{isCreateMode ? t("ui.createNetwork") : t("ui.editNetwork")}</h2>
          <span
            className={
              isCreateMode
                ? "network-form-mode-chip is-create"
                : isEditMode
                  ? "network-form-mode-chip is-edit"
                  : "network-form-mode-chip"
            }
          >
            {isCreateMode ? t("ui.createMode") : t("ui.editMode")}
          </span>
        </header>
        <section className="network-scope-indicators network-scope-indicators-form" aria-label={t("ui.focusedNetworkEntityCounters")}>
          {indicators.map((indicator) => (
            <article key={indicator.label} className="network-scope-indicator">
              <span className="network-scope-indicator-label">{indicator.label}</span>
              <strong className="network-scope-indicator-value">{indicator.value}</strong>
            </article>
          ))}
        </section>
        {showNetworkFormPanel ? (
          <form className="settings-grid network-form-grid" onSubmit={handleSubmitNetworkForm}>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.networkName")}</span>
              <input value={newNetworkName} onChange={(event) => setNewNetworkName(event.target.value)} placeholder={t("ui.vehiclePlatformA")} />
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.networkscopeworkspacecontentNetworkTechnicalID")}</span>
              <input
                value={newNetworkTechnicalId}
                onChange={(event) => setNewNetworkTechnicalId(event.target.value)}
                placeholder="NET-PLAT-A"
              />
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.networkscopeworkspacecontentDescriptionOptional")}</span>
              <input
                value={newNetworkDescription}
                onChange={(event) => setNewNetworkDescription(event.target.value)}
                placeholder={t("ui.optionalDescription")}
              />
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.creationDate")}</span>
              <input
                type="date"
                value={newNetworkCreatedAtDate}
                onChange={(event) => setNewNetworkCreatedAtDate(event.target.value)}
              />
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.authorOptional")}</span>
              <input
                value={newNetworkAuthor}
                onChange={(event) => setNewNetworkAuthor(event.target.value)}
                placeholder={t("ui.networkscopeworkspacecontentJaneDoe")}
                maxLength={80}
              />
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.networkscopeworkspacecontentVoltageVOptional")}</span>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={newNetworkVoltageV}
                onChange={(event) => setNewNetworkVoltageV(event.target.value)}
                placeholder="12"
              />
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.projectCodeOptional")}</span>
              <input
                value={newNetworkProjectCode}
                onChange={(event) => setNewNetworkProjectCode(event.target.value)}
                placeholder="PRJ-A1"
                maxLength={40}
              />
              <span className="form-hint">{t("ui.allowedLettersNumbersSpacesAnd")}</span>
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.entityIDPrefixOptional")}</span>
              <input
                value={newNetworkEntityPrefix}
                onChange={(event) => setNewNetworkEntityPrefix(event.target.value)}
                placeholder="LAT-"
                maxLength={24}
              />
              <span className="form-hint">
                
                {t("ui.anchoredIntoNewEntityIDsEGLATC001")}
              </span>
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.logoURLOptional")}</span>
              <input
                value={newNetworkLogoUrl}
                onChange={(event) => setNewNetworkLogoUrl(event.target.value)}
                placeholder="https://example.com/logo.png"
                maxLength={2048}
              />
              <span className="form-hint">{t("ui.allowedSchemesHttpHttpsDataImage")}</span>
            </label>
            <label className="stack-label">
              <span className="network-form-label">{t("ui.exportNotesOptional")}</span>
              <textarea
                value={newNetworkExportNotes}
                onChange={(event) => setNewNetworkExportNotes(event.target.value)}
                placeholder={t("ui.networkscopeworkspacecontentFreeMultilineNotesShownInExportCartouche")}
                rows={4}
                maxLength={2000}
              />
            </label>
            {networkFormError !== null ? <p className="form-error">{networkFormError}</p> : null}
            {networkTechnicalIdAlreadyUsed ? <p className="form-hint danger">{t("ui.networkscopeworkspacecontentTechnicalIDAlreadyUsedByAnotherNetwork")}</p> : null}
            <div className="row-actions compact network-form-submit-actions">
              <button type="submit" className={isFormOpen ? "button-with-icon" : undefined}>
                {isCreateMode ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
                {isEditMode ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
                {isCreateMode ? t("ui.createNetwork") : t("ui.saveNetwork")}
              </button>
              {isEditMode ? (
                <button
                  type="button"
                  className="button-with-icon"
                  onClick={() => {
                    if (focusedNetwork !== null) {
                      handleSelectNetwork(focusedNetwork.id);
                    }
                  }}
                  disabled={focusedNetwork === null || focusedNetwork.id === activeNetworkId}
                >
                  <span className="action-button-icon is-active" aria-hidden="true" />
                  {t("ui.networkscopeworkspacecontentSetActive")}</button>
              ) : null}
              {isEditMode ? (
                <button
                  type="button"
                  className="network-delete-button button-with-icon"
                  onClick={() => {
                    if (focusedNetwork !== null) {
                      handleDeleteNetwork(focusedNetwork.id);
                    }
                  }}
                  disabled={focusedNetwork === null}
                >
                  <span className="action-button-icon is-delete" aria-hidden="true" />
                  
                  {t("ui.delete")}
                </button>
              ) : null}
              {isEditMode ? (
                <button
                  type="button"
                  className="button-with-icon"
                  title={t("ui.recomputeAllWireRoutesAndSpliceSidesForThisNetwork")}
                  onClick={handleRecomputeNetwork}
                  disabled={focusedNetwork === null || focusedNetwork.id !== activeNetworkId}
                >
                  <span className="action-button-icon is-redo" aria-hidden="true" />
                  
                  {t("ui.recomputeRoutes")}
                </button>
              ) : null}
              <button
                type="button"
                className={isEditMode ? "button-with-icon" : undefined}
                onClick={() => {
                  setFocusedNetworkId(null);
                  setHasExplicitNetworkSelection(false);
                  handleCloseNetworkForm();
                }}
              >
                {isEditMode ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
                
                {t("ui.cancel")}
              </button>
            </div>
          </form>
        ) : null}
      </section>

    </section>
    {importFailureDialog !== null ? (
      <FileFeedbackDialog
        isOpen={importFailureDialog !== null}
        title={importFailureDialog.title}
        message={importFailureDialog.message}
        items={importFailureDialog.items}
        onClose={importFailureDialog.onClose}
      />
    ) : null}
    </>
  );
}
