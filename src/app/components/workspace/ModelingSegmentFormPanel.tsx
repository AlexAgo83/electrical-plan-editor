import type { ReactElement } from "react";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingSegmentFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isSegmentSubScreen,
    segmentFormMode,
    openCreateSegmentForm,
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
    cancelSegmentEdit,
    segmentFormError
  } = props;

  return (
<article className="panel" hidden={!isSegmentSubScreen}>
  {renderFormHeader(
    segmentFormMode === "create" ? "Create Segment" : segmentFormMode === "edit" ? "Edit Segment" : "Segment form",
    segmentFormMode
  )}
  {segmentFormMode === "idle" ? renderIdleCopy("segment", openCreateSegmentForm) : (
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
      <button type="button" onClick={cancelSegmentEdit}>
        {segmentFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {segmentFormError !== null ? <small className="inline-error">{segmentFormError}</small> : null}
  </form>
  )}
</article>
  );
}
