import type { ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  activeNetworkLabel: string;
  hasActiveNetwork: boolean;
}

export function NetworkScopeWorkspaceContent({
  networks,
  activeNetworkLabel,
  hasActiveNetwork
}: NetworkScopeWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
      <section className="panel">
        <h2>Network Scope</h2>
        <p className="meta-line">
          Active network: <strong>{activeNetworkLabel}</strong>
        </p>
        <p className="meta-line">
          Available networks: <strong>{networks.length}</strong>
        </p>
        {!hasActiveNetwork ? (
          <p className="empty-copy">
            No active network is currently selected. Use network controls to create or select one.
          </p>
        ) : (
          <p className="empty-copy">
            Network lifecycle actions and global settings are available from this workspace in upcoming waves.
          </p>
        )}
      </section>
    </section>
  );
}
