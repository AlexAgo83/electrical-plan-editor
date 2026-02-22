import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { appUiModulesEager } from "../app/components/appUiModules.eager";
import {
  resetAppUiModulesTestControls,
  setAppUiModulesEagerRegistryForTests
} from "../app/components/appUiModules";

setAppUiModulesEagerRegistryForTests(appUiModulesEager);

afterEach(() => {
  resetAppUiModulesTestControls();
  setAppUiModulesEagerRegistryForTests(appUiModulesEager);
  cleanup();
});
