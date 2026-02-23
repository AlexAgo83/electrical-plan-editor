import type { ReactElement } from "react";
import { CABLE_COLOR_BY_ID, CABLE_COLOR_CATALOG } from "../../../core/cableColors";
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
    wireSectionMm2,
    setWireSectionMm2,
    wirePrimaryColorId,
    setWirePrimaryColorId,
    wireSecondaryColorId,
    setWireSecondaryColorId,
    wireTechnicalIdAlreadyUsed,
    wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference,
    wireEndpointASealReference,
    setWireEndpointASealReference,
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
    wireEndpointASlotHint,
    wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference,
    wireEndpointBSealReference,
    setWireEndpointBSealReference,
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
    wireEndpointBSlotHint,
    connectors,
    splices,
    cancelWireEdit,
    wireFormError
  } = props;
  const primaryColor = wirePrimaryColorId.length > 0 ? CABLE_COLOR_BY_ID[wirePrimaryColorId] : undefined;
  const secondaryColor = wireSecondaryColorId.length > 0 ? CABLE_COLOR_BY_ID[wireSecondaryColorId] : undefined;

  const swatch = (hex: string | undefined, label: string): ReactElement => (
    <span
      aria-hidden="true"
      title={label}
      style={{
        display: "inline-block",
        width: "0.9rem",
        height: "0.9rem",
        borderRadius: "999px",
        border: "1px solid var(--panel-border, rgba(255,255,255,0.2))",
        background: hex ?? "transparent",
        marginRight: "0.35rem",
        verticalAlign: "text-bottom",
        boxShadow: hex === undefined ? "inset 0 0 0 1px rgba(255,255,255,0.25)" : undefined
      }}
    />
  );

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
    <label>
      Section (mm²)
      <input
        type="number"
        min={0.01}
        step={0.01}
        value={wireSectionMm2}
        onChange={(event) => setWireSectionMm2(event.target.value)}
        placeholder="0.5"
        required
      />
    </label>
    <label>
      Primary color
      <select
        value={wirePrimaryColorId}
        onChange={(event) => {
          const nextPrimary = event.target.value;
          setWirePrimaryColorId(nextPrimary);
          if (nextPrimary.length === 0) {
            setWireSecondaryColorId("");
          }
        }}
      >
        <option value="">None</option>
        {CABLE_COLOR_CATALOG.map((color) => (
          <option key={color.id} value={color.id}>
            {color.id} - {color.label}
          </option>
        ))}
      </select>
    </label>
    <label>
      Secondary color
      <select
        value={wireSecondaryColorId}
        onChange={(event) => setWireSecondaryColorId(event.target.value)}
        disabled={wirePrimaryColorId.length === 0}
      >
        <option value="">None</option>
        {CABLE_COLOR_CATALOG.map((color) => (
          <option key={color.id} value={color.id}>
            {color.id} - {color.label}
          </option>
        ))}
      </select>
    </label>
    <small className="inline-help">
      {primaryColor === undefined ? (
        <>No color</>
      ) : (
        <>
          {swatch(primaryColor.hex, primaryColor.label)}
          {primaryColor.id} {primaryColor.label}
          {secondaryColor !== undefined ? (
            <>
              {" + "}
              {swatch(secondaryColor.hex, secondaryColor.label)}
              {secondaryColor.id} {secondaryColor.label}
            </>
          ) : null}
        </>
      )}
    </small>
    {wireTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <div className="form-split wire-endpoints-grid">
      <fieldset className="inline-fieldset wire-endpoint-fieldset">
        <legend>Endpoint A</legend>
        <label>
          Type
          <select value={wireEndpointAKind} onChange={(event) => setWireEndpointAKind(event.target.value as WireEndpoint["kind"])}>
            <option value="connectorCavity">Connector way</option>
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
              Way index
              <input type="number" min={1} step={1} value={wireEndpointACavityIndex} onChange={(event) => setWireEndpointACavityIndex(event.target.value)} />
            </label>
            {wireEndpointASlotHint !== null ? (
              <small className={wireEndpointASlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointASlotHint.message}</small>
            ) : null}
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
            {wireEndpointASlotHint !== null ? (
              <small className={wireEndpointASlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointASlotHint.message}</small>
            ) : null}
          </>
        )}
        <div className="stack-form">
          <small className="inline-help">Side A metadata</small>
          <label>
            Connection reference
            <input
              value={wireEndpointAConnectionReference}
              onChange={(event) => setWireEndpointAConnectionReference(event.target.value)}
              maxLength={120}
              placeholder="Optional"
            />
          </label>
          <label>
            Seal reference
            <input
              value={wireEndpointASealReference}
              onChange={(event) => setWireEndpointASealReference(event.target.value)}
              maxLength={120}
              placeholder="Optional"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="inline-fieldset wire-endpoint-fieldset">
        <legend>Endpoint B</legend>
        <label>
          Type
          <select value={wireEndpointBKind} onChange={(event) => setWireEndpointBKind(event.target.value as WireEndpoint["kind"])}>
            <option value="connectorCavity">Connector way</option>
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
              Way index
              <input type="number" min={1} step={1} value={wireEndpointBCavityIndex} onChange={(event) => setWireEndpointBCavityIndex(event.target.value)} />
            </label>
            {wireEndpointBSlotHint !== null ? (
              <small className={wireEndpointBSlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointBSlotHint.message}</small>
            ) : null}
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
            {wireEndpointBSlotHint !== null ? (
              <small className={wireEndpointBSlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointBSlotHint.message}</small>
            ) : null}
          </>
        )}
        <div className="stack-form">
          <small className="inline-help">Side B metadata</small>
          <label>
            Connection reference
            <input
              value={wireEndpointBConnectionReference}
              onChange={(event) => setWireEndpointBConnectionReference(event.target.value)}
              maxLength={120}
              placeholder="Optional"
            />
          </label>
          <label>
            Seal reference
            <input
              value={wireEndpointBSealReference}
              onChange={(event) => setWireEndpointBSealReference(event.target.value)}
              maxLength={120}
              placeholder="Optional"
            />
          </label>
        </div>
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
