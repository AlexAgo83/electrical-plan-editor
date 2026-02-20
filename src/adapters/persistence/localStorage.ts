import { APP_SCHEMA_VERSION } from "../../core/schema";
import { createInitialState, type AppState } from "../../store";

export const STORAGE_KEY = "electrical-plan-editor.state";

function isAppState(candidate: unknown): candidate is AppState {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }

  const value = candidate as Partial<AppState>;
  return value.schemaVersion === APP_SCHEMA_VERSION;
}

export function loadState(storage: Pick<Storage, "getItem"> = window.localStorage): AppState {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isAppState(parsed)) {
      return parsed;
    }
  } catch {
    return createInitialState();
  }

  return createInitialState();
}

export function saveState(
  state: AppState,
  storage: Pick<Storage, "setItem"> = window.localStorage
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
