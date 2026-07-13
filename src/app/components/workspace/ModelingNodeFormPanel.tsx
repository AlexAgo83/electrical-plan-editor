import { translateCurrent as t } from "../../lib/i18n";
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
    nodeEditAfterCreate,
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
      : t("ui.canvasPlacementCaptured", {
          x: Math.round(pendingNewNodePosition.x),
          y: Math.round(pendingNewNodePosition.y)
        });
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
  {renderFormHeader(nodeFormMode === "create" ? t("ui.createNode") : nodeFormMode === "edit" ? t("ui.editNode") : t("ui.nodeForm"), nodeFormMode)}
  {nodeFormMode === "idle" ? renderIdleCopy("node", openCreateNodeForm) : (
  <form className="stack-form" onSubmit={handleNodeSubmit}>
    <label>
      
      {t("ui.nodeID")}
      <input value={nodeIdInput} onChange={(event) => setNodeIdInput(event.target.value)} placeholder="N-001" required />
    </label>
    {nodeFormMode === "edit" ? <small className="inline-help">{t("ui.changingNodeIDRenamesTheNodeAndRemapsConnectedReferences")}</small> : null}
    {nodeFormMode === "create" && pendingPlacementCopy !== null ? <small className="inline-help">{pendingPlacementCopy}</small> : null}

    <label>
      
      {t("ui.nodeKind")}
      <select value={nodeKind} onChange={(event) => setNodeKind(event.target.value as NetworkNode["kind"])}>
        <option value="intermediate">{t("ui.intermediate")}</option>
        <option value="connector">{t("ui.connectorNode")}</option>
        <option value="splice">{t("ui.spliceNode")}</option>
      </select>
    </label>

    {nodeKind === "intermediate" ? (
      <label>
        {t("ui.connectorlayouteditorLabel")}<input value={nodeLabel} onChange={(event) => setNodeLabel(event.target.value)} placeholder={t("ui.modelingnodeformpanelNBranch01")} required />
      </label>
    ) : null}

    {nodeKind === "connector" ? (
      <label>
        
        {t("ui.connector")}
        <select value={nodeConnectorId} onChange={(event) => setNodeConnectorId(event.target.value)} required>
          <option value="">{t("ui.selectConnector")}</option>
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
        
        {t("ui.splice")}
        <select value={nodeSpliceId} onChange={(event) => setNodeSpliceId(event.target.value)} required>
          <option value="">{t("ui.selectSplice")}</option>
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
        {nodeFormMode === "create" ? t("ui.create") : t("ui.save")}
      </button>
      {nodeFormMode === "edit" && nodeEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={openCreateNodeForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          
          {t("ui.new")}
        </button>
      ) : null}
      <button type="button" className={nodeFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelNodeEdit}>
        {nodeFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {nodeFormMode === "edit" ? t("ui.cancelEdit") : t("ui.cancel")}
      </button>
    </div>
    {nodeFormError !== null ? <small className="inline-error">{nodeFormError}</small> : null}
  </form>
  )}
</article>
  );
}
