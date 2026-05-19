import type { FormEvent, ReactElement } from "react";
import type { ConnectorLayout } from "../../../core/entities";
import { isValidCatalogUrlInput } from "../../../store";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import type { WorkspaceCurrencyCode } from "../../types/app-controller";
import { ConnectorLayoutEditor } from "./ConnectorLayoutEditor";
import { renderFormHeader } from "./ModelingFormsColumn.shared";

interface ModelingCatalogFormPanelProps {
  isCatalogSubScreen: boolean;
  catalogFormMode: "idle" | "create" | "edit";
  openCreateCatalogForm: () => void;
  handleCatalogSubmit: (event: FormEvent<HTMLFormElement>) => void;
  catalogManufacturerReference: string;
  setCatalogManufacturerReference: (value: string) => void;
  catalogConnectionCount: string;
  setCatalogConnectionCount: (value: string) => void;
  catalogName: string;
  setCatalogName: (value: string) => void;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  catalogUnitPriceExclTax: string;
  setCatalogUnitPriceExclTax: (value: string) => void;
  catalogUrl: string;
  setCatalogUrl: (value: string) => void;
  catalogAllSameTerminals: boolean;
  setCatalogAllSameTerminals: (value: boolean) => void;
  catalogDefaultTerminalReference: string;
  setCatalogDefaultTerminalReference: (value: string) => void;
  catalogDefaultTerminalName: string;
  setCatalogDefaultTerminalName: (value: string) => void;
  catalogDefaultSealReference: string;
  setCatalogDefaultSealReference: (value: string) => void;
  catalogDefaultSealName: string;
  setCatalogDefaultSealName: (value: string) => void;
  catalogPlugDefinitionsText: string;
  setCatalogPlugDefinitionsText: (value: string) => void;
  catalogConnectorLayout: ConnectorLayout | undefined;
  setCatalogConnectorLayout: (value: ConnectorLayout | undefined) => void;
  catalogManufacturerReferenceAlreadyUsed: boolean;
  cancelCatalogEdit: () => void;
  catalogFormError: string | null;
}

export function ModelingCatalogFormPanel({
  isCatalogSubScreen,
  catalogFormMode,
  openCreateCatalogForm: _openCreateCatalogForm,
  handleCatalogSubmit,
  catalogManufacturerReference,
  setCatalogManufacturerReference,
  catalogConnectionCount,
  setCatalogConnectionCount,
  catalogName,
  setCatalogName,
  workspaceCurrencyCode,
  catalogUnitPriceExclTax,
  setCatalogUnitPriceExclTax,
  catalogUrl,
  setCatalogUrl,
  catalogAllSameTerminals,
  setCatalogAllSameTerminals,
  catalogDefaultTerminalReference,
  setCatalogDefaultTerminalReference,
  catalogDefaultTerminalName,
  setCatalogDefaultTerminalName,
  catalogDefaultSealReference,
  setCatalogDefaultSealReference,
  catalogDefaultSealName,
  setCatalogDefaultSealName,
  catalogPlugDefinitionsText,
  setCatalogPlugDefinitionsText,
  catalogConnectorLayout,
  setCatalogConnectorLayout,
  catalogManufacturerReferenceAlreadyUsed,
  cancelCatalogEdit,
  catalogFormError
}: ModelingCatalogFormPanelProps): ReactElement {
  void _openCreateCatalogForm;
  const hasUrlValidationError = catalogUrl.trim().length > 0 && !isValidCatalogUrlInput(catalogUrl);
  const showPanel = isCatalogSubScreen && catalogFormMode !== "idle";

  return (
    <article
      className="panel"
      hidden={!showPanel}
      data-onboarding-panel="modeling-catalog-edit"
      data-form-panel={FORM_PANEL_IDS.catalog}
    >
      {renderFormHeader(
        catalogFormMode === "create" ? "Create catalog item" : "Edit catalog item",
        catalogFormMode
      )}
      {catalogFormMode !== "idle" ? (
        <form className="stack-form" onSubmit={handleCatalogSubmit}>
          <label>
            Manufacturer reference
            <input
              value={catalogManufacturerReference}
              onChange={(event) => setCatalogManufacturerReference(event.target.value)}
              placeholder="e.g. TE-1-967616-1"
              maxLength={120}
              required
            />
          </label>
          {catalogManufacturerReferenceAlreadyUsed ? (
            <small className="inline-error">This manufacturer reference is already used in this network catalog.</small>
          ) : null}
          <label>
            Connection count
            <input
              type="number"
              min={1}
              step={1}
              value={catalogConnectionCount}
              onChange={(event) => setCatalogConnectionCount(event.target.value)}
              required
            />
          </label>
          <label>
            Name
            <input value={catalogName} onChange={(event) => setCatalogName(event.target.value)} placeholder="Optional display name" />
          </label>
          <label>
            {`Unit price (excl. tax) [${workspaceCurrencyCode}]`}
            <input
              type="number"
              min={0}
              step={0.01}
              value={catalogUnitPriceExclTax}
              onChange={(event) => setCatalogUnitPriceExclTax(event.target.value)}
              placeholder="Optional"
              inputMode="decimal"
            />
          </label>
          <label>
            URL
            <input
              type="url"
              value={catalogUrl}
              onChange={(event) => setCatalogUrl(event.target.value)}
              placeholder="https://example.com/product"
            />
          </label>
          {hasUrlValidationError ? <small className="inline-error">Use an absolute http/https URL.</small> : null}
          {catalogUrl.trim().length > 0 && !hasUrlValidationError ? (
            <div className="row-actions compact">
              <a
                className="button-with-icon"
                href={catalogUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="action-button-icon is-open" aria-hidden="true" />
                Open link
              </a>
            </div>
          ) : null}
          <fieldset className="inline-fieldset">
            <legend>Connector material defaults</legend>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={catalogAllSameTerminals}
                onChange={(event) => setCatalogAllSameTerminals(event.target.checked)}
              />
              All same terminals
            </label>
            <label>
              Default terminal reference
              <input
                value={catalogDefaultTerminalReference}
                onChange={(event) => setCatalogDefaultTerminalReference(event.target.value)}
                placeholder="Optional terminal ref"
              />
            </label>
            <label>
              Default terminal name
              <input
                value={catalogDefaultTerminalName}
                onChange={(event) => setCatalogDefaultTerminalName(event.target.value)}
                placeholder="Optional terminal name"
              />
            </label>
            <label>
              Default seal reference
              <input
                value={catalogDefaultSealReference}
                onChange={(event) => setCatalogDefaultSealReference(event.target.value)}
                placeholder="Optional seal ref"
              />
            </label>
            <label>
              Default seal name
              <input
                value={catalogDefaultSealName}
                onChange={(event) => setCatalogDefaultSealName(event.target.value)}
                placeholder="Optional seal name"
              />
            </label>
            <label>
              Plug definitions
              <textarea
                value={catalogPlugDefinitionsText}
                onChange={(event) => setCatalogPlugDefinitionsText(event.target.value)}
                placeholder={"PLUG-REF,2,Plug name\nPLUG-ALT,1"}
                rows={3}
              />
            </label>
          </fieldset>
          <ConnectorLayoutEditor
            connectionCount={catalogConnectionCount}
            connectorLayout={catalogConnectorLayout}
            setConnectorLayout={setCatalogConnectorLayout}
          />
          <div className="row-actions">
            <button type="submit" className="button-with-icon" disabled={catalogManufacturerReferenceAlreadyUsed || hasUrlValidationError}>
              {catalogFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
              {catalogFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
              {catalogFormMode === "create" ? "Create" : "Save"}
            </button>
            <button type="button" className={catalogFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelCatalogEdit}>
              {catalogFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
              {catalogFormMode === "edit" ? "Cancel edit" : "Cancel"}
            </button>
          </div>
          {catalogFormError !== null ? <small className="inline-error">{catalogFormError}</small> : null}
        </form>
      ) : null}
    </article>
  );
}

export type { ModelingCatalogFormPanelProps };
