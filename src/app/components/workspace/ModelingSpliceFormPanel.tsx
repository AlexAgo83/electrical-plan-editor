import type { ReactElement } from "react";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

export function ModelingSpliceFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isSpliceSubScreen,
    spliceFormMode,
    openCreateSpliceForm,
    handleSpliceSubmit,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    spliceTechnicalIdAlreadyUsed,
    portCount,
    setPortCount,
    cancelSpliceEdit,
    spliceFormError
  } = props;

  return (
<article className="panel" hidden={!isSpliceSubScreen}>
  {renderFormHeader(
    spliceFormMode === "create" ? "Create Splice" : spliceFormMode === "edit" ? "Edit Splice" : "Splice form",
    spliceFormMode
  )}
  {spliceFormMode === "idle" ? renderIdleCopy("splice", openCreateSpliceForm) : (
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
      <button type="button" onClick={cancelSpliceEdit}>
        {spliceFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {spliceFormError !== null ? <small className="inline-error">{spliceFormError}</small> : null}
  </form>
  )}
</article>
  );
}
