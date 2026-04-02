import type { ReactElement } from "react";
import { useSegmentHandlersContext } from "../controller/ModelingController.context";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import { buildModelingDynamicSelectOptions } from "../../lib/modelingSelectOptions";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingSegmentFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isSegmentSubScreen,
    segmentFormMode,
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
    segmentFormError
  } = props;
  const segmentHandlers = useSegmentHandlersContext();
  const nodeOptions = buildModelingDynamicSelectOptions({
    options: nodes.map((node) => ({
      value: node.id,
      label: describeNode(node)
    })),
    selectedValue: segmentNodeA,
    missingOption: segmentNodeA.trim().length === 0 ? null : { label: `Missing node (${segmentNodeA})` }
  });
  const nodeBOptions = buildModelingDynamicSelectOptions({
    options: nodes.map((node) => ({
      value: node.id,
      label: describeNode(node)
    })),
    selectedValue: segmentNodeB,
    missingOption: segmentNodeB.trim().length === 0 ? null : { label: `Missing node (${segmentNodeB})` }
  });

  return (
<article className="panel" hidden={!isSegmentSubScreen} data-form-panel={FORM_PANEL_IDS.segment}>
  {renderFormHeader(
    segmentFormMode === "create" ? "Create Segment" : segmentFormMode === "edit" ? "Edit Segment" : "Segment form",
    segmentFormMode
  )}
  {segmentFormMode === "idle" ? renderIdleCopy("segment", segmentHandlers.resetSegmentForm) : (
  <form className="stack-form" onSubmit={segmentHandlers.handleSegmentSubmit}>
    <label>
      Segment ID
      <input value={segmentIdInput} onChange={(event) => setSegmentIdInput(event.target.value)} placeholder="SEG-001" required />
    </label>
    {segmentFormMode === "edit" ? <small className="inline-help">Editing Segment ID performs an atomic rename.</small> : null}
    <label>
      Node A
      <select value={segmentNodeA} onChange={(event) => setSegmentNodeA(event.target.value)} required>
        <option value="">Select node</option>
        {nodeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    <label>
      Node B
      <select value={segmentNodeB} onChange={(event) => setSegmentNodeB(event.target.value)} required>
        <option value="">Select node</option>
        {nodeBOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    <label>
      Length (mm)
      <input type="number" min={1} step={0.1} value={segmentLengthMm} onChange={(event) => setSegmentLengthMm(event.target.value)} required />
    </label>
    <label>
      Sub-network tag (optional)
      <input value={segmentSubNetworkTag} onChange={(event) => setSegmentSubNetworkTag(event.target.value)} placeholder="front-harness" />
    </label>
    <div className="row-actions">
      <button type="submit" className="button-with-icon">
        {segmentFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {segmentFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {segmentFormMode === "create" ? "Create" : "Save"}
      </button>
      {segmentFormMode === "create" ? (
        <button type="button" className="button-with-icon" onClick={segmentHandlers.resetSegmentForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          New
        </button>
      ) : null}
      {segmentFormMode === "edit" ? (
        <button type="button" className="button-with-icon" onClick={segmentHandlers.handleSwapSegmentNodes}>
          <span className="action-button-icon is-swap" aria-hidden="true" />
          Swap nodes
        </button>
      ) : null}
      <button
        type="button"
        className={segmentFormMode === "edit" ? "button-with-icon" : undefined}
        onClick={segmentHandlers.cancelSegmentEdit}
      >
        {segmentFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {segmentFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {segmentFormError !== null ? <small className="inline-error">{segmentFormError}</small> : null}
  </form>
  )}
</article>
  );
}
