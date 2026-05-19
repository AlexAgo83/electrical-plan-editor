import type { ChangeEvent, ReactElement, RefObject } from "react";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Splice,
  SpliceId,
  Wire
} from "../../../core/entities";
import { CatalogAnalysisWorkspaceContent } from "../../components/workspace/CatalogAnalysisWorkspaceContent";
import { ModelingCatalogFormPanel } from "../../components/workspace/ModelingCatalogFormPanel";
import { ModelingCatalogListPanel } from "../../components/workspace/ModelingCatalogListPanel";
import type { CatalogHandlersModel } from "../useCatalogHandlers";
import type { EntityFormsStateModel } from "../useEntityFormsState";
import type { ImportExportStatus, WorkspaceCurrencyCode } from "../../types/app-controller";

interface UseAppControllerCatalogScreenDomainsParams {
  isCatalogSubScreen: boolean;
  catalogItems: CatalogItem[];
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
  selectedCatalogItemId: CatalogItemId | null;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  catalogHandlers: CatalogHandlersModel;
  formsState: EntityFormsStateModel;
  catalogManufacturerReferenceAlreadyUsed: boolean;
  handleExportCatalogCsv: () => void;
  handleOpenCatalogCsvImportPicker: () => void;
  catalogCsvImportFileInputRef: RefObject<HTMLInputElement | null>;
  handleCatalogCsvImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  catalogCsvImportExportStatus: ImportExportStatus | null;
  catalogCsvLastImportSummaryLine: string | null;
  onOpenCatalogOnboardingHelp: () => void;
  onCreateConnectorFromCatalog: (catalogItemId: CatalogItemId) => void;
  onCreateSpliceFromCatalog: (catalogItemId: CatalogItemId) => void;
  onOpenConnectorFromCatalogAnalysis: (connectorId: ConnectorId) => void;
  onOpenSpliceFromCatalogAnalysis: (spliceId: SpliceId) => void;
  onUpdateWireEndpointReferenceName: (
    kind: "connection" | "seal",
    reference: string,
    nextName: string
  ) => Promise<boolean | { apply: () => void }> | boolean | { apply: () => void };
  modelingLeftColumnContent: ReactElement | null;
  modelingFormsColumnContent: ReactElement | null;
  analysisWorkspaceContent: ReactElement | null;
}

interface UseAppControllerCatalogScreenDomainsResult {
  modelingLeftColumnContentForSubScreen: ReactElement | null;
  modelingFormsColumnContentForSubScreen: ReactElement | null;
  analysisWorkspaceContentForSubScreen: ReactElement | null;
}

export function useAppControllerCatalogScreenDomains({
  isCatalogSubScreen,
  catalogItems,
  connectors,
  splices,
  wires,
  selectedCatalogItemId,
  workspaceCurrencyCode,
  catalogHandlers,
  formsState,
  catalogManufacturerReferenceAlreadyUsed,
  handleExportCatalogCsv,
  handleOpenCatalogCsvImportPicker,
  catalogCsvImportFileInputRef,
  handleCatalogCsvImportFileChange,
  catalogCsvImportExportStatus,
  catalogCsvLastImportSummaryLine,
  onOpenCatalogOnboardingHelp,
  onCreateConnectorFromCatalog,
  onCreateSpliceFromCatalog,
  onOpenConnectorFromCatalogAnalysis,
  onOpenSpliceFromCatalogAnalysis,
  onUpdateWireEndpointReferenceName,
  modelingLeftColumnContent,
  modelingFormsColumnContent,
  analysisWorkspaceContent
}: UseAppControllerCatalogScreenDomainsParams): UseAppControllerCatalogScreenDomainsResult {
  const catalogModelingLeftColumnContent = (
    <ModelingCatalogListPanel
      isCatalogSubScreen={isCatalogSubScreen}
      catalogItems={catalogItems}
      selectedCatalogItemId={selectedCatalogItemId}
      catalogFormMode={formsState.catalogFormMode}
      workspaceCurrencyCode={workspaceCurrencyCode}
      isSelectedCatalogItemReferenced={
        selectedCatalogItemId !== null &&
        (connectors.some((connector) => connector.catalogItemId === selectedCatalogItemId) ||
          splices.some((splice) => splice.catalogItemId === selectedCatalogItemId))
      }
      onOpenCreateCatalogItem={catalogHandlers.resetCatalogForm}
      onEditCatalogItem={catalogHandlers.startCatalogEdit}
      onDeleteCatalogItem={catalogHandlers.handleCatalogDelete}
      onExportCatalogCsv={handleExportCatalogCsv}
      onOpenCatalogCsvImportPicker={handleOpenCatalogCsvImportPicker}
      catalogCsvImportFileInputRef={catalogCsvImportFileInputRef}
      onCatalogCsvImportFileChange={handleCatalogCsvImportFileChange}
      catalogCsvImportExportStatus={catalogCsvImportExportStatus}
      catalogCsvLastImportSummaryLine={catalogCsvLastImportSummaryLine}
      onOpenCatalogOnboardingHelp={onOpenCatalogOnboardingHelp}
    />
  );

  const catalogModelingFormsColumnContent = (
    <section className="panel-grid workspace-column workspace-column-right">
      <ModelingCatalogFormPanel
        isCatalogSubScreen={isCatalogSubScreen}
        catalogFormMode={formsState.catalogFormMode}
        openCreateCatalogForm={catalogHandlers.resetCatalogForm}
        handleCatalogSubmit={catalogHandlers.handleCatalogSubmit}
        catalogManufacturerReference={formsState.catalogManufacturerReference}
        setCatalogManufacturerReference={formsState.setCatalogManufacturerReference}
        catalogConnectionCount={formsState.catalogConnectionCount}
        setCatalogConnectionCount={formsState.setCatalogConnectionCount}
        catalogName={formsState.catalogName}
        setCatalogName={formsState.setCatalogName}
        workspaceCurrencyCode={workspaceCurrencyCode}
        catalogUnitPriceExclTax={formsState.catalogUnitPriceExclTax}
        setCatalogUnitPriceExclTax={formsState.setCatalogUnitPriceExclTax}
        catalogUrl={formsState.catalogUrl}
        setCatalogUrl={formsState.setCatalogUrl}
        catalogAllSameTerminals={formsState.catalogAllSameTerminals}
        setCatalogAllSameTerminals={formsState.setCatalogAllSameTerminals}
        catalogDefaultTerminalReference={formsState.catalogDefaultTerminalReference}
        setCatalogDefaultTerminalReference={formsState.setCatalogDefaultTerminalReference}
        catalogDefaultTerminalName={formsState.catalogDefaultTerminalName}
        setCatalogDefaultTerminalName={formsState.setCatalogDefaultTerminalName}
        catalogDefaultSealReference={formsState.catalogDefaultSealReference}
        setCatalogDefaultSealReference={formsState.setCatalogDefaultSealReference}
        catalogDefaultSealName={formsState.catalogDefaultSealName}
        setCatalogDefaultSealName={formsState.setCatalogDefaultSealName}
        catalogPlugDefinitionsText={formsState.catalogPlugDefinitionsText}
        setCatalogPlugDefinitionsText={formsState.setCatalogPlugDefinitionsText}
        catalogConnectorLayout={formsState.catalogConnectorLayout}
        setCatalogConnectorLayout={formsState.setCatalogConnectorLayout}
        catalogManufacturerReferenceAlreadyUsed={catalogManufacturerReferenceAlreadyUsed}
        cancelCatalogEdit={catalogHandlers.cancelCatalogEdit}
        catalogFormError={formsState.catalogFormError}
      />
    </section>
  );

  const selectedCatalogItem =
    selectedCatalogItemId === null ? null : (catalogItems.find((item) => item.id === selectedCatalogItemId) ?? null);

  const catalogAnalysisWorkspaceContent = (
    <CatalogAnalysisWorkspaceContent
      isCatalogSubScreen={isCatalogSubScreen}
      selectedCatalogItemId={selectedCatalogItemId}
      selectedCatalogItemManufacturerReference={selectedCatalogItem?.manufacturerReference ?? null}
      linkedConnectors={selectedCatalogItemId === null ? [] : connectors.filter((connector) => connector.catalogItemId === selectedCatalogItemId)}
      linkedSplices={selectedCatalogItemId === null ? [] : splices.filter((splice) => splice.catalogItemId === selectedCatalogItemId)}
      wires={wires}
      onCreateConnectorFromCatalog={onCreateConnectorFromCatalog}
      onCreateSpliceFromCatalog={onCreateSpliceFromCatalog}
      onOpenConnector={onOpenConnectorFromCatalogAnalysis}
      onOpenSplice={onOpenSpliceFromCatalogAnalysis}
      onUpdateWireEndpointReferenceName={onUpdateWireEndpointReferenceName}
    />
  );

  return {
    modelingLeftColumnContentForSubScreen: isCatalogSubScreen
      ? catalogModelingLeftColumnContent
      : modelingLeftColumnContent,
    modelingFormsColumnContentForSubScreen: isCatalogSubScreen
      ? catalogModelingFormsColumnContent
      : modelingFormsColumnContent,
    analysisWorkspaceContentForSubScreen: isCatalogSubScreen
      ? catalogAnalysisWorkspaceContent
      : analysisWorkspaceContent
  };
}
