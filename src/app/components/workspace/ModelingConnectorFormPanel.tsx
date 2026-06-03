import type { ReactElement } from "react";
import { useState } from "react";
import { useConnectorHandlersContext } from "../controller/ModelingController.context";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import { buildModelingDynamicSelectOptions } from "../../lib/modelingSelectOptions";
import { EntityReferenceButton } from "./EntityReferenceButton";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";
import { getFusePairOverrideDraftError, getFusePairRatingDraftError } from "../../hooks/connectorFusePairRatings";

const FUSE_RATING_QUICK_PICKS = ["3", "4", "5", "7.5", "10", "15", "20", "25", "30", "40"] as const;

export function ModelingConnectorFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isConnectorSubScreen,
    connectorFormMode,
    connectorEditAfterCreate,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    catalogItems,
    openCatalogSubScreen,
    onSelectCatalogItem,
    connectorCatalogItemId,
    setConnectorCatalogItemId,
    connectorManufacturerReference,
    connectorIsMainHarnessConnector,
    setConnectorIsMainHarnessConnector,
    connectorFusePairRatings,
    setConnectorFusePairRatings,
    connectorFusePairOverrides,
    setConnectorFusePairOverrides,
    connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode,
    connectorTechnicalIdAlreadyUsed,
    cavityCount,
    connectorFormError
  } = props;
  const connectorHandlers = useConnectorHandlersContext();
  const [openFuseRatingPresetPairIndex, setOpenFuseRatingPresetPairIndex] = useState<number | null>(null);
  const hasCatalogItems = catalogItems.length > 0;
  const selectedCatalogItem = catalogItems.find((item) => item.id === connectorCatalogItemId);
  const connectorCatalogFuseBoxPairs = selectedCatalogItem?.fuseBoxConfig?.pairs;
  const catalogItemOptions = buildModelingDynamicSelectOptions({
    options: catalogItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturerReference}${item.name?.trim() ? ` - ${item.name.trim()}` : ""} (${item.connectionCount})`
    })),
    selectedValue: connectorCatalogItemId,
    missingOption:
      connectorCatalogItemId.trim().length === 0
        ? null
        : { label: `Missing catalog item (${connectorCatalogItemId})` }
  });

  const updateConnectorFusePairRating = (pairIndex: number, value: string): void => {
    setConnectorFusePairRatings({
      ...connectorFusePairRatings,
      [pairIndex]: value
    });
  };

  const clearConnectorFusePairRatings = (): void => {
    setConnectorFusePairRatings({});
  };

  const updateConnectorFusePairOverride = (pairIndex: number, axis: "pinA" | "pinB", value: string): void => {
    const previous = connectorFusePairOverrides[pairIndex] ?? { pinA: "", pinB: "" };
    setConnectorFusePairOverrides({
      ...connectorFusePairOverrides,
      [pairIndex]: { ...previous, [axis]: value }
    });
  };

  const resetConnectorFusePairOverridesToCatalog = (): void => {
    if (connectorCatalogFuseBoxPairs === undefined) {
      setConnectorFusePairOverrides({});
      return;
    }
    setConnectorFusePairOverrides(
      Object.fromEntries(
        connectorCatalogFuseBoxPairs.map((pair) => [
          pair.pairIndex,
          { pinA: String(pair.pinA), pinB: String(pair.pinB) }
        ])
      )
    );
  };

  const cavityCountNumber = Number(cavityCount);
  const cavityCountForValidation = Number.isFinite(cavityCountNumber) && cavityCountNumber > 0 ? cavityCountNumber : 1;

  const fusePairPinOwners = new Map<number, number[]>();
  if (connectorCatalogFuseBoxPairs !== undefined) {
    for (const pair of connectorCatalogFuseBoxPairs) {
      const draft = connectorFusePairOverrides[pair.pairIndex];
      const pinA = Number((draft?.pinA ?? String(pair.pinA)).trim());
      const pinB = Number((draft?.pinB ?? String(pair.pinB)).trim());
      for (const pin of [pinA, pinB]) {
        if (!Number.isInteger(pin) || pin < 1) {
          continue;
        }
        const owners = fusePairPinOwners.get(pin) ?? [];
        owners.push(pair.pairIndex);
        fusePairPinOwners.set(pin, owners);
      }
    }
  }
  const describeDuplicatePinConflict = (pairIndex: number, pinValueRaw: string): string | null => {
    const pin = Number(pinValueRaw.trim());
    if (!Number.isInteger(pin)) {
      return null;
    }
    const owners = (fusePairPinOwners.get(pin) ?? []).filter((owner) => owner !== pairIndex);
    if (owners.length === 0) {
      return null;
    }
    const otherPairs = Array.from(new Set(owners)).map((index) => `#${index + 1}`).join(", ");
    return `Pin ${pin} is already used by pair ${otherPairs}.`;
  };

  return (
<article className="panel" hidden={!isConnectorSubScreen} data-form-panel={FORM_PANEL_IDS.connector}>
  {renderFormHeader(
    connectorFormMode === "create" ? "Create Connector" : connectorFormMode === "edit" ? "Edit Connector" : "Connector form",
    connectorFormMode
  )}
  {connectorFormMode === "idle" ? renderIdleCopy("connector", connectorHandlers.resetConnectorForm) : (
  <form className="stack-form" onSubmit={connectorHandlers.handleConnectorSubmit}>
    <label>
      Functional name
      <input value={connectorName} onChange={(event) => setConnectorName(event.target.value)} placeholder="Rear body connector" required />
    </label>
    <label>
      Technical ID
      <input value={connectorTechnicalId} onChange={(event) => setConnectorTechnicalId(event.target.value)} placeholder="C-001" required />
    </label>
    <label>
      Catalog item (manufacturer reference)
      <select
        value={connectorCatalogItemId}
        onChange={(event) => setConnectorCatalogItemId(event.target.value)}
        required
        disabled={!hasCatalogItems}
      >
        <option value="">Select a catalog item</option>
        {catalogItemOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    {!hasCatalogItems ? (
      <div className="row-actions compact">
        <small className="inline-error">Create a catalog item first to define manufacturer reference and connection count.</small>
        <button type="button" className="button-with-icon" onClick={openCatalogSubScreen}>
          <span className="action-button-icon is-catalog" aria-hidden="true" />
          Open Catalog
        </button>
      </div>
    ) : null}
    {connectorManufacturerReference.trim().length > 0 ? (
      <small className="meta-line">
        {selectedCatalogItem === undefined ? (
          `Manufacturer reference: ${connectorManufacturerReference}`
        ) : (
          <EntityReferenceButton
            title={`Open catalog item ${connectorManufacturerReference}`}
            onClick={() => onSelectCatalogItem(selectedCatalogItem.id)}
          >
            Manufacturer reference: <span className="technical-id">{connectorManufacturerReference}</span>
          </EntityReferenceButton>
        )}
      </small>
    ) : null}
    {connectorTechnicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}
    <label>
      Way count (from catalog)
      <input type="number" min={1} step={1} value={cavityCount} readOnly required />
    </label>
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={connectorIsMainHarnessConnector}
        onChange={(event) => setConnectorIsMainHarnessConnector(event.target.checked)}
      />
      Main harness connector for functional view
    </label>
    {connectorCatalogFuseBoxPairs !== undefined && connectorCatalogFuseBoxPairs.length > 0 ? (
      <fieldset className="inline-fieldset fuse-rating-editor">
        <legend>
          Fuse ratings
          <button type="button" className="link-button fuse-rating-clear-action" onClick={clearConnectorFusePairRatings}>
            Clear all
          </button>
          <button type="button" className="link-button fuse-rating-clear-action" onClick={resetConnectorFusePairOverridesToCatalog}>
            Reset pairs to catalog
          </button>
        </legend>
        <div className="fuse-rating-table" role="table" aria-label="Fuse ratings">
          <div className="fuse-rating-row fuse-rating-row--header" role="row">
            <span role="columnheader">Pair</span>
            <span role="columnheader">Pins</span>
            <span role="columnheader">Rating</span>
          </div>
          {connectorCatalogFuseBoxPairs.map((pair) => {
            const draft = connectorFusePairRatings[pair.pairIndex] ?? "";
            const draftError = getFusePairRatingDraftError(draft);
            const pinDraft = connectorFusePairOverrides[pair.pairIndex] ?? {
              pinA: String(pair.pinA),
              pinB: String(pair.pinB)
            };
            const pinError = getFusePairOverrideDraftError(pinDraft, cavityCountForValidation);
            const presetMenuId = `fuse-rating-preset-menu-${pair.pairIndex}`;
            const isPresetMenuOpen = openFuseRatingPresetPairIndex === pair.pairIndex;
            const conflictA = describeDuplicatePinConflict(pair.pairIndex, pinDraft.pinA);
            const conflictB = describeDuplicatePinConflict(pair.pairIndex, pinDraft.pinB);
            const pinConflict = conflictA ?? conflictB;
            const hasRowMessages = pinError !== null || pinConflict !== null || draftError !== null;
            return (
              <div
                className={`fuse-rating-row${draftError === null && pinError === null ? "" : " has-error"}`}
                key={pair.pairIndex}
                role="row"
                data-fuse-rating-invalid={draftError === null ? undefined : "true"}
                data-fuse-pair-invalid={pinError === null ? undefined : "true"}
              >
                <span className="fuse-rating-pair" role="cell">
                  #{pair.pairIndex + 1}
                </span>
                <span className="fuse-rating-pins" role="cell">
                  <label className="fuse-rating-pin-input-label">
                    <span className="sr-only">{`Pin A for fuse pair ${pair.pairIndex + 1}`}</span>
                    <span className="fuse-rating-pin-prefix" aria-hidden="true">PIN</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      max={cavityCountForValidation}
                      value={pinDraft.pinA}
                      aria-invalid={pinError === null ? undefined : true}
                      onChange={(event) =>
                        updateConnectorFusePairOverride(pair.pairIndex, "pinA", event.target.value)
                      }
                    />
                  </label>
                  <span className="fuse-rating-pin-separator" aria-hidden="true">-</span>
                  <label className="fuse-rating-pin-input-label">
                    <span className="sr-only">{`Pin B for fuse pair ${pair.pairIndex + 1}`}</span>
                    <span className="fuse-rating-pin-prefix" aria-hidden="true">PIN</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      max={cavityCountForValidation}
                      value={pinDraft.pinB}
                      aria-invalid={pinError === null ? undefined : true}
                      onChange={(event) =>
                        updateConnectorFusePairOverride(pair.pairIndex, "pinB", event.target.value)
                      }
                    />
                  </label>
                </span>
                <span className="fuse-rating-value-cell" role="cell">
                  <label className="fuse-rating-input-label">
                    <span className="sr-only">
                      Rating for fuse pair {pair.pairIndex + 1}, pins {pair.pinA} and {pair.pinB}, in amperes
                    </span>
                    <span className="fuse-rating-unit-prefix" aria-hidden="true">Amp</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={draft}
                      aria-invalid={draftError === null ? undefined : true}
                      onChange={(event) => {
                        updateConnectorFusePairRating(pair.pairIndex, event.target.value);
                        setOpenFuseRatingPresetPairIndex(null);
                      }}
                    />
                  </label>
                  <span
                    className="fuse-rating-preset-menu"
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setOpenFuseRatingPresetPairIndex(null);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="fuse-rating-preset-button"
                      aria-label={`Choose preset rating for fuse pair ${pair.pairIndex + 1}`}
                      aria-haspopup="menu"
                      aria-expanded={isPresetMenuOpen}
                      aria-controls={presetMenuId}
                      title={`Choose preset rating for fuse pair ${pair.pairIndex + 1}`}
                      onClick={() =>
                        setOpenFuseRatingPresetPairIndex(isPresetMenuOpen ? null : pair.pairIndex)
                      }
                    >
                      <span className="action-button-icon is-edit" aria-hidden="true" />
                    </button>
                    {isPresetMenuOpen ? (
                      <span className="fuse-rating-preset-options" id={presetMenuId} role="menu">
                        {FUSE_RATING_QUICK_PICKS.map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            className="fuse-rating-preset-option"
                            role="menuitem"
                            onClick={() => {
                              updateConnectorFusePairRating(pair.pairIndex, rating);
                              setOpenFuseRatingPresetPairIndex(null);
                            }}
                          >
                            {rating} A
                          </button>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </span>
                {hasRowMessages ? (
                  <span className="fuse-rating-row-messages">
                    {pinError === null ? null : <small className="inline-error fuse-rating-row-error">{pinError}</small>}
                    {pinConflict === null ? null : <small className="fuse-rating-row-warning" role="status">{pinConflict}</small>}
                    {draftError === null ? null : <small className="inline-error fuse-rating-row-error">{draftError}</small>}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>
    ) : null}
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={connectorAutoCreateLinkedNode}
        onChange={(event) => setConnectorAutoCreateLinkedNode(event.target.checked)}
        disabled={connectorFormMode !== "create"}
      />
      Auto-create linked node on connector creation
    </label>
    <div className="row-actions">
      <button
        type="submit"
        className="button-with-icon"
        disabled={connectorTechnicalIdAlreadyUsed || !hasCatalogItems || connectorCatalogItemId.trim().length === 0}
      >
        {connectorFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {connectorFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {connectorFormMode === "create" ? "Create" : "Save"}
      </button>
      {connectorFormMode === "edit" && connectorEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={connectorHandlers.resetConnectorForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          New
        </button>
      ) : null}
      <button
        type="button"
        className={connectorFormMode === "edit" ? "button-with-icon" : undefined}
        onClick={connectorHandlers.cancelConnectorEdit}
      >
        {connectorFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {connectorFormMode === "edit" ? "Cancel edit" : "Cancel"}
      </button>
    </div>
    {connectorFormError !== null ? <small className="inline-error">{connectorFormError}</small> : null}
  </form>
  )}
</article>
  );
}
