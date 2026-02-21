import type { FormEvent, ReactElement } from "react";
import type { Connector, NetworkNode, Splice, WireEndpoint } from "../../../core/entities";

interface ModelingFormsColumnProps {
  isConnectorSubScreen: boolean;
  connectorFormMode: "create" | "edit";
  handleConnectorSubmit: (event: FormEvent<HTMLFormElement>) => void;
  connectorName: string;
  setConnectorName: (value: string) => void;
  connectorTechnicalId: string;
  setConnectorTechnicalId: (value: string) => void;
  connectorTechnicalIdAlreadyUsed: boolean;
  cavityCount: string;
  setCavityCount: (value: string) => void;
  resetConnectorForm: () => void;
  connectorFormError: string | null;
  isSpliceSubScreen: boolean;
  spliceFormMode: "create" | "edit";
  handleSpliceSubmit: (event: FormEvent<HTMLFormElement>) => void;
  spliceName: string;
  setSpliceName: (value: string) => void;
  spliceTechnicalId: string;
  setSpliceTechnicalId: (value: string) => void;
  spliceTechnicalIdAlreadyUsed: boolean;
  portCount: string;
  setPortCount: (value: string) => void;
  resetSpliceForm: () => void;
  spliceFormError: string | null;
  isNodeSubScreen: boolean;
  nodeFormMode: "create" | "edit";
  handleNodeSubmit: (event: FormEvent<HTMLFormElement>) => void;
  nodeIdInput: string;
  setNodeIdInput: (value: string) => void;
  pendingNewNodePosition: { x: number; y: number } | null;
  nodeKind: NetworkNode["kind"];
  setNodeKind: (value: NetworkNode["kind"]) => void;
  nodeLabel: string;
  setNodeLabel: (value: string) => void;
  connectors: Connector[];
  nodeConnectorId: string;
  setNodeConnectorId: (value: string) => void;
  splices: Splice[];
  nodeSpliceId: string;
  setNodeSpliceId: (value: string) => void;
  resetNodeForm: () => void;
  nodeFormError: string | null;
  isSegmentSubScreen: boolean;
  segmentFormMode: "create" | "edit";
  handleSegmentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  segmentIdInput: string;
  setSegmentIdInput: (value: string) => void;
  nodes: NetworkNode[];
  describeNode: (node: NetworkNode) => string;
  segmentNodeA: string;
  setSegmentNodeA: (value: string) => void;
  segmentNodeB: string;
  setSegmentNodeB: (value: string) => void;
  segmentLengthMm: string;
  setSegmentLengthMm: (value: string) => void;
  segmentSubNetworkTag: string;
  setSegmentSubNetworkTag: (value: string) => void;
  resetSegmentForm: () => void;
  segmentFormError: string | null;
  isWireSubScreen: boolean;
  wireFormMode: "create" | "edit";
  handleWireSubmit: (event: FormEvent<HTMLFormElement>) => void;
  wireName: string;
  setWireName: (value: string) => void;
  wireTechnicalId: string;
  setWireTechnicalId: (value: string) => void;
  wireTechnicalIdAlreadyUsed: boolean;
  wireEndpointAKind: WireEndpoint["kind"];
  setWireEndpointAKind: (value: WireEndpoint["kind"]) => void;
  wireEndpointAConnectorId: string;
  setWireEndpointAConnectorId: (value: string) => void;
  wireEndpointACavityIndex: string;
  setWireEndpointACavityIndex: (value: string) => void;
  wireEndpointASpliceId: string;
  setWireEndpointASpliceId: (value: string) => void;
  wireEndpointAPortIndex: string;
  setWireEndpointAPortIndex: (value: string) => void;
  wireEndpointBKind: WireEndpoint["kind"];
  setWireEndpointBKind: (value: WireEndpoint["kind"]) => void;
  wireEndpointBConnectorId: string;
  setWireEndpointBConnectorId: (value: string) => void;
  wireEndpointBCavityIndex: string;
  setWireEndpointBCavityIndex: (value: string) => void;
  wireEndpointBSpliceId: string;
  setWireEndpointBSpliceId: (value: string) => void;
  wireEndpointBPortIndex: string;
  setWireEndpointBPortIndex: (value: string) => void;
  resetWireForm: () => void;
  wireFormError: string | null;
}

export function ModelingFormsColumn({
  isConnectorSubScreen,
  connectorFormMode,
  handleConnectorSubmit,
  connectorName,
  setConnectorName,
  connectorTechnicalId,
  setConnectorTechnicalId,
  connectorTechnicalIdAlreadyUsed,
  cavityCount,
  setCavityCount,
  resetConnectorForm,
  connectorFormError,
  isSpliceSubScreen,
  spliceFormMode,
  handleSpliceSubmit,
  spliceName,
  setSpliceName,
  spliceTechnicalId,
  setSpliceTechnicalId,
  spliceTechnicalIdAlreadyUsed,
  portCount,
  setPortCount,
  resetSpliceForm,
  spliceFormError,
  isNodeSubScreen,
  nodeFormMode,
  handleNodeSubmit,
  nodeIdInput,
  setNodeIdInput,
  pendingNewNodePosition,
  nodeKind,
  setNodeKind,
  nodeLabel,
  setNodeLabel,
  connectors,
  nodeConnectorId,
  setNodeConnectorId,
  splices,
  nodeSpliceId,
  setNodeSpliceId,
  resetNodeForm,
  nodeFormError,
  isSegmentSubScreen,
  segmentFormMode,
  handleSegmentSubmit,
  segmentIdInput,
  setSegmentIdInput,
  nodes,
  describeNode,
  segmentNodeA,
  setSegmentNodeA,
  segmentNodeB,
  setSegmentNodeB,
  segmentLengthMm,
  setSegmentLengthMm,
  segmentSubNetworkTag,
  setSegmentSubNetworkTag,
  resetSegmentForm,
  segmentFormError,
  isWireSubScreen,
  wireFormMode,
  handleWireSubmit,
  wireName,
  setWireName,
  wireTechnicalId,
  setWireTechnicalId,
  wireTechnicalIdAlreadyUsed,
  wireEndpointAKind,
  setWireEndpointAKind,
  wireEndpointAConnectorId,
  setWireEndpointAConnectorId,
  wireEndpointACavityIndex,
  setWireEndpointACavityIndex,
  wireEndpointASpliceId,
  setWireEndpointASpliceId,
  wireEndpointAPortIndex,
  setWireEndpointAPortIndex,
  wireEndpointBKind,
  setWireEndpointBKind,
  wireEndpointBConnectorId,
  setWireEndpointBConnectorId,
  wireEndpointBCavityIndex,
  setWireEndpointBCavityIndex,
  wireEndpointBSpliceId,
  setWireEndpointBSpliceId,
  wireEndpointBPortIndex,
  setWireEndpointBPortIndex,
  resetWireForm,
  wireFormError
}: ModelingFormsColumnProps): ReactElement {
  function renderFormHeader(title: string, mode: "create" | "edit"): ReactElement {
    return (
      <header className="network-form-header">
        <h2>{title}</h2>
        <span className={mode === "create" ? "network-form-mode-chip is-create" : "network-form-mode-chip is-edit"}>
          {mode === "create" ? "Create mode" : "Edit mode"}
        </span>
      </header>
    );
  }

  return (
    <section className="panel-grid workspace-column workspace-column-right">
      <article className="panel" hidden={!isConnectorSubScreen}>
        {renderFormHeader(connectorFormMode === "create" ? "Create Connector" : "Edit Connector", connectorFormMode)}
        <form className="stack-form" onSubmit={handleConnectorSubmit}>
          <label>
            Functional name
            <input value={connectorName} onChange={(event) => setConnectorName(event.target.value)} placeholder="Rear body connector" required />
          </label>
          <label>
            Technical ID
            <input value={connectorTechnicalId} onChange={(event) => setConnectorTechnicalId(event.target.value)} placeholder="C-001" required />
          </label>
          {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
          <label>
            Cavity count
            <input type="number" min={1} step={1} value={cavityCount} onChange={(event) => setCavityCount(event.target.value)} required />
          </label>
          <div className="row-actions">
            <button type="submit" disabled={connectorTechnicalIdAlreadyUsed}>{connectorFormMode === "create" ? "Create" : "Save"}</button>
            {connectorFormMode === "edit" ? <button type="button" onClick={resetConnectorForm}>Cancel edit</button> : null}
          </div>
          {connectorFormError !== null ? <small className="inline-error">{connectorFormError}</small> : null}
        </form>
      </article>

      <article className="panel" hidden={!isSpliceSubScreen}>
        {renderFormHeader(spliceFormMode === "create" ? "Create Splice" : "Edit Splice", spliceFormMode)}
        <form className="stack-form" onSubmit={handleSpliceSubmit}>
          <label>
            Functional name
            <input value={spliceName} onChange={(event) => setSpliceName(event.target.value)} placeholder="Cabin junction" required />
          </label>
          <label>
            Technical ID
            <input value={spliceTechnicalId} onChange={(event) => setSpliceTechnicalId(event.target.value)} placeholder="S-001" required />
          </label>
          {spliceTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
          <label>
            Port count
            <input type="number" min={1} step={1} value={portCount} onChange={(event) => setPortCount(event.target.value)} required />
          </label>
          <div className="row-actions">
            <button type="submit" disabled={spliceTechnicalIdAlreadyUsed}>{spliceFormMode === "create" ? "Create" : "Save"}</button>
            {spliceFormMode === "edit" ? <button type="button" onClick={resetSpliceForm}>Cancel edit</button> : null}
          </div>
          {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
        </form>
      </article>

      <article className="panel" hidden={!isNodeSubScreen}>
        {renderFormHeader(nodeFormMode === "create" ? "Create Node" : "Edit Node", nodeFormMode)}
        <form className="stack-form" onSubmit={handleNodeSubmit}>
          <label>
            Node ID
            <input value={nodeIdInput} onChange={(event) => setNodeIdInput(event.target.value)} placeholder="N-001" disabled={nodeFormMode === "edit"} required />
          </label>
          {nodeFormMode === "edit" ? <small className="inline-help">Node ID is immutable in edit mode.</small> : null}
          {nodeFormMode === "create" && pendingNewNodePosition !== null ? (
            <small className="inline-help">Canvas placement captured at x={Math.round(pendingNewNodePosition.x)}, y={Math.round(pendingNewNodePosition.y)}.</small>
          ) : null}

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
              <input value={nodeLabel} onChange={(event) => setNodeLabel(event.target.value)} placeholder="N-branch-01" required />
            </label>
          ) : null}

          {nodeKind === "connector" ? (
            <label>
              Connector
              <select value={nodeConnectorId} onChange={(event) => setNodeConnectorId(event.target.value)} required>
                <option value="">Select connector</option>
                {connectors.map((connector) => (
                  <option key={connector.id} value={connector.id}>{connector.name} ({connector.technicalId})</option>
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
                  <option key={splice.id} value={splice.id}>{splice.name} ({splice.technicalId})</option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="row-actions">
            <button type="submit">{nodeFormMode === "create" ? "Create" : "Save"}</button>
            {nodeFormMode === "edit" ? <button type="button" onClick={resetNodeForm}>Cancel edit</button> : null}
          </div>
          {nodeFormError !== null ? <small className="inline-error">{nodeFormError}</small> : null}
        </form>
      </article>

      <article className="panel" hidden={!isSegmentSubScreen}>
        {renderFormHeader(segmentFormMode === "create" ? "Create Segment" : "Edit Segment", segmentFormMode)}
        <form className="stack-form" onSubmit={handleSegmentSubmit}>
          <label>
            Segment ID
            <input value={segmentIdInput} onChange={(event) => setSegmentIdInput(event.target.value)} placeholder="SEG-001" disabled={segmentFormMode === "edit"} required />
          </label>
          {segmentFormMode === "edit" ? <small className="inline-help">Segment ID is immutable in edit mode.</small> : null}
          <label>
            Node A
            <select value={segmentNodeA} onChange={(event) => setSegmentNodeA(event.target.value)} required>
              <option value="">Select node</option>
              {nodes.map((node) => (<option key={node.id} value={node.id}>{describeNode(node)}</option>))}
            </select>
          </label>
          <label>
            Node B
            <select value={segmentNodeB} onChange={(event) => setSegmentNodeB(event.target.value)} required>
              <option value="">Select node</option>
              {nodes.map((node) => (<option key={node.id} value={node.id}>{describeNode(node)}</option>))}
            </select>
          </label>
          <label>
            Length (mm)
            <input type="number" min={0.1} step={0.1} value={segmentLengthMm} onChange={(event) => setSegmentLengthMm(event.target.value)} required />
          </label>
          <label>
            Sub-network tag
            <input value={segmentSubNetworkTag} onChange={(event) => setSegmentSubNetworkTag(event.target.value)} placeholder="front-harness" />
          </label>
          <div className="row-actions">
            <button type="submit">{segmentFormMode === "create" ? "Create" : "Save"}</button>
            {segmentFormMode === "edit" ? <button type="button" onClick={resetSegmentForm}>Cancel edit</button> : null}
          </div>
          {segmentFormError !== null ? <small className="inline-error">{segmentFormError}</small> : null}
        </form>
      </article>

      <article className="panel" hidden={!isWireSubScreen}>
        {renderFormHeader(wireFormMode === "create" ? "Create Wire" : "Edit Wire", wireFormMode)}
        <form className="stack-form" onSubmit={handleWireSubmit}>
          <label>
            Functional name
            <input value={wireName} onChange={(event) => setWireName(event.target.value)} placeholder="Feed wire" required />
          </label>
          <label>
            Technical ID
            <input value={wireTechnicalId} onChange={(event) => setWireTechnicalId(event.target.value)} placeholder="W-001" required />
          </label>
          {wireTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
          <div className="form-split">
            <fieldset className="inline-fieldset">
              <legend>Endpoint A</legend>
              <label>
                Type
                <select value={wireEndpointAKind} onChange={(event) => setWireEndpointAKind(event.target.value as WireEndpoint["kind"])}>
                  <option value="connectorCavity">Connector cavity</option>
                  <option value="splicePort">Splice port</option>
                </select>
              </label>
              {wireEndpointAKind === "connectorCavity" ? (
                <>
                  <label>
                    Connector
                    <select value={wireEndpointAConnectorId} onChange={(event) => setWireEndpointAConnectorId(event.target.value)}>
                      <option value="">Select connector</option>
                      {connectors.map((connector) => (<option key={connector.id} value={connector.id}>{connector.name} ({connector.technicalId})</option>))}
                    </select>
                  </label>
                  <label>
                    Cavity index
                    <input type="number" min={1} step={1} value={wireEndpointACavityIndex} onChange={(event) => setWireEndpointACavityIndex(event.target.value)} />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Splice
                    <select value={wireEndpointASpliceId} onChange={(event) => setWireEndpointASpliceId(event.target.value)}>
                      <option value="">Select splice</option>
                      {splices.map((splice) => (<option key={splice.id} value={splice.id}>{splice.name} ({splice.technicalId})</option>))}
                    </select>
                  </label>
                  <label>
                    Port index
                    <input type="number" min={1} step={1} value={wireEndpointAPortIndex} onChange={(event) => setWireEndpointAPortIndex(event.target.value)} />
                  </label>
                </>
              )}
            </fieldset>

            <fieldset className="inline-fieldset">
              <legend>Endpoint B</legend>
              <label>
                Type
                <select value={wireEndpointBKind} onChange={(event) => setWireEndpointBKind(event.target.value as WireEndpoint["kind"])}>
                  <option value="connectorCavity">Connector cavity</option>
                  <option value="splicePort">Splice port</option>
                </select>
              </label>
              {wireEndpointBKind === "connectorCavity" ? (
                <>
                  <label>
                    Connector
                    <select value={wireEndpointBConnectorId} onChange={(event) => setWireEndpointBConnectorId(event.target.value)}>
                      <option value="">Select connector</option>
                      {connectors.map((connector) => (<option key={connector.id} value={connector.id}>{connector.name} ({connector.technicalId})</option>))}
                    </select>
                  </label>
                  <label>
                    Cavity index
                    <input type="number" min={1} step={1} value={wireEndpointBCavityIndex} onChange={(event) => setWireEndpointBCavityIndex(event.target.value)} />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Splice
                    <select value={wireEndpointBSpliceId} onChange={(event) => setWireEndpointBSpliceId(event.target.value)}>
                      <option value="">Select splice</option>
                      {splices.map((splice) => (<option key={splice.id} value={splice.id}>{splice.name} ({splice.technicalId})</option>))}
                    </select>
                  </label>
                  <label>
                    Port index
                    <input type="number" min={1} step={1} value={wireEndpointBPortIndex} onChange={(event) => setWireEndpointBPortIndex(event.target.value)} />
                  </label>
                </>
              )}
            </fieldset>
          </div>

          <div className="row-actions">
            <button type="submit" disabled={wireTechnicalIdAlreadyUsed}>{wireFormMode === "create" ? "Create" : "Save"}</button>
            {wireFormMode === "edit" ? <button type="button" onClick={resetWireForm}>Cancel edit</button> : null}
          </div>
          {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
        </form>
      </article>
    </section>
  );
}
