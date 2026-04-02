import type { ReactElement } from "react";
import type { NetworkNode } from "../../../core/entities";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import { buildModelingDynamicSelectOptions } from "../../lib/modelingSelectOptions";
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
  const pendingPlacementCopy =
    pendingNewNodePosition === null
      ? null
      : `Canvas placement captured at x=${Math.round(pendingNewNodePosition.x)}, y=${Math.round(pendingNewNodePosition.y)}.`;
  const connectorOptions = buildModelingDynamicSelectOptions({
    options: connectors.map((connector) => ({
      value: connector.id,
      label: `${connector.name} (${connector.technicalId})`,
      technicalId: connector.technicalId
    })),
    selectedValue: nodeConnectorId,
    missingOption:
      nodeConnectorId.trim().length === 0 ? null : { label: `Missing connector (${nodeConnectorId})`, technicalId: nodeConnectorId }
  });
  const spliceOptions = buildModelingDynamicSelectOptions({
    options: splices.map((splice) => ({
      value: splice.id,
      label: `${splice.name} (${splice.technicalId})`,
      technicalId: splice.technicalId
    })),
    selectedValue: nodeSpliceId,
    missingOption:
      nodeSpliceId.trim().length === 0 ? null : { label: `Missing splice (${nodeSpliceId})`, technicalId: nodeSpliceId }
  });

  return (
<article className="panel" hidden={!isNodeSubScreen} data-form-panel={FORM_PANEL_IDS.node}>
  {renderFormHeader(nodeFormMode === "create" ? "Create Node" : nodeFormMode === "edit" ? "Edit Node" : "Node form", nodeFormMode)}
  {nodeFormMode === "idle" ? renderIdleCopy("node", openCreateNodeForm) : (
  <form className="stack-form" onSubmit={handleNodeSubmit}>
    <label>
      Node ID
      <input value={nodeIdInput} onChange={(event) => setNodeIdInput(event.target.value)} placeholder="N-001" required />
    </label>
    {nodeFormMode === "edit" ? <small className="inline-help">Changing Node ID renames the node and remaps connected references.</small> : null}
    {nodeFormMode === "create" && pendingPlacementCopy !== null ? <small className="inline-help">{pendingPlacementCopy}</small> : null}

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
          {connectorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
          {spliceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ) : null}

    <div className="row-actions">
      <button type="submit" className="button-with-icon">
        {nodeFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {nodeFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {nodeFormMode === "create" ? "Create" : "Save"}
      </button>
      {nodeFormMode === "create" ? (
        <button type="button" className="button-with-icon" onClick={openCreateNodeForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          New
        </button>
      ) : null}
      <button type="button" className={nodeFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelNodeEdit}>
        {nodeFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {nodeFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {nodeFormError !== null ? <small className="inline-error">{nodeFormError}</small> : null}
  </form>
  )}
</article>
  );
}
