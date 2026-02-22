import type { ReactElement } from "react";
import type { NetworkNode } from "../../../core/entities";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingNodeFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isNodeSubScreen,
    nodeFormMode,
    openCreateNodeForm,
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
    cancelNodeEdit,
    nodeFormError
  } = props;

  return (
<article className="panel" hidden={!isNodeSubScreen}>
  {renderFormHeader(nodeFormMode === "create" ? "Create Node" : nodeFormMode === "edit" ? "Edit Node" : "Node form", nodeFormMode)}
  {nodeFormMode === "idle" ? renderIdleCopy("node", openCreateNodeForm) : (
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
      <button type="button" onClick={cancelNodeEdit}>
        {nodeFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {nodeFormError !== null ? <small className="inline-error">{nodeFormError}</small> : null}
  </form>
  )}
</article>
  );
}
