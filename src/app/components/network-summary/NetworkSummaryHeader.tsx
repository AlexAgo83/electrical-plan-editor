import type { ChangeEvent, ReactElement } from "react";
import type { Network, NetworkId } from "../../../core/entities";
import { NetworkSummaryEditMenu } from "./NetworkSummaryEditMenu";
import { NetworkSummaryExportMenu } from "./NetworkSummaryExportMenu";
import { NetworkSummaryFunctionalMenu } from "./NetworkSummaryFunctionalMenu";
import { NetworkSummaryViewMenu } from "./NetworkSummaryViewMenu";

interface NetworkSummaryHeaderProps {
  activeNetwork: Network | null;
  networks: Array<Pick<Network, "id" | "name" | "technicalId">>;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  showFloatingInspectorPanel: boolean;
  showNetworkInfoPanels: boolean;
  showSegmentLengths: boolean;
  showSegmentDressings: boolean;
  showCableCallouts: boolean;
  canExportSvg: boolean;
  canExportPng: boolean;
  canExportPdf: boolean;
  canExportBomCsv: boolean;
  canExportNetwork: boolean;
  onSelectActiveNetwork: (networkId: NetworkId) => void;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  toggleLockEntityMovement: () => void;
  toggleShowFloatingInspectorPanel: () => void;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowSegmentDressings: () => void;
  toggleShowCableCallouts: () => void;
  onRegenerateLayout: () => void;
  onOpenCurrentNetworkFunctional?: () => void;
  onOpenMultiNetworkFunctionalAnalysis?: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onExportNetwork: () => void;
  onExportBomCsv: () => void;
}

export function NetworkSummaryHeader({
  activeNetwork,
  networks,
  showNetworkGrid,
  snapNodesToGrid,
  lockEntityMovement,
  showFloatingInspectorPanel,
  showNetworkInfoPanels,
  showSegmentLengths,
  showSegmentDressings,
  showCableCallouts,
  canExportSvg,
  canExportPng,
  canExportPdf,
  canExportBomCsv,
  canExportNetwork,
  onSelectActiveNetwork,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
  toggleShowFloatingInspectorPanel,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
  toggleShowSegmentDressings,
  toggleShowCableCallouts,
  onRegenerateLayout,
  onOpenCurrentNetworkFunctional,
  onOpenMultiNetworkFunctionalAnalysis,
  onExportSvg,
  onExportPng,
  onExportPdf,
  onExportNetwork,
  onExportBomCsv
}: NetworkSummaryHeaderProps): ReactElement {
  const activeNetworkName = activeNetwork?.name.trim() ?? "";
  const activeNetworkSelectorLabel =
    activeNetworkName.length > 0 ? `Active plan: ${activeNetworkName}. Change active plan` : "Change active plan";
  const handleActiveNetworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextNetworkId = event.target.value as NetworkId;
    if (activeNetwork?.id === nextNetworkId || !networks.some((network) => network.id === nextNetworkId)) {
      return;
    }
    onSelectActiveNetwork(nextNetworkId);
  };

  return (
    <header className="network-summary-header">
      <div className="network-summary-title">
        <h2>Network summary</h2>
        {activeNetworkName.length > 0 ? (
          <>
            <span className="network-summary-title-separator" aria-hidden="true">
              :
            </span>
            <label className="network-summary-active-network-selector">
              <span className="network-summary-active-network-icon" aria-hidden="true" />
              <span className="network-summary-active-network" aria-hidden="true">
                {activeNetworkName}
              </span>
              <select
                aria-label={activeNetworkSelectorLabel}
                value={activeNetwork?.id ?? ""}
                onChange={handleActiveNetworkChange}
                disabled={networks.length < 2}
              >
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name} ({network.technicalId})
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
      </div>
      <div className="network-summary-header-actions" role="group" aria-label="Network summary display options">
        <NetworkSummaryEditMenu
          showNetworkGrid={showNetworkGrid}
          snapNodesToGrid={snapNodesToGrid}
          lockEntityMovement={lockEntityMovement}
          toggleShowNetworkGrid={toggleShowNetworkGrid}
          toggleSnapNodesToGrid={toggleSnapNodesToGrid}
          toggleLockEntityMovement={toggleLockEntityMovement}
          onRegenerateLayout={onRegenerateLayout}
        />
        <NetworkSummaryViewMenu
          showFloatingInspectorPanel={showFloatingInspectorPanel}
          showNetworkInfoPanels={showNetworkInfoPanels}
          showSegmentLengths={showSegmentLengths}
          showSegmentDressings={showSegmentDressings}
          showCableCallouts={showCableCallouts}
          toggleShowFloatingInspectorPanel={toggleShowFloatingInspectorPanel}
          toggleShowNetworkInfoPanels={toggleShowNetworkInfoPanels}
          toggleShowSegmentLengths={toggleShowSegmentLengths}
          toggleShowSegmentDressings={toggleShowSegmentDressings}
          toggleShowCableCallouts={toggleShowCableCallouts}
        />
        {onOpenCurrentNetworkFunctional === undefined ? null : (
          <NetworkSummaryFunctionalMenu
            onOpenHarnessAssembly={onOpenCurrentNetworkFunctional}
            onOpenAnalysis={onOpenMultiNetworkFunctionalAnalysis}
          />
        )}
        <NetworkSummaryExportMenu
          canExportSvg={canExportSvg}
          canExportPng={canExportPng}
          canExportPdf={canExportPdf}
          canExportNetwork={canExportNetwork}
          canExportBomCsv={canExportBomCsv}
          onExportSvg={onExportSvg}
          onExportPng={onExportPng}
          onExportPdf={onExportPdf}
          onExportNetwork={onExportNetwork}
          onExportBomCsv={onExportBomCsv}
        />
      </div>
    </header>
  );
}
