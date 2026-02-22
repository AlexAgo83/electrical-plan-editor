import type { ReactElement } from "react";
import type { WireEndpoint } from "../../../core/entities";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingWireFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isWireSubScreen,
    wireFormMode,
    openCreateWireForm,
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
    connectors,
    splices,
    cancelWireEdit,
    wireFormError
  } = props;

  return (
<article className="panel" hidden={!isWireSubScreen}>
  {renderFormHeader(wireFormMode === "create" ? "Create Wire" : wireFormMode === "edit" ? "Edit Wire" : "Wire form", wireFormMode)}
  {wireFormMode === "idle" ? renderIdleCopy("wire", openCreateWireForm) : (
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
    <div className="form-split wire-endpoints-grid">
      <fieldset className="inline-fieldset wire-endpoint-fieldset">
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

      <fieldset className="inline-fieldset wire-endpoint-fieldset">
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
      <button
        type="submit"
        className="button-with-icon"
        disabled={wireTechnicalIdAlreadyUsed}
      >
        {wireFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {wireFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {wireFormMode === "create" ? "Create" : "Save"}
      </button>
      <button type="button" className={wireFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelWireEdit}>
        {wireFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {wireFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
  </form>
  )}
</article>
  );
}
