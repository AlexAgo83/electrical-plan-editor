import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  resetAppUiModulesNonRegistryTestControls,
  setAppUiModulesLazyImportDelayForTests,
  setAppUiModulesLoadingModeForTests
} from "../app/components/appUiModules";
import {
  createUiIntegrationState,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - lazy loading regression coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    resetAppUiModulesNonRegistryTestControls();
  });

  afterEach(() => {
    resetAppUiModulesNonRegistryTestControls();
  });

  it("keeps shell chrome visible while initial workspace lazy modules load", async () => {
    setAppUiModulesLoadingModeForTests("lazy");
    setAppUiModulesLazyImportDelayForTests(25);

    renderAppWithState(createUiIntegrationState());

    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Loading workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Network Scope" })).toBeInTheDocument();
  });

  it("shows workspace fallback for a lazily loaded screen switch without blanking shell chrome", async () => {
    renderAppWithState(createUiIntegrationState());
    expect(await screen.findByRole("heading", { name: "Network Scope" })).toBeInTheDocument();

    setAppUiModulesLoadingModeForTests("lazy");
    setAppUiModulesLazyImportDelayForTests(25);

    switchScreenDrawerAware("validation");

    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Loading workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Validation center" })).toBeInTheDocument();
  });
});
