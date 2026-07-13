import { translateCurrent as t } from "../../lib/i18n";
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
    segmentEditAfterCreate,
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
    segmentSheathType,
    setSegmentSheathType,
    segmentInsulation,
    setSegmentInsulation,
    segmentLineStyle,
    setSegmentLineStyle,
    segmentInternalPartReference,
    setSegmentInternalPartReference,
    segmentMountingLabelsText,
    setSegmentMountingLabelsText,
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
    segmentFormMode === "create" ? t("ui.createSegment") : segmentFormMode === "edit" ? t("ui.editSegment") : t("ui.segmentForm"),
    segmentFormMode
  )}
  {segmentFormMode === "idle" ? renderIdleCopy("segment", segmentHandlers.resetSegmentForm) : (
  <form className="stack-form" onSubmit={segmentHandlers.handleSegmentSubmit}>
    <label>
      
      {t("ui.segmentID")}
      <input value={segmentIdInput} onChange={(event) => setSegmentIdInput(event.target.value)} placeholder="SEG-001" required />
    </label>
    {segmentFormMode === "edit" ? <small className="inline-help">{t("ui.editingSegmentIDPerformsAnAtomicRename")}</small> : null}
    <label>
      
      {t("ui.nodeA")}
      <select value={segmentNodeA} onChange={(event) => setSegmentNodeA(event.target.value)} required>
        <option value="">{t("ui.selectNode")}</option>
        {nodeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    <label>
      
      {t("ui.nodeB")}
      <select value={segmentNodeB} onChange={(event) => setSegmentNodeB(event.target.value)} required>
        <option value="">{t("ui.selectNode")}</option>
        {nodeBOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    <label>
      
      {t("ui.lengthMm")}
      <input type="number" min={1} step={0.1} value={segmentLengthMm} onChange={(event) => setSegmentLengthMm(event.target.value)} required />
    </label>
    <label>
      
      {t("ui.subNetworkTagOptional")}
      <input value={segmentSubNetworkTag} onChange={(event) => setSegmentSubNetworkTag(event.target.value)} placeholder="front-harness" />
    </label>
    <label>
      {t("ui.modelingsegmentformpanelSheathTypeOptional")}<input value={segmentSheathType} onChange={(event) => setSegmentSheathType(event.target.value)} placeholder={t("ui.modelingbatchcontextpanelCt5")} />
    </label>
    <label>
      {t("ui.modelingbatchcontextpanelInsulationOptional")}<input value={segmentInsulation} onChange={(event) => setSegmentInsulation(event.target.value)} placeholder={t("ui.modelingbatchcontextpanelPvc")} />
    </label>
    <label>
      {t("ui.modelingbatchcontextpanelLineStyleOptional")}<input value={segmentLineStyle} onChange={(event) => setSegmentLineStyle(event.target.value)} placeholder={t("ui.modelingbatchcontextpanelBraidedSleeve")} />
    </label>
    <label>
      {t("ui.modelingbatchcontextpanelInternalPartReferenceOptional")}<input
        value={segmentInternalPartReference}
        onChange={(event) => setSegmentInternalPartReference(event.target.value)}
        placeholder="INT-PART-001"
      />
    </label>
    <label>
      {t("ui.modelingsegmentformpanelMountingLabelsOptional")}<textarea
        value={segmentMountingLabelsText}
        onChange={(event) => setSegmentMountingLabelsText(event.target.value)}
        placeholder={"LBL-001,Assembly label,0.5,0,-18\nLBL-002,Rear harness,0.2,0,14"}
        rows={3}
      />
    </label>
    <small className="inline-help">{t("ui.modelingsegmentformpanelOneLinePerLabelIdTextPositionRatioOffsetXOffsetY")}</small>
    <div className="row-actions">
      <button type="submit" className="button-with-icon">
        {segmentFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {segmentFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {segmentFormMode === "create" ? t("ui.create") : t("ui.save")}
      </button>
      {segmentFormMode === "edit" && segmentEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={segmentHandlers.resetSegmentForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          
          {t("ui.new")}
        </button>
      ) : null}
      {segmentFormMode === "edit" ? (
        <button type="button" className="button-with-icon" onClick={segmentHandlers.handleSwapSegmentNodes}>
          <span className="action-button-icon is-swap" aria-hidden="true" />
          
          {t("ui.swapNodes")}
        </button>
      ) : null}
      <button
        type="button"
        className={segmentFormMode === "edit" ? "button-with-icon" : undefined}
        onClick={segmentHandlers.cancelSegmentEdit}
      >
        {segmentFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {segmentFormMode === "edit" ? t("ui.cancelEdit") : t("ui.cancel")}
      </button>
    </div>
    {segmentFormError !== null ? <small className="inline-error">{segmentFormError}</small> : null}
  </form>
  )}
</article>
  );
}
