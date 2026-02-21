import type { ChangeEvent, ReactElement, RefObject } from "react";
import type { NetworkImportSummary } from "../../../adapters/portability";
import type { NetworkId } from "../../../core/entities";
import type { ImportExportStatus } from "../../types/app-controller";

interface SettingsWorkspaceContentProps {
  isCurrentWorkspaceEmpty: boolean;
  hasBuiltInSampleState: boolean;
  handleRecreateSampleNetwork: () => void;
  handleResetSampleNetwork: () => void;
  activeNetworkId: NetworkId | null;
  selectedExportNetworkIds: NetworkId[];
  handleExportNetworks: (scope: "active" | "selected" | "all") => void;
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  toggleSelectedExportNetwork: (networkId: NetworkId) => void;
  handleOpenImportPicker: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importExportStatus: ImportExportStatus | null;
  lastImportSummary: NetworkImportSummary | null;
}

export function SettingsWorkspaceContent({
  isCurrentWorkspaceEmpty,
  hasBuiltInSampleState,
  handleRecreateSampleNetwork,
  handleResetSampleNetwork,
  activeNetworkId,
  selectedExportNetworkIds,
  handleExportNetworks,
  networks,
  toggleSelectedExportNetwork,
  handleOpenImportPicker,
  importFileInputRef,
  handleImportFileChange,
  importExportStatus,
  lastImportSummary
}: SettingsWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
      <section className="panel">
        <h2>Sample network controls</h2>
        <p className="meta-line">
          Workspace empty: {isCurrentWorkspaceEmpty ? "yes" : "no"} / Sample signature detected: {hasBuiltInSampleState ? "yes" : "no"}.
        </p>
        <div className="row-actions">
          <button type="button" onClick={handleRecreateSampleNetwork} disabled={!isCurrentWorkspaceEmpty}>
            Recreate sample network (empty workspace only)
          </button>
          <button type="button" onClick={handleResetSampleNetwork} disabled={!hasBuiltInSampleState}>
            Reset sample network to baseline
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Import / Export networks</h2>
        <p className="meta-line">
          Export active, selected, or all networks as deterministic JSON payloads. Import preserves existing local data and resolves conflicts with deterministic suffixes.
        </p>
        <div className="row-actions">
          <button type="button" onClick={() => handleExportNetworks("active")} disabled={activeNetworkId === null}>Export active</button>
          <button type="button" onClick={() => handleExportNetworks("selected")} disabled={selectedExportNetworkIds.length === 0}>Export selected</button>
          <button type="button" onClick={() => handleExportNetworks("all")} disabled={networks.length === 0}>Export all</button>
        </div>
        <fieldset className="inline-fieldset">
          <legend>Selected networks for export</legend>
          {networks.length === 0 ? (
            <p className="empty-copy">No network available.</p>
          ) : (
            <div className="settings-grid">
              {networks.map((network) => (
                <label key={network.id} className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedExportNetworkIds.includes(network.id)}
                    onChange={() => toggleSelectedExportNetwork(network.id)}
                  />
                  {network.name} (<span className="technical-id">{network.technicalId}</span>)
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="row-actions">
          <button type="button" onClick={handleOpenImportPicker}>Import from file</button>
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              void handleImportFileChange(event);
            }}
            hidden
          />
        </div>
        {importExportStatus !== null ? <p className={`meta-line import-status is-${importExportStatus.kind}`}>{importExportStatus.message}</p> : null}
        {lastImportSummary !== null ? (
          <div className="settings-grid">
            <p className="meta-line">Imported: {lastImportSummary.importedNetworkIds.length}</p>
            <p className="meta-line">Skipped: {lastImportSummary.skippedNetworkIds.length}</p>
            <p className="meta-line">Warnings: {lastImportSummary.warnings.length}</p>
            <p className="meta-line">Errors: {lastImportSummary.errors.length}</p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
