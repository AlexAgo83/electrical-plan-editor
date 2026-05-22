import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import type {
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  InterHarnessConnectorLink,
  InterHarnessConnectorLinkId,
  Network,
  NetworkId
} from "../../../core/entities";
import { resolveDefaultHarnessColor } from "../../../core/harnessAssembly";
import { createEntityId } from "../../lib/app-utils-shared";

interface HarnessAssemblyManagerPanelProps {
  assemblies: HarnessAssembly[];
  networks: Network[];
  connectorsByNetworkId: ReadonlyMap<NetworkId, readonly Connector[]>;
  selectedAssemblyId: HarnessAssemblyId | "new" | "";
  canExportAgentJson?: boolean;
  onExportAgentJson?: () => void;
  onOpenOnboardingHelp?: () => void;
  onSelectedAssemblyIdChange: (assemblyId: HarnessAssemblyId | "new" | "") => void;
  onUpsertAssembly: (assembly: HarnessAssembly) => void;
  onRemoveAssembly: (assemblyId: HarnessAssemblyId) => void;
}

function makeRootKey(networkId: NetworkId, connectorId: ConnectorId): string {
  return `${networkId}:${connectorId}`;
}

function getInitialAssemblyName(network: Network | undefined): string {
  return network === undefined ? "Harness assembly" : `${network.name} assembly`;
}

function getInitialAssemblyTechnicalId(network: Network | undefined): string {
  return network === undefined ? "HARNESS-ASSEMBLY" : `${network.technicalId}-ASSEMBLY`;
}

export function HarnessAssemblyManagerPanel({
  assemblies,
  networks,
  connectorsByNetworkId,
  selectedAssemblyId,
  canExportAgentJson = false,
  onExportAgentJson,
  onOpenOnboardingHelp,
  onSelectedAssemblyIdChange,
  onUpsertAssembly,
  onRemoveAssembly
}: HarnessAssemblyManagerPanelProps): ReactElement {
  const selectedAssembly = selectedAssemblyId === "new" ? null : assemblies.find((assembly) => assembly.id === selectedAssemblyId) ?? null;
  const [name, setName] = useState(getInitialAssemblyName(undefined));
  const [technicalId, setTechnicalId] = useState(getInitialAssemblyTechnicalId(undefined));
  const [memberNetworkIds, setMemberNetworkIds] = useState<Set<NetworkId>>(() => new Set());
  const [memberColors, setMemberColors] = useState<Partial<Record<NetworkId, string>>>({});
  const [rootKeys, setRootKeys] = useState<Set<string>>(() => new Set());
  const [connectorLinks, setConnectorLinks] = useState<InterHarnessConnectorLink[]>([]);
  const [linkName, setLinkName] = useState("");
  const [sourceNetworkId, setSourceNetworkId] = useState<NetworkId | "">("");
  const [sourceConnectorId, setSourceConnectorId] = useState<ConnectorId | "">("");
  const [targetNetworkId, setTargetNetworkId] = useState<NetworkId | "">("");
  const [targetConnectorId, setTargetConnectorId] = useState<ConnectorId | "">("");
  const hasEmptyAssemblySelection = selectedAssemblyId === "";

  useEffect(() => {
    if (selectedAssembly === null) {
      setName(getInitialAssemblyName(undefined));
      setTechnicalId(getInitialAssemblyTechnicalId(undefined));
      setMemberNetworkIds(new Set());
      setMemberColors({});
      setRootKeys(new Set());
      setConnectorLinks([]);
      return;
    }

    setName(selectedAssembly.name);
    setTechnicalId(selectedAssembly.technicalId);
    setMemberNetworkIds(new Set(selectedAssembly.members.map((member) => member.networkId)));
    setMemberColors(Object.fromEntries(selectedAssembly.members.map((member) => [member.networkId, member.color])));
    setRootKeys(new Set(selectedAssembly.masterConnectorRefs.map((root) => makeRootKey(root.networkId, root.connectorId))));
    setConnectorLinks(selectedAssembly.connectorLinks);
  }, [selectedAssembly]);

  const selectedMemberNetworks = networks.filter((network) => memberNetworkIds.has(network.id));
  const sourceConnectors = sourceNetworkId === "" ? [] : connectorsByNetworkId.get(sourceNetworkId) ?? [];
  const targetConnectors = targetNetworkId === "" ? [] : connectorsByNetworkId.get(targetNetworkId) ?? [];
  const canAddLink =
    selectedAssembly !== null &&
    sourceNetworkId !== "" &&
    sourceConnectorId !== "" &&
    targetNetworkId !== "" &&
    targetConnectorId !== "" &&
    sourceNetworkId !== targetNetworkId;

  const persistedDraftSignature = useMemo(() => {
    if (selectedAssembly === null) {
      return "";
    }
    return JSON.stringify({
      name: selectedAssembly.name,
      technicalId: selectedAssembly.technicalId,
      members: selectedAssembly.members
        .map((member) => ({ networkId: member.networkId, color: member.color }))
        .sort((left, right) => String(left.networkId).localeCompare(String(right.networkId))),
      roots: selectedAssembly.masterConnectorRefs
        .map((root) => makeRootKey(root.networkId, root.connectorId))
        .sort(),
      connectorLinks: selectedAssembly.connectorLinks
        .map((link) => ({
          id: link.id,
          name: link.name ?? "",
          sourceNetworkId: link.sourceNetworkId,
          sourceConnectorId: link.sourceConnectorId,
          targetNetworkId: link.targetNetworkId,
          targetConnectorId: link.targetConnectorId
        }))
        .sort((left, right) => String(left.id).localeCompare(String(right.id)))
    });
  }, [selectedAssembly]);

  const currentDraftSignature = useMemo(() => {
    if (selectedAssembly === null) {
      return "";
    }
    return JSON.stringify({
      name,
      technicalId,
      members: networks
        .filter((network) => memberNetworkIds.has(network.id))
        .map((network, index) => ({
          networkId: network.id,
          color: memberColors[network.id] ?? resolveDefaultHarnessColor(index)
        }))
        .sort((left, right) => String(left.networkId).localeCompare(String(right.networkId))),
      roots: [...rootKeys].sort(),
      connectorLinks: connectorLinks
        .filter((link) => memberNetworkIds.has(link.sourceNetworkId) && memberNetworkIds.has(link.targetNetworkId))
        .map((link) => ({
          id: link.id,
          name: link.name ?? "",
          sourceNetworkId: link.sourceNetworkId,
          sourceConnectorId: link.sourceConnectorId,
          targetNetworkId: link.targetNetworkId,
          targetConnectorId: link.targetConnectorId
        }))
        .sort((left, right) => String(left.id).localeCompare(String(right.id)))
    });
  }, [connectorLinks, memberColors, memberNetworkIds, name, networks, rootKeys, selectedAssembly, technicalId]);

  const hasUnsavedVisualizationChanges = selectedAssembly !== null && persistedDraftSignature !== currentDraftSignature;

  const buildDraftAssembly = (): HarnessAssembly => {
    const now = new Date().toISOString();
    const members = networks
      .filter((network) => memberNetworkIds.has(network.id))
      .map((network, index) => ({
        networkId: network.id,
        color: memberColors[network.id] ?? resolveDefaultHarnessColor(index)
      }));
    const masterConnectorRefs = selectedMemberNetworks.flatMap((network) =>
      (connectorsByNetworkId.get(network.id) ?? [])
        .filter((connector) => rootKeys.has(makeRootKey(network.id, connector.id)))
        .map((connector) => ({ networkId: network.id, connectorId: connector.id }))
    );

    return {
      id: selectedAssembly?.id ?? (createEntityId("assembly") as HarnessAssemblyId),
      name,
      technicalId,
      members,
      masterConnectorRefs,
      connectorLinks: connectorLinks.filter(
        (link) => memberNetworkIds.has(link.sourceNetworkId) && memberNetworkIds.has(link.targetNetworkId)
      ),
      createdAt: selectedAssembly?.createdAt ?? now,
      updatedAt: now
    };
  };

  const saveDraftAssembly = (): void => {
    const draftAssembly = buildDraftAssembly();
    onUpsertAssembly(draftAssembly);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveDraftAssembly();
  };

  const handleAddLink = () => {
    if (!canAddLink || selectedAssembly === null) {
      return;
    }
    const nextLink = {
      id: createEntityId("interconnect") as InterHarnessConnectorLinkId,
      name: linkName.trim().length === 0 ? undefined : linkName.trim(),
      sourceNetworkId,
      sourceConnectorId,
      targetNetworkId,
      targetConnectorId
    };
    setConnectorLinks((current) => [...current, nextLink]);
    setLinkName("");
  };

  const handleRemoveLink = (linkId: InterHarnessConnectorLinkId) => {
    setConnectorLinks((current) => current.filter((link) => link.id !== linkId));
  };

  const handleUpdateLinkName = (linkId: InterHarnessConnectorLinkId, nextName: string) => {
    const trimmedName = nextName.trim();
    setConnectorLinks((current) =>
      current.map((link) =>
        link.id === linkId
          ? {
              ...link,
              name: trimmedName.length === 0 ? undefined : trimmedName
            }
          : link
      )
    );
  };

  const describeConnector = (networkId: NetworkId, connectorId: ConnectorId): string => {
    const connector = connectorsByNetworkId.get(networkId)?.find((candidate) => candidate.id === connectorId);
    return connector === undefined ? String(connectorId) : `${connector.technicalId} - ${connector.name}`;
  };

  function renderSaveAssemblyButton(): ReactElement {
    return (
      <button type="button" className="button-with-icon" onClick={saveDraftAssembly}>
        <span className="action-button-icon is-save" aria-hidden="true" />
        Save assembly
      </button>
    );
  }

  return (
    <>
      <section className="panel harness-assembly-manager-panel" aria-label="Harness assembly manager">
        <header className="network-summary-header">
          <div>
            <h2>Harness assembly</h2>
            <p className="functional-schematic-subtitle">Group networks, choose trace roots, and define physical interconnector links.</p>
          </div>
          {onOpenOnboardingHelp === undefined ? null : (
            <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenOnboardingHelp}>
              <span className="action-button-icon is-help" aria-hidden="true" />
              <span>Help</span>
            </button>
          )}
        </header>

        {hasEmptyAssemblySelection ? (
          <p className="empty-copy">Select an existing harness assembly or choose New assembly to start editing.</p>
        ) : (
          <form className="harness-assembly-grid" onSubmit={handleSubmit}>
            <label className="stack-label">
              <span className="network-form-label">Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Front cabin assembly" />
            </label>
            <label className="stack-label">
              <span className="network-form-label">Technical ID</span>
              <input value={technicalId} onChange={(event) => setTechnicalId(event.target.value)} placeholder="ASM-FRONT-CABIN" />
            </label>

            <div className="harness-assembly-list" aria-label="Harness members">
              {networks.map((network, index) => {
                const checked = memberNetworkIds.has(network.id);
                return (
                  <label key={network.id} className="harness-assembly-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        setMemberNetworkIds((current) => {
                          const next = new Set(current);
                          if (event.target.checked) {
                            next.add(network.id);
                          } else {
                            next.delete(network.id);
                          }
                          return next;
                        });
                      }}
                    />
                    <span>{network.name}</span>
                    <span className="technical-id">{network.technicalId}</span>
                    <input
                      type="color"
                      value={memberColors[network.id] ?? resolveDefaultHarnessColor(index)}
                      onChange={(event) => setMemberColors((current) => ({ ...current, [network.id]: event.target.value }))}
                      aria-label={`${network.name} harness color`}
                      disabled={!checked}
                    />
                  </label>
                );
              })}
            </div>

            <div className="row-actions compact">
              <button type="button" className="button-with-icon" onClick={() => onSelectedAssemblyIdChange("new")}>
                <span className="action-button-icon is-new" aria-hidden="true" />
                New assembly
              </button>
              <button type="submit" className="button-with-icon">
                <span className="action-button-icon is-save" aria-hidden="true" />
                Save assembly
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={onExportAgentJson}
                disabled={!canExportAgentJson}
                title={canExportAgentJson ? "Export selected harness agent JSON" : "Select a saved harness assembly to export agent JSON"}
              >
                <span className="action-button-icon is-open" aria-hidden="true" />
                Agent JSON
              </button>
              {selectedAssembly !== null ? (
                <button type="button" className="network-delete-button button-with-icon" onClick={() => onRemoveAssembly(selectedAssembly.id)}>
                  <span className="action-button-icon is-delete" aria-hidden="true" />
                  Delete
                </button>
              ) : null}
            </div>
            {hasUnsavedVisualizationChanges ? (
              <p className="form-hint warning" role="status">
                Unsaved assembly edits are not reflected in the visualization yet. Save assembly to update the graph.
              </p>
            ) : null}
          </form>
        )}
      </section>

      {selectedAssembly !== null ? (
        <>
          <section className="panel harness-assembly-manager-panel" aria-label="Master connector roots">
            <header className="network-summary-header">
              <div>
                <h2>Master connectors</h2>
                <p className="functional-schematic-subtitle">Choose the connector roots used to generate the assembly functional graph.</p>
              </div>
            </header>
            <div className="harness-assembly-list">
              {selectedMemberNetworks.flatMap((network) =>
                (connectorsByNetworkId.get(network.id) ?? [])
                  .filter((connector) => connector.isMainHarnessConnector === true)
                  .map((connector) => {
                    const key = makeRootKey(network.id, connector.id);
                    return (
                      <label key={key} className="harness-assembly-row">
                        <input
                          type="checkbox"
                          checked={rootKeys.has(key)}
                          onChange={(event) => {
                            setRootKeys((current) => {
                              const next = new Set(current);
                              if (event.target.checked) {
                                next.add(key);
                              } else {
                                next.delete(key);
                              }
                              return next;
                            });
                          }}
                        />
                        <span>{connector.name}</span>
                        <span className="technical-id">{network.technicalId} / {connector.technicalId}</span>
                      </label>
                    );
                  })
              )}
            </div>
            <div className="row-actions compact">
              {renderSaveAssemblyButton()}
            </div>
            {hasUnsavedVisualizationChanges ? (
              <p className="form-hint warning" role="status">
                Unsaved assembly edits are not reflected in the visualization yet. Save assembly to update the graph.
              </p>
            ) : null}
          </section>

          <section className="panel harness-assembly-manager-panel" aria-label="Inter-harness connector links">
            <header className="network-summary-header">
              <div>
                <h2>Interconnector links</h2>
                <p className="functional-schematic-subtitle">Define physical links between connectors from different harnesses.</p>
              </div>
            </header>
            <div className="harness-assembly-link-form">
              <input value={linkName} onChange={(event) => setLinkName(event.target.value)} placeholder="Link name" />
              <select value={sourceNetworkId} onChange={(event) => {
                setSourceNetworkId(event.target.value as NetworkId | "");
                setSourceConnectorId("");
              }}>
                <option value="">Source harness</option>
                {selectedMemberNetworks.map((network) => <option key={network.id} value={network.id}>{network.technicalId}</option>)}
              </select>
              <select value={sourceConnectorId} onChange={(event) => setSourceConnectorId(event.target.value as ConnectorId | "")}>
                <option value="">Source connector</option>
                {sourceConnectors.map((connector) => <option key={connector.id} value={connector.id}>{connector.technicalId}</option>)}
              </select>
              <select value={targetNetworkId} onChange={(event) => {
                setTargetNetworkId(event.target.value as NetworkId | "");
                setTargetConnectorId("");
              }}>
                <option value="">Target harness</option>
                {selectedMemberNetworks.map((network) => <option key={network.id} value={network.id}>{network.technicalId}</option>)}
              </select>
              <select value={targetConnectorId} onChange={(event) => setTargetConnectorId(event.target.value as ConnectorId | "")}>
                <option value="">Target connector</option>
                {targetConnectors.map((connector) => <option key={connector.id} value={connector.id}>{connector.technicalId}</option>)}
              </select>
              <button type="button" className="network-scope-create-button button-with-icon" onClick={handleAddLink} disabled={!canAddLink}>
                <span className="action-button-icon is-new" aria-hidden="true" />
                Add link
              </button>
            </div>
            {connectorLinks.length === 0 ? (
              <p className="empty-copy">No interconnector link defined for this assembly.</p>
            ) : (
              <ul className="harness-assembly-links">
                {connectorLinks.map((link) => (
                  <li key={link.id}>
                    <input
                      value={link.name ?? ""}
                      onChange={(event) => handleUpdateLinkName(link.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                      placeholder="Interconnector"
                      aria-label="Interconnector link name"
                    />
                    <span className="technical-id">
                      {describeConnector(link.sourceNetworkId, link.sourceConnectorId)} {"->"} {describeConnector(link.targetNetworkId, link.targetConnectorId)}
                    </span>
                    <button type="button" className="network-delete-button button-with-icon" onClick={() => handleRemoveLink(link.id)}>
                      <span className="action-button-icon is-delete" aria-hidden="true" />
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="row-actions compact">
              {renderSaveAssemblyButton()}
            </div>
            {hasUnsavedVisualizationChanges ? (
              <p className="form-hint warning" role="status">
                Unsaved assembly edits are not reflected in the visualization yet. Save assembly to update the graph.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </>
  );
}
