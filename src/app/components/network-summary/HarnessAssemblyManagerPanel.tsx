import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import type {
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
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
  activeNetworkId: NetworkId | null;
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
  activeNetworkId,
  onUpsertAssembly,
  onRemoveAssembly
}: HarnessAssemblyManagerPanelProps): ReactElement {
  const activeNetwork = activeNetworkId === null ? undefined : networks.find((network) => network.id === activeNetworkId);
  const defaultAssembly = useMemo(
    () => assemblies.find((assembly) => assembly.members.some((member) => member.networkId === activeNetworkId)) ?? assemblies[0] ?? null,
    [activeNetworkId, assemblies]
  );
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<HarnessAssemblyId | "new">(defaultAssembly?.id ?? "new");
  const selectedAssembly = selectedAssemblyId === "new" ? null : assemblies.find((assembly) => assembly.id === selectedAssemblyId) ?? null;
  const [name, setName] = useState(getInitialAssemblyName(activeNetwork));
  const [technicalId, setTechnicalId] = useState(getInitialAssemblyTechnicalId(activeNetwork));
  const [memberNetworkIds, setMemberNetworkIds] = useState<Set<NetworkId>>(
    () => new Set(activeNetworkId === null ? [] : [activeNetworkId])
  );
  const [memberColors, setMemberColors] = useState<Partial<Record<NetworkId, string>>>({});
  const [rootKeys, setRootKeys] = useState<Set<string>>(() => new Set());
  const [linkName, setLinkName] = useState("");
  const [sourceNetworkId, setSourceNetworkId] = useState<NetworkId | "">("");
  const [sourceConnectorId, setSourceConnectorId] = useState<ConnectorId | "">("");
  const [targetNetworkId, setTargetNetworkId] = useState<NetworkId | "">("");
  const [targetConnectorId, setTargetConnectorId] = useState<ConnectorId | "">("");

  useEffect(() => {
    setSelectedAssemblyId(defaultAssembly?.id ?? "new");
  }, [defaultAssembly?.id]);

  useEffect(() => {
    if (selectedAssembly === null) {
      setName(getInitialAssemblyName(activeNetwork));
      setTechnicalId(getInitialAssemblyTechnicalId(activeNetwork));
      setMemberNetworkIds(new Set(activeNetworkId === null ? [] : [activeNetworkId]));
      setMemberColors({});
      setRootKeys(new Set());
      return;
    }

    setName(selectedAssembly.name);
    setTechnicalId(selectedAssembly.technicalId);
    setMemberNetworkIds(new Set(selectedAssembly.members.map((member) => member.networkId)));
    setMemberColors(Object.fromEntries(selectedAssembly.members.map((member) => [member.networkId, member.color])));
    setRootKeys(new Set(selectedAssembly.masterConnectorRefs.map((root) => makeRootKey(root.networkId, root.connectorId))));
  }, [activeNetwork, activeNetworkId, selectedAssembly]);

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
      connectorLinks: selectedAssembly?.connectorLinks.filter(
        (link) => memberNetworkIds.has(link.sourceNetworkId) && memberNetworkIds.has(link.targetNetworkId)
      ) ?? [],
      createdAt: selectedAssembly?.createdAt ?? now,
      updatedAt: now
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpsertAssembly(buildDraftAssembly());
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
    onUpsertAssembly({
      ...buildDraftAssembly(),
      connectorLinks: [...selectedAssembly.connectorLinks, nextLink],
      updatedAt: new Date().toISOString()
    });
    setLinkName("");
  };

  const handleRemoveLink = (linkId: InterHarnessConnectorLinkId) => {
    if (selectedAssembly === null) {
      return;
    }
    onUpsertAssembly({
      ...buildDraftAssembly(),
      connectorLinks: selectedAssembly.connectorLinks.filter((link) => link.id !== linkId),
      updatedAt: new Date().toISOString()
    });
  };

  const describeConnector = (networkId: NetworkId, connectorId: ConnectorId): string => {
    const connector = connectorsByNetworkId.get(networkId)?.find((candidate) => candidate.id === connectorId);
    return connector === undefined ? String(connectorId) : `${connector.technicalId} - ${connector.name}`;
  };

  return (
    <section className="panel harness-assembly-manager-panel" aria-label="Harness assembly manager">
      <header className="network-summary-header">
        <div>
          <h2>Harness assembly</h2>
          <p className="functional-schematic-subtitle">Group networks, choose trace roots, and define physical interconnector links.</p>
        </div>
        <select
          value={selectedAssemblyId}
          onChange={(event) => setSelectedAssemblyId(event.target.value as HarnessAssemblyId | "new")}
          aria-label="Selected harness assembly"
        >
          <option value="new">New assembly</option>
          {assemblies.map((assembly) => (
            <option key={assembly.id} value={assembly.id}>
              {assembly.name}
            </option>
          ))}
        </select>
      </header>

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
          <button type="submit" className="button-with-icon">
            <span className="action-button-icon is-save" aria-hidden="true" />
            Save assembly
          </button>
          {selectedAssembly !== null ? (
            <button type="button" className="network-delete-button button-with-icon" onClick={() => onRemoveAssembly(selectedAssembly.id)}>
              <span className="action-button-icon is-delete" aria-hidden="true" />
              Delete
            </button>
          ) : null}
        </div>
      </form>

      {selectedAssembly !== null ? (
        <>
          <section className="harness-assembly-subpanel" aria-label="Master connector roots">
            <h3>Master connectors</h3>
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
          </section>

          <section className="harness-assembly-subpanel" aria-label="Inter-harness connector links">
            <h3>Interconnector links</h3>
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
              <button type="button" className="button-with-icon" onClick={handleAddLink} disabled={!canAddLink}>
                <span className="action-button-icon is-new" aria-hidden="true" />
                Add link
              </button>
            </div>
            {selectedAssembly.connectorLinks.length === 0 ? (
              <p className="empty-copy">No interconnector link defined for this assembly.</p>
            ) : (
              <ul className="harness-assembly-links">
                {selectedAssembly.connectorLinks.map((link) => (
                  <li key={link.id}>
                    <span>{link.name ?? "Interconnector"}</span>
                    <span className="technical-id">
                      {describeConnector(link.sourceNetworkId, link.sourceConnectorId)} {"->"} {describeConnector(link.targetNetworkId, link.targetConnectorId)}
                    </span>
                    <button type="button" className="network-delete-button" onClick={() => handleRemoveLink(link.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
