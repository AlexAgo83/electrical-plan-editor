import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { appUiModulesEager } from "../app/components/appUiModules.eager";
import {
  resetAppUiModulesNonRegistryTestControls,
  setAppUiModulesEagerRegistryForTests
} from "../app/components/appUiModules";

setAppUiModulesEagerRegistryForTests(appUiModulesEager);

afterEach(() => {
  resetAppUiModulesNonRegistryTestControls();
  setAppUiModulesEagerRegistryForTests(appUiModulesEager);
  cleanup();
});
