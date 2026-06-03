import type { FormEvent, ReactElement } from "react";
import { createDefaultConnectorLayout } from "../../../core/connectorLayout";
import type { CatalogAdditionalAccessory, ConnectorLayout } from "../../../core/entities";
import { isValidCatalogUrlInput } from "../../../store";
import { FORM_PANEL_IDS, scrollToFormPanel } from "../../lib/form-panel-scroll";
import type { WorkspaceCurrencyCode } from "../../types/app-controller";
import { ConnectorLayoutEditor } from "./ConnectorLayoutEditor";
import { renderFormHeader } from "./ModelingFormsColumn.shared";
import { PinElectricalRolesEditor } from "./PinElectricalRolesEditor";
import type { ConnectorPinElectricalRoleDrafts } from "../../hooks/connectorPinElectricalRoles";

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
  catalogAdditionalAccessories: CatalogAdditionalAccessory[];
  setCatalogAdditionalAccessories: (value: CatalogAdditionalAccessory[]) => void;
  catalogShowAdditionalAccessories: boolean;
  setCatalogShowAdditionalAccessories: (value: boolean) => void;
  catalogShowConnectorMaterialDefaults: boolean;
  setCatalogShowConnectorMaterialDefaults: (value: boolean) => void;
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
  catalogShowConnectorPhysicalLayout: boolean;
  setCatalogShowConnectorPhysicalLayout: (value: boolean) => void;
  catalogManufacturerReferenceAlreadyUsed: boolean;
  cancelCatalogEdit: () => void;
  catalogIsFuseBox: boolean;
  setCatalogIsFuseBox: (v: boolean) => void;
  catalogShowPinElectricalRoles: boolean;
  setCatalogShowPinElectricalRoles: (value: boolean) => void;
  catalogPinElectricalRoleDrafts: ConnectorPinElectricalRoleDrafts;
  setCatalogPinElectricalRoleDrafts: (value: ConnectorPinElectricalRoleDrafts) => void;
  catalogPinElectricalRoleSelection: number[];
  setCatalogPinElectricalRoleSelection: (value: number[]) => void;
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
  catalogAdditionalAccessories,
  setCatalogAdditionalAccessories,
  catalogShowAdditionalAccessories,
  setCatalogShowAdditionalAccessories,
  catalogShowConnectorMaterialDefaults,
  setCatalogShowConnectorMaterialDefaults,
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
  catalogShowConnectorPhysicalLayout,
  setCatalogShowConnectorPhysicalLayout,
  catalogManufacturerReferenceAlreadyUsed,
  cancelCatalogEdit,
  catalogIsFuseBox,
  setCatalogIsFuseBox,
  catalogShowPinElectricalRoles,
  setCatalogShowPinElectricalRoles,
  catalogPinElectricalRoleDrafts,
  setCatalogPinElectricalRoleDrafts,
  catalogPinElectricalRoleSelection,
  setCatalogPinElectricalRoleSelection,
  catalogFormError
}: ModelingCatalogFormPanelProps): ReactElement | null {
  void _openCreateCatalogForm;
  const hasUrlValidationError = catalogUrl.trim().length > 0 && !isValidCatalogUrlInput(catalogUrl);
  const showPanel = isCatalogSubScreen && catalogFormMode !== "idle";
  const catalogSubmitDisabled = catalogManufacturerReferenceAlreadyUsed || hasUrlValidationError;
  const catalogSubmitLabel = catalogFormMode === "create" ? "Create" : "Save";

  if (!showPanel) {
    return null;
  }

  function renderCatalogSubmitButton(): ReactElement {
    return (
      <button type="submit" className="button-with-icon" disabled={catalogSubmitDisabled}>
        {catalogFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {catalogFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {catalogSubmitLabel}
      </button>
    );
  }

  function renderCatalogFormError(): ReactElement | null {
    return catalogFormError !== null ? <small className="inline-error">{catalogFormError}</small> : null;
  }

  function resolveCatalogLayoutConnectionCount(): number {
    const parsed = Number(catalogConnectionCount);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }

  function updateAdditionalAccessory(index: number, patch: Partial<CatalogAdditionalAccessory>): void {
    setCatalogAdditionalAccessories(
      catalogAdditionalAccessories.map((accessory, accessoryIndex) =>
        accessoryIndex === index ? { ...accessory, ...patch } : accessory
      )
    );
  }

  return (
    <form className="stack-form catalog-item-edit-form" onSubmit={handleCatalogSubmit}>
      <article
        className="panel"
        data-onboarding-panel="modeling-catalog-edit"
        data-form-panel={FORM_PANEL_IDS.catalog}
      >
        {renderFormHeader(
          catalogFormMode === "create" ? "Create catalog item" : "Edit catalog item",
          catalogFormMode
        )}
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
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogIsFuseBox}
            onChange={(event) => setCatalogIsFuseBox(event.target.checked)}
          />
          Fuse box
        </label>
        {catalogIsFuseBox ? (
          <small className="meta-line">
            Auto pairs:{" "}
            {Array.from({ length: Math.floor(Number(catalogConnectionCount) / 2) || 0 }, (_, i) =>
              `(${i * 2 + 1}↔${i * 2 + 2})`
            ).join(", ") || "(none)"}
          </small>
        ) : null}
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
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowAdditionalAccessories}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowAdditionalAccessories(checked);
              if (!checked) {
                setCatalogAdditionalAccessories([]);
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogAdditionalAccessories);
              }
            }}
          />
          Additional accessories
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowConnectorMaterialDefaults}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowConnectorMaterialDefaults(checked);
              if (!checked) {
                setCatalogAllSameTerminals(false);
                setCatalogDefaultTerminalReference("");
                setCatalogDefaultTerminalName("");
                setCatalogDefaultSealReference("");
                setCatalogDefaultSealName("");
                setCatalogPlugDefinitionsText("");
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogConnectorDefaults);
              }
            }}
          />
          Connector material defaults
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowPinElectricalRoles}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowPinElectricalRoles(checked);
              if (!checked) {
                setCatalogPinElectricalRoleDrafts({});
                setCatalogPinElectricalRoleSelection([]);
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogPinElectricalRoles);
              }
            }}
          />
          Pin electric roles
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowConnectorPhysicalLayout}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowConnectorPhysicalLayout(checked);
              if (!checked) {
                setCatalogConnectorLayout(undefined);
              } else if (catalogConnectorLayout === undefined) {
                setCatalogConnectorLayout(createDefaultConnectorLayout(resolveCatalogLayoutConnectionCount()));
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogConnectorLayout);
              }
            }}
          />
          Connector physical layout
        </label>
        <div className="row-actions catalog-item-submit-actions">
          {renderCatalogSubmitButton()}
          <button type="button" className={catalogFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelCatalogEdit}>
            {catalogFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
            {catalogFormMode === "edit" ? "Cancel edit" : "Cancel"}
          </button>
        </div>
        {renderCatalogFormError()}
      </article>

      {catalogShowAdditionalAccessories ? (
        <article className="panel catalog-accessories-panel" data-form-panel={FORM_PANEL_IDS.catalogAdditionalAccessories}>
          {renderFormHeader("Additional accessories", catalogFormMode)}
          <div className="catalog-accessory-panel-toolbar">
            <span className="catalog-accessory-count">
              {catalogAdditionalAccessories.length === 0
                ? "No accessory"
                : `${catalogAdditionalAccessories.length} ${catalogAdditionalAccessories.length === 1 ? "accessory" : "accessories"}`}
            </span>
            <button
              type="button"
              className="button-with-icon catalog-accessory-action-button"
              onClick={() =>
                setCatalogAdditionalAccessories([
                  ...catalogAdditionalAccessories,
                  { accessoryReference: "", accessoryName: "" }
                ])
              }
            >
              <span className="action-button-icon is-new" aria-hidden="true" />
              Add additional accessory
            </button>
          </div>
          <div className="catalog-accessory-list">
            {catalogAdditionalAccessories.length > 0 ? (
              <div className="catalog-accessory-row catalog-accessory-row-header" aria-hidden="true">
                <span />
                <span>Reference</span>
                <span>Name</span>
                <span />
              </div>
            ) : null}
            {catalogAdditionalAccessories.length === 0 ? (
              <div className="catalog-accessory-empty-state">
                <span className="action-button-icon is-catalog" aria-hidden="true" />
                <small className="meta-line">No additional accessory.</small>
              </div>
            ) : null}
            {catalogAdditionalAccessories.map((accessory, index) => (
              <div className="catalog-accessory-row" key={index}>
                <span className="catalog-accessory-index" aria-hidden="true">
                  {index + 1}
                </span>
                <label className="catalog-accessory-field">
                  <span className="visually-hidden">
                  Accessory reference
                  </span>
                  <input
                    aria-label="Accessory reference"
                    value={accessory.accessoryReference}
                    onChange={(event) => updateAdditionalAccessory(index, { accessoryReference: event.target.value })}
                    placeholder="Reference"
                    maxLength={120}
                  />
                </label>
                <label className="catalog-accessory-field">
                  <span className="visually-hidden">
                  Accessory name
                  </span>
                  <input
                    aria-label="Accessory name"
                    value={accessory.accessoryName ?? ""}
                    onChange={(event) => updateAdditionalAccessory(index, { accessoryName: event.target.value })}
                    placeholder="Name"
                  />
                </label>
                <button
                  type="button"
                  className="button-with-icon catalog-accessory-action-button catalog-accessory-remove-button"
                  aria-label={`Remove accessory ${index + 1}`}
                  title={`Remove accessory ${index + 1}`}
                  onClick={() =>
                    setCatalogAdditionalAccessories(
                      catalogAdditionalAccessories.filter((_accessory, accessoryIndex) => accessoryIndex !== index)
                    )
                  }
                >
                  <span className="action-button-icon is-delete" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}

      {catalogShowConnectorMaterialDefaults ? (
        <article className="panel catalog-material-defaults-panel" data-form-panel={FORM_PANEL_IDS.catalogConnectorDefaults}>
          {renderFormHeader("Connector material defaults", catalogFormMode)}
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
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}

      {catalogShowPinElectricalRoles ? (
        <article className="panel catalog-pin-electrical-roles-panel" data-form-panel={FORM_PANEL_IDS.catalogPinElectricalRoles}>
          {renderFormHeader("Pin electric roles", catalogFormMode)}
          <PinElectricalRolesEditor
            cavityCount={Number(catalogConnectionCount)}
            drafts={catalogPinElectricalRoleDrafts}
            setDrafts={setCatalogPinElectricalRoleDrafts}
            selection={catalogPinElectricalRoleSelection}
            setSelection={setCatalogPinElectricalRoleSelection}
            catalogItem={undefined}
            mode="panel"
            title="Pin electric roles"
            showPanelHeader={false}
          />
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}

      {catalogShowConnectorPhysicalLayout ? (
        <article className="panel catalog-connector-layout-panel" data-form-panel={FORM_PANEL_IDS.catalogConnectorLayout}>
          {renderFormHeader("Connector physical layout", catalogFormMode)}
          <ConnectorLayoutEditor
            connectionCount={catalogConnectionCount}
            connectorLayout={catalogConnectorLayout}
            setConnectorLayout={setCatalogConnectorLayout}
            showLegend={false}
          />
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
            <button
              type="button"
              className="button-with-icon"
              onClick={() => setCatalogConnectorLayout(createDefaultConnectorLayout(resolveCatalogLayoutConnectionCount()))}
            >
              <span className="action-button-icon is-catalog" aria-hidden="true" />
              Auto layout
            </button>
            <button type="button" className="button-with-icon" onClick={() => setCatalogConnectorLayout(undefined)}>
              <span className="action-button-icon is-cancel" aria-hidden="true" />
              Clear custom layout
            </button>
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}
    </form>
  );
}

export type { ModelingCatalogFormPanelProps };
