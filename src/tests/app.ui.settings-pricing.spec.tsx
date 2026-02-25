import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - settings pricing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the workspace currency preference and resets it to EUR", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)"), {
      target: { value: "USD" }
    });

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredPricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    expect(within(restoredPricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)")).toHaveValue("USD");

    const globalSettingsPanel = getPanelByHeading("Global preferences");
    fireEvent.click(within(globalSettingsPanel).getByRole("button", { name: "Reset all UI preferences" }));
    expect(within(restoredPricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)")).toHaveValue("EUR");
  });

  it("shows catalog and bom pricing defaults and preserves tax rate when tax is disabled", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    const currencySelect = within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)");
    const taxEnabledToggle = within(pricingSettingsPanel).getByLabelText("Enable tax / VAT (TVA)");
    const taxRateInput = within(pricingSettingsPanel).getByLabelText("Tax rate (%)");

    expect(currencySelect).toHaveValue("EUR");
    expect(taxEnabledToggle).toBeChecked();
    expect(taxRateInput).toHaveValue(20);
    expect(taxRateInput).toBeEnabled();

    fireEvent.change(taxRateInput, { target: { value: "5.5" } });
    expect(taxRateInput).toHaveValue(5.5);

    fireEvent.click(taxEnabledToggle);
    expect(taxEnabledToggle).not.toBeChecked();
    expect(taxRateInput).toBeDisabled();
    expect(taxRateInput).toHaveValue(5.5);

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredPricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    expect(within(restoredPricingSettingsPanel).getByLabelText("Enable tax / VAT (TVA)")).not.toBeChecked();
    expect(within(restoredPricingSettingsPanel).getByLabelText("Tax rate (%)")).toBeDisabled();
    expect(within(restoredPricingSettingsPanel).getByLabelText("Tax rate (%)")).toHaveValue(5.5);
  });

  it("normalizes malformed persisted catalog and bom pricing settings to safe defaults", () => {
    localStorage.setItem(
      "electrical-plan-editor.ui-preferences.v1",
      JSON.stringify({
        schemaVersion: 1,
        workspaceCurrencyCode: "JPY",
        workspaceTaxEnabled: "yes",
        workspaceTaxRatePercent: -42
      })
    );

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");

    expect(within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)")).toHaveValue("EUR");
    expect(within(pricingSettingsPanel).getByLabelText("Enable tax / VAT (TVA)")).toBeChecked();
    expect(within(pricingSettingsPanel).getByLabelText("Tax rate (%)")).toHaveValue(20);
  });
});

