import { type FormEvent, type ReactElement, useMemo, useState, useSyncExternalStore } from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId
} from "../core/entities";
import {
  appActions,
  selectConnectorById,
  selectConnectorCavityStatuses,
  selectConnectorTechnicalIdTaken,
  selectConnectors,
  selectLastError,
  selectNodeById,
  selectNodes,
  selectRoutingGraphIndex,
  selectSegmentById,
  selectSegments,
  selectSelection,
  selectSpliceById,
  selectSplicePortStatuses,
  selectSpliceTechnicalIdTaken,
  selectSplices,
  selectSubNetworkSummaries,
  selectWires
} from "../store";
import { appStore } from "./store";
import "./styles.css";

function useAppSnapshot() {
  return useSyncExternalStore(appStore.subscribe, appStore.getState, appStore.getState);
}

function createEntityId(prefix: string): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${randomPart}`;
}

function toPositiveInteger(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
}

function toPositiveNumber(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

export function App(): ReactElement {
  const state = useAppSnapshot();

  const connectors = selectConnectors(state);
  const splices = selectSplices(state);
  const nodes = selectNodes(state);
  const segments = selectSegments(state);
  const wires = selectWires(state);
  const routingGraph = selectRoutingGraphIndex(state);
  const subNetworkSummaries = selectSubNetworkSummaries(state);

  const connectorMap = useMemo(() => new Map(connectors.map((connector) => [connector.id, connector])), [connectors]);
  const spliceMap = useMemo(() => new Map(splices.map((splice) => [splice.id, splice])), [splices]);

  const [connectorFormMode, setConnectorFormMode] = useState<"create" | "edit">("create");
  const [editingConnectorId, setEditingConnectorId] = useState<ConnectorId | null>(null);
  const [connectorName, setConnectorName] = useState("");
  const [connectorTechnicalId, setConnectorTechnicalId] = useState("");
  const [cavityCount, setCavityCount] = useState("4");
  const [cavityIndexInput, setCavityIndexInput] = useState("1");
  const [connectorOccupantRefInput, setConnectorOccupantRefInput] = useState("manual-assignment");
  const [connectorFormError, setConnectorFormError] = useState<string | null>(null);

  const [spliceFormMode, setSpliceFormMode] = useState<"create" | "edit">("create");
  const [editingSpliceId, setEditingSpliceId] = useState<SpliceId | null>(null);
  const [spliceName, setSpliceName] = useState("");
  const [spliceTechnicalId, setSpliceTechnicalId] = useState("");
  const [portCount, setPortCount] = useState("4");
  const [portIndexInput, setPortIndexInput] = useState("1");
  const [spliceOccupantRefInput, setSpliceOccupantRefInput] = useState("manual-assignment");
  const [spliceFormError, setSpliceFormError] = useState<string | null>(null);

  const [nodeFormMode, setNodeFormMode] = useState<"create" | "edit">("create");
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);
  const [nodeKind, setNodeKind] = useState<NetworkNode["kind"]>("intermediate");
  const [nodeConnectorId, setNodeConnectorId] = useState("");
  const [nodeSpliceId, setNodeSpliceId] = useState("");
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeFormError, setNodeFormError] = useState<string | null>(null);

  const [segmentFormMode, setSegmentFormMode] = useState<"create" | "edit">("create");
  const [editingSegmentId, setEditingSegmentId] = useState<SegmentId | null>(null);
  const [segmentNodeA, setSegmentNodeA] = useState("");
  const [segmentNodeB, setSegmentNodeB] = useState("");
  const [segmentLengthMm, setSegmentLengthMm] = useState("120");
  const [segmentSubNetworkTag, setSegmentSubNetworkTag] = useState("");
  const [segmentFormError, setSegmentFormError] = useState<string | null>(null);

  const selected = selectSelection(state);
  const selectedConnectorId = selected?.kind === "connector" ? (selected.id as ConnectorId) : null;
  const selectedSpliceId = selected?.kind === "splice" ? (selected.id as SpliceId) : null;
  const selectedNodeId = selected?.kind === "node" ? (selected.id as NodeId) : null;
  const selectedSegmentId = selected?.kind === "segment" ? (selected.id as SegmentId) : null;

  const selectedConnector =
    selectedConnectorId === null ? null : (selectConnectorById(state, selectedConnectorId) ?? null);
  const selectedSplice = selectedSpliceId === null ? null : (selectSpliceById(state, selectedSpliceId) ?? null);
  const selectedNode = selectedNodeId === null ? null : (selectNodeById(state, selectedNodeId) ?? null);
  const selectedSegment = selectedSegmentId === null ? null : (selectSegmentById(state, selectedSegmentId) ?? null);

  const connectorCavityStatuses = useMemo(() => {
    if (selectedConnectorId === null) {
      return [];
    }

    return selectConnectorCavityStatuses(state, selectedConnectorId);
  }, [state, selectedConnectorId]);

  const splicePortStatuses = useMemo(() => {
    if (selectedSpliceId === null) {
      return [];
    }

    return selectSplicePortStatuses(state, selectedSpliceId);
  }, [state, selectedSpliceId]);

  const connectorIdExcludedFromUniqueness =
    connectorFormMode === "edit" ? editingConnectorId ?? undefined : undefined;
  const connectorTechnicalIdAlreadyUsed =
    connectorTechnicalId.trim().length > 0 &&
    selectConnectorTechnicalIdTaken(state, connectorTechnicalId.trim(), connectorIdExcludedFromUniqueness);

  const spliceIdExcludedFromUniqueness = spliceFormMode === "edit" ? editingSpliceId ?? undefined : undefined;
  const spliceTechnicalIdAlreadyUsed =
    spliceTechnicalId.trim().length > 0 &&
    selectSpliceTechnicalIdTaken(state, spliceTechnicalId.trim(), spliceIdExcludedFromUniqueness);

  const totalEdgeEntries = routingGraph.nodeIds.reduce(
    (sum, nodeId) => sum + (routingGraph.edgesByNodeId[nodeId]?.length ?? 0),
    0
  );

  const lastError = selectLastError(state);

  function describeNode(node: NetworkNode): string {
    if (node.kind === "intermediate") {
      return `Intermediate: ${node.label}`;
    }

    if (node.kind === "connector") {
      const connector = connectorMap.get(node.connectorId);
      return connector === undefined
        ? `Connector node (${node.connectorId})`
        : `Connector: ${connector.name} (${connector.technicalId})`;
    }

    const splice = spliceMap.get(node.spliceId);
    return splice === undefined ? `Splice node (${node.spliceId})` : `Splice: ${splice.name} (${splice.technicalId})`;
  }

  function resetConnectorForm(): void {
    setConnectorFormMode("create");
    setEditingConnectorId(null);
    setConnectorName("");
    setConnectorTechnicalId("");
    setCavityCount("4");
    setConnectorFormError(null);
  }

  function startConnectorEdit(connector: Connector): void {
    setConnectorFormMode("edit");
    setEditingConnectorId(connector.id);
    setConnectorName(connector.name);
    setConnectorTechnicalId(connector.technicalId);
    setCavityCount(String(connector.cavityCount));
    appStore.dispatch(appActions.select({ kind: "connector", id: connector.id }));
  }

  function handleConnectorSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = connectorName.trim();
    const trimmedTechnicalId = connectorTechnicalId.trim();
    const normalizedCavityCount = toPositiveInteger(cavityCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedCavityCount < 1) {
      setConnectorFormError("All fields are required and cavity count must be >= 1.");
      return;
    }
    setConnectorFormError(null);

    const connectorId =
      connectorFormMode === "edit" && editingConnectorId !== null
        ? editingConnectorId
        : (createEntityId("conn") as ConnectorId);

    appStore.dispatch(
      appActions.upsertConnector({
        id: connectorId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        cavityCount: normalizedCavityCount
      })
    );

    const nextState = appStore.getState();
    if (nextState.connectors.byId[connectorId] !== undefined) {
      appStore.dispatch(appActions.select({ kind: "connector", id: connectorId }));
      resetConnectorForm();
    }
  }

  function handleConnectorDelete(connectorId: ConnectorId): void {
    appStore.dispatch(appActions.removeConnector(connectorId));

    if (editingConnectorId === connectorId) {
      resetConnectorForm();
    }
  }

  function handleReserveCavity(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedConnectorId === null) {
      return;
    }

    const cavityIndex = toPositiveInteger(cavityIndexInput);
    appStore.dispatch(appActions.occupyConnectorCavity(selectedConnectorId, cavityIndex, connectorOccupantRefInput));
  }

  function handleReleaseCavity(cavityIndex: number): void {
    if (selectedConnectorId === null) {
      return;
    }

    appStore.dispatch(appActions.releaseConnectorCavity(selectedConnectorId, cavityIndex));
  }

  function resetSpliceForm(): void {
    setSpliceFormMode("create");
    setEditingSpliceId(null);
    setSpliceName("");
    setSpliceTechnicalId("");
    setPortCount("4");
    setSpliceFormError(null);
  }

  function startSpliceEdit(splice: Splice): void {
    setSpliceFormMode("edit");
    setEditingSpliceId(splice.id);
    setSpliceName(splice.name);
    setSpliceTechnicalId(splice.technicalId);
    setPortCount(String(splice.portCount));
    appStore.dispatch(appActions.select({ kind: "splice", id: splice.id }));
  }

  function handleSpliceSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = spliceName.trim();
    const trimmedTechnicalId = spliceTechnicalId.trim();
    const normalizedPortCount = toPositiveInteger(portCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedPortCount < 1) {
      setSpliceFormError("All fields are required and port count must be >= 1.");
      return;
    }
    setSpliceFormError(null);

    const spliceId =
      spliceFormMode === "edit" && editingSpliceId !== null
        ? editingSpliceId
        : (createEntityId("splice") as SpliceId);

    appStore.dispatch(
      appActions.upsertSplice({
        id: spliceId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        portCount: normalizedPortCount
      })
    );

    const nextState = appStore.getState();
    if (nextState.splices.byId[spliceId] !== undefined) {
      appStore.dispatch(appActions.select({ kind: "splice", id: spliceId }));
      resetSpliceForm();
    }
  }

  function handleSpliceDelete(spliceId: SpliceId): void {
    appStore.dispatch(appActions.removeSplice(spliceId));

    if (editingSpliceId === spliceId) {
      resetSpliceForm();
    }
  }

  function handleReservePort(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedSpliceId === null) {
      return;
    }

    const portIndex = toPositiveInteger(portIndexInput);
    appStore.dispatch(appActions.occupySplicePort(selectedSpliceId, portIndex, spliceOccupantRefInput));
  }

  function handleReleasePort(portIndex: number): void {
    if (selectedSpliceId === null) {
      return;
    }

    appStore.dispatch(appActions.releaseSplicePort(selectedSpliceId, portIndex));
  }

  function resetNodeForm(): void {
    setNodeFormMode("create");
    setEditingNodeId(null);
    setNodeKind("intermediate");
    setNodeConnectorId("");
    setNodeSpliceId("");
    setNodeLabel("");
    setNodeFormError(null);
  }

  function startNodeEdit(node: NetworkNode): void {
    setNodeFormMode("edit");
    setEditingNodeId(node.id);
    setNodeKind(node.kind);
    setNodeLabel(node.kind === "intermediate" ? node.label : "");
    setNodeConnectorId(node.kind === "connector" ? node.connectorId : "");
    setNodeSpliceId(node.kind === "splice" ? node.spliceId : "");
    appStore.dispatch(appActions.select({ kind: "node", id: node.id }));
  }

  function handleNodeSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const nodeId =
      nodeFormMode === "edit" && editingNodeId !== null ? editingNodeId : (createEntityId("node") as NodeId);

    if (nodeKind === "intermediate") {
      const trimmedLabel = nodeLabel.trim();
      if (trimmedLabel.length === 0) {
        setNodeFormError("Intermediate node label is required.");
        return;
      }

      setNodeFormError(null);
      appStore.dispatch(appActions.upsertNode({ id: nodeId, kind: "intermediate", label: trimmedLabel }));
    }

    if (nodeKind === "connector") {
      if (nodeConnectorId.length === 0) {
        setNodeFormError("Select a connector to create a connector node.");
        return;
      }

      setNodeFormError(null);
      appStore.dispatch(
        appActions.upsertNode({
          id: nodeId,
          kind: "connector",
          connectorId: nodeConnectorId as ConnectorId
        })
      );
    }

    if (nodeKind === "splice") {
      if (nodeSpliceId.length === 0) {
        setNodeFormError("Select a splice to create a splice node.");
        return;
      }

      setNodeFormError(null);
      appStore.dispatch(
        appActions.upsertNode({
          id: nodeId,
          kind: "splice",
          spliceId: nodeSpliceId as SpliceId
        })
      );
    }

    const nextState = appStore.getState();
    if (nextState.nodes.byId[nodeId] !== undefined) {
      appStore.dispatch(appActions.select({ kind: "node", id: nodeId }));
      resetNodeForm();
    }
  }

  function handleNodeDelete(nodeId: NodeId): void {
    appStore.dispatch(appActions.removeNode(nodeId));

    if (editingNodeId === nodeId) {
      resetNodeForm();
    }
  }

  function resetSegmentForm(): void {
    setSegmentFormMode("create");
    setEditingSegmentId(null);
    setSegmentNodeA("");
    setSegmentNodeB("");
    setSegmentLengthMm("120");
    setSegmentSubNetworkTag("");
    setSegmentFormError(null);
  }

  function startSegmentEdit(segment: Segment): void {
    setSegmentFormMode("edit");
    setEditingSegmentId(segment.id);
    setSegmentNodeA(segment.nodeA);
    setSegmentNodeB(segment.nodeB);
    setSegmentLengthMm(String(segment.lengthMm));
    setSegmentSubNetworkTag(segment.subNetworkTag ?? "");
    appStore.dispatch(appActions.select({ kind: "segment", id: segment.id }));
  }

  function handleSegmentSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (segmentNodeA.length === 0 || segmentNodeB.length === 0) {
      setSegmentFormError("Both segment endpoints are required.");
      return;
    }

    const lengthMm = toPositiveNumber(segmentLengthMm);
    if (lengthMm <= 0) {
      setSegmentFormError("Segment length must be > 0.");
      return;
    }

    setSegmentFormError(null);

    const segmentId =
      segmentFormMode === "edit" && editingSegmentId !== null
        ? editingSegmentId
        : (createEntityId("segment") as SegmentId);

    appStore.dispatch(
      appActions.upsertSegment({
        id: segmentId,
        nodeA: segmentNodeA as NodeId,
        nodeB: segmentNodeB as NodeId,
        lengthMm,
        subNetworkTag: segmentSubNetworkTag
      })
    );

    const nextState = appStore.getState();
    if (nextState.segments.byId[segmentId] !== undefined) {
      appStore.dispatch(appActions.select({ kind: "segment", id: segmentId }));
      resetSegmentForm();
    }
  }

  function handleSegmentDelete(segmentId: SegmentId): void {
    appStore.dispatch(appActions.removeSegment(segmentId));

    if (editingSegmentId === segmentId) {
      resetSegmentForm();
    }
  }

  return (
    <main className="app-shell">
      <section className="header-block">
        <h1>Electrical Plan Editor</h1>
        <p>Wave 1 in progress: connectors, splices, nodes, segments, and sub-network grouping are active.</p>
      </section>

      {lastError !== null ? (
        <section className="error-banner" role="alert">
          <p>{lastError}</p>
          <button type="button" onClick={() => appStore.dispatch(appActions.clearError())}>
            Clear
          </button>
        </section>
      ) : null}

      <section className="stats-grid" aria-label="Entity counters">
        <article>
          <h2>Connectors</h2>
          <p>{connectors.length}</p>
        </article>
        <article>
          <h2>Splices</h2>
          <p>{splices.length}</p>
        </article>
        <article>
          <h2>Nodes</h2>
          <p>{nodes.length}</p>
        </article>
        <article>
          <h2>Segments</h2>
          <p>{segments.length}</p>
        </article>
        <article>
          <h2>Wires</h2>
          <p>{wires.length}</p>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>{connectorFormMode === "create" ? "Create Connector" : "Edit Connector"}</h2>
          <form className="stack-form" onSubmit={handleConnectorSubmit}>
            <label>
              Functional name
              <input
                value={connectorName}
                onChange={(event) => setConnectorName(event.target.value)}
                placeholder="Rear body connector"
                required
              />
            </label>

            <label>
              Technical ID
              <input
                value={connectorTechnicalId}
                onChange={(event) => setConnectorTechnicalId(event.target.value)}
                placeholder="C-001"
                required
              />
            </label>
            {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}

            <label>
              Cavity count
              <input
                type="number"
                min={1}
                step={1}
                value={cavityCount}
                onChange={(event) => setCavityCount(event.target.value)}
                required
              />
            </label>

            <div className="row-actions">
              <button type="submit" disabled={connectorTechnicalIdAlreadyUsed}>
                {connectorFormMode === "create" ? "Create" : "Save"}
              </button>
              {connectorFormMode === "edit" ? (
                <button type="button" onClick={resetConnectorForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {connectorFormError !== null ? <small className="inline-error">{connectorFormError}</small> : null}
          </form>
        </article>

        <article className="panel">
          <h2>{spliceFormMode === "create" ? "Create Splice" : "Edit Splice"}</h2>
          <form className="stack-form" onSubmit={handleSpliceSubmit}>
            <label>
              Functional name
              <input
                value={spliceName}
                onChange={(event) => setSpliceName(event.target.value)}
                placeholder="Cabin junction"
                required
              />
            </label>

            <label>
              Technical ID
              <input
                value={spliceTechnicalId}
                onChange={(event) => setSpliceTechnicalId(event.target.value)}
                placeholder="S-001"
                required
              />
            </label>
            {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}

            <label>
              Port count
              <input
                type="number"
                min={1}
                step={1}
                value={portCount}
                onChange={(event) => setPortCount(event.target.value)}
                required
              />
            </label>

            <div className="row-actions">
              <button type="submit" disabled={spliceTechnicalIdAlreadyUsed}>
                {spliceFormMode === "create" ? "Create" : "Save"}
              </button>
              {spliceFormMode === "edit" ? (
                <button type="button" onClick={resetSpliceForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
          </form>
        </article>

        <article className="panel">
          <h2>{nodeFormMode === "create" ? "Create Node" : "Edit Node"}</h2>
          <form className="stack-form" onSubmit={handleNodeSubmit}>
            <label>
              Node kind
              <select value={nodeKind} onChange={(event) => setNodeKind(event.target.value as NetworkNode["kind"])}>
                <option value="intermediate">Intermediate</option>
                <option value="connector">Connector node</option>
                <option value="splice">Splice node</option>
              </select>
            </label>

            {nodeKind === "intermediate" ? (
              <label>
                Label
                <input
                  value={nodeLabel}
                  onChange={(event) => setNodeLabel(event.target.value)}
                  placeholder="N-branch-01"
                  required
                />
              </label>
            ) : null}

            {nodeKind === "connector" ? (
              <label>
                Connector
                <select value={nodeConnectorId} onChange={(event) => setNodeConnectorId(event.target.value)} required>
                  <option value="">Select connector</option>
                  {connectors.map((connector) => (
                    <option key={connector.id} value={connector.id}>
                      {connector.name} ({connector.technicalId})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {nodeKind === "splice" ? (
              <label>
                Splice
                <select value={nodeSpliceId} onChange={(event) => setNodeSpliceId(event.target.value)} required>
                  <option value="">Select splice</option>
                  {splices.map((splice) => (
                    <option key={splice.id} value={splice.id}>
                      {splice.name} ({splice.technicalId})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="row-actions">
              <button type="submit">{nodeFormMode === "create" ? "Create" : "Save"}</button>
              {nodeFormMode === "edit" ? (
                <button type="button" onClick={resetNodeForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {nodeFormError !== null ? <small className="inline-error">{nodeFormError}</small> : null}
          </form>
        </article>

        <article className="panel">
          <h2>{segmentFormMode === "create" ? "Create Segment" : "Edit Segment"}</h2>
          <form className="stack-form" onSubmit={handleSegmentSubmit}>
            <label>
              Node A
              <select value={segmentNodeA} onChange={(event) => setSegmentNodeA(event.target.value)} required>
                <option value="">Select node</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {describeNode(node)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Node B
              <select value={segmentNodeB} onChange={(event) => setSegmentNodeB(event.target.value)} required>
                <option value="">Select node</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {describeNode(node)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Length (mm)
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={segmentLengthMm}
                onChange={(event) => setSegmentLengthMm(event.target.value)}
                required
              />
            </label>

            <label>
              Sub-network tag
              <input
                value={segmentSubNetworkTag}
                onChange={(event) => setSegmentSubNetworkTag(event.target.value)}
                placeholder="front-harness"
              />
            </label>

            <div className="row-actions">
              <button type="submit">{segmentFormMode === "create" ? "Create" : "Save"}</button>
              {segmentFormMode === "edit" ? (
                <button type="button" onClick={resetSegmentForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {segmentFormError !== null ? <small className="inline-error">{segmentFormError}</small> : null}
          </form>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Connectors</h2>
          {connectors.length === 0 ? (
            <p className="empty-copy">No connector yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Technical ID</th>
                  <th>Cavities</th>
                  <th>Occupied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((connector) => {
                  const occupiedCount = selectConnectorCavityStatuses(state, connector.id).filter((slot) => slot.isOccupied)
                    .length;
                  const isSelected = selectedConnectorId === connector.id;

                  return (
                    <tr key={connector.id} className={isSelected ? "is-selected" : undefined}>
                      <td>{connector.name}</td>
                      <td>{connector.technicalId}</td>
                      <td>{connector.cavityCount}</td>
                      <td>{occupiedCount}</td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => appStore.dispatch(appActions.select({ kind: "connector", id: connector.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startConnectorEdit(connector)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleConnectorDelete(connector.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel">
          <h2>Splices</h2>
          {splices.length === 0 ? (
            <p className="empty-copy">No splice yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Technical ID</th>
                  <th>Ports</th>
                  <th>Branches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {splices.map((splice) => {
                  const occupiedCount = selectSplicePortStatuses(state, splice.id).filter((slot) => slot.isOccupied).length;
                  const isSelected = selectedSpliceId === splice.id;

                  return (
                    <tr key={splice.id} className={isSelected ? "is-selected" : undefined}>
                      <td>
                        <span className="splice-badge">Junction</span> {splice.name}
                      </td>
                      <td>{splice.technicalId}</td>
                      <td>{splice.portCount}</td>
                      <td>{occupiedCount}</td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => appStore.dispatch(appActions.select({ kind: "splice", id: splice.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startSpliceEdit(splice)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleSpliceDelete(splice.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel">
          <h2>Nodes</h2>
          {nodes.length === 0 ? (
            <p className="empty-copy">No node yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kind</th>
                  <th>Reference</th>
                  <th>Linked segments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => {
                  const linkedSegments = segments.filter(
                    (segment) => segment.nodeA === node.id || segment.nodeB === node.id
                  ).length;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <tr key={node.id} className={isSelected ? "is-selected" : undefined}>
                      <td>{node.id}</td>
                      <td>{node.kind}</td>
                      <td>{describeNode(node)}</td>
                      <td>{linkedSegments}</td>
                      <td>
                        <div className="row-actions compact">
                          <button type="button" onClick={() => appStore.dispatch(appActions.select({ kind: "node", id: node.id }))}>
                            Select
                          </button>
                          <button type="button" onClick={() => startNodeEdit(node)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleNodeDelete(node.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel">
          <h2>Segments</h2>
          {segments.length === 0 ? (
            <p className="empty-copy">No segment yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Node A</th>
                  <th>Node B</th>
                  <th>Length (mm)</th>
                  <th>Sub-network</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => {
                  const nodeA = state.nodes.byId[segment.nodeA];
                  const nodeB = state.nodes.byId[segment.nodeB];
                  const isSelected = selectedSegmentId === segment.id;

                  return (
                    <tr key={segment.id} className={isSelected ? "is-selected" : undefined}>
                      <td>{segment.id}</td>
                      <td>{nodeA === undefined ? segment.nodeA : describeNode(nodeA)}</td>
                      <td>{nodeB === undefined ? segment.nodeB : describeNode(nodeB)}</td>
                      <td>{segment.lengthMm}</td>
                      <td>
                        <span className="subnetwork-chip">{segment.subNetworkTag?.trim() || "(default)"}</span>
                      </td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => appStore.dispatch(appActions.select({ kind: "segment", id: segment.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startSegmentEdit(segment)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleSegmentDelete(segment.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <section className="panel-grid">
        <section className="panel">
          <h2>Connector cavities</h2>
          {selectedConnector === null ? (
            <p className="empty-copy">Select a connector to view and manage cavity occupancy.</p>
          ) : (
            <>
              <p className="meta-line">
                <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
              </p>
              <form className="row-form" onSubmit={handleReserveCavity}>
                <label>
                  Cavity index
                  <input
                    type="number"
                    min={1}
                    max={selectedConnector.cavityCount}
                    step={1}
                    value={cavityIndexInput}
                    onChange={(event) => setCavityIndexInput(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Occupant reference
                  <input
                    value={connectorOccupantRefInput}
                    onChange={(event) => setConnectorOccupantRefInput(event.target.value)}
                    placeholder="wire-draft-001:A"
                    required
                  />
                </label>

                <button type="submit">Reserve cavity</button>
              </form>

              <div className="cavity-grid" aria-label="Cavity occupancy grid">
                {connectorCavityStatuses.map((slot) => (
                  <article key={slot.cavityIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                    <h3>C{slot.cavityIndex}</h3>
                    <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
                    {slot.isOccupied ? (
                      <button type="button" onClick={() => handleReleaseCavity(slot.cavityIndex)}>
                        Release
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="panel">
          <h2>Splice ports</h2>
          {selectedSplice === null ? (
            <p className="empty-copy">Select a splice to view and manage port occupancy.</p>
          ) : (
            <>
              <p className="meta-line">
                <span className="splice-badge">Junction</span> <strong>{selectedSplice.name}</strong> (
                {selectedSplice.technicalId})
              </p>
              <p className="meta-line">Branch count: {splicePortStatuses.filter((slot) => slot.isOccupied).length}</p>
              <form className="row-form" onSubmit={handleReservePort}>
                <label>
                  Port index
                  <input
                    type="number"
                    min={1}
                    max={selectedSplice.portCount}
                    step={1}
                    value={portIndexInput}
                    onChange={(event) => setPortIndexInput(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Occupant reference
                  <input
                    value={spliceOccupantRefInput}
                    onChange={(event) => setSpliceOccupantRefInput(event.target.value)}
                    placeholder="wire-draft-001:B"
                    required
                  />
                </label>

                <button type="submit">Reserve port</button>
              </form>

              <div className="cavity-grid" aria-label="Splice port occupancy grid">
                {splicePortStatuses.map((slot) => (
                  <article key={slot.portIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                    <h3>P{slot.portIndex}</h3>
                    <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
                    {slot.isOccupied ? (
                      <button type="button" onClick={() => handleReleasePort(slot.portIndex)}>
                        Release
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="panel">
          <h2>Network summary</h2>
          <div className="summary-grid">
            <article>
              <h3>Graph nodes</h3>
              <p>{routingGraph.nodeIds.length}</p>
            </article>
            <article>
              <h3>Graph segments</h3>
              <p>{routingGraph.segmentIds.length}</p>
            </article>
            <article>
              <h3>Adjacency entries</h3>
              <p>{totalEdgeEntries}</p>
            </article>
          </div>

          <h3 className="summary-title">Sub-networks</h3>
          {subNetworkSummaries.length === 0 ? (
            <p className="empty-copy">No sub-network tags yet. Segments currently belong to the default group.</p>
          ) : (
            <ul className="subnetwork-list">
              {subNetworkSummaries.map((group) => (
                <li key={group.tag}>
                  <span className="subnetwork-chip">{group.tag}</span>
                  <span>
                    {group.segmentCount} segment(s), {group.totalLengthMm} mm total
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="summary-title">Selection snapshot</h3>
          <div className="selection-snapshot">
            <p>
              Connector: {selectedConnector === null ? "none" : `${selectedConnector.name} (${selectedConnector.technicalId})`}
            </p>
            <p>Splice: {selectedSplice === null ? "none" : `${selectedSplice.name} (${selectedSplice.technicalId})`}</p>
            <p>Node: {selectedNode === null ? "none" : describeNode(selectedNode)}</p>
            <p>
              Segment: {selectedSegment === null ? "none" : `${selectedSegment.id} (${selectedSegment.lengthMm} mm)`}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
