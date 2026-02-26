import type { CatalogItemId, NetworkId } from "../core/entities";
import { appActions } from "./actions";
import { appReducer } from "./reducer";
import { createSampleNetworkState } from "./sampleNetwork";
import type { AppState } from "./types";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

export function createCatalogValidationIssuesSampleNetworkState(): AppState {
  const base = createSampleNetworkState();
  const activeNetworkId = base.activeNetworkId as NetworkId;
  const renamed = appReducer(
    base,
    appActions.updateNetwork(
      activeNetworkId,
      "Catalog validation issues sample",
      "NET-CATALOG-VALIDATION-SAMPLE",
      "2026-02-26T00:00:00.000Z"
    )
  );
  const activeScoped = renamed.networkStates[activeNetworkId];
  if (activeScoped === undefined) {
    throw new Error("Expected active network scoped state in catalog validation sample.");
  }

  const invalidCatalogItems = {
    [asCatalogItemId("CAT-VAL-URL")]: {
      id: asCatalogItemId("CAT-VAL-URL"),
      manufacturerReference: "CAT-VAL-URL",
      connectionCount: 4,
      url: "notaurl"
    },
    [asCatalogItemId("CAT-VAL-COUNT")]: {
      id: asCatalogItemId("CAT-VAL-COUNT"),
      manufacturerReference: "CAT-VAL-COUNT",
      connectionCount: 0
    },
    [asCatalogItemId("CAT-VAL-EMPTY-REF")]: {
      id: asCatalogItemId("CAT-VAL-EMPTY-REF"),
      manufacturerReference: "   ",
      connectionCount: 2
    },
    [asCatalogItemId("CAT-VAL-DUP-A")]: {
      id: asCatalogItemId("CAT-VAL-DUP-A"),
      manufacturerReference: "CAT-VAL-DUP",
      connectionCount: 6
    },
    [asCatalogItemId("CAT-VAL-DUP-B")]: {
      id: asCatalogItemId("CAT-VAL-DUP-B"),
      manufacturerReference: "CAT-VAL-DUP",
      connectionCount: 8
    }
  } as const;

  const invalidCatalogItemIds = Object.keys(invalidCatalogItems) as CatalogItemId[];

  return {
    ...renamed,
    catalogItems: {
      byId: {
        ...renamed.catalogItems.byId,
        ...invalidCatalogItems
      },
      allIds: [...renamed.catalogItems.allIds, ...invalidCatalogItemIds]
    },
    networkStates: {
      ...renamed.networkStates,
      [activeNetworkId]: {
        ...activeScoped,
        catalogItems: {
          byId: {
            ...activeScoped.catalogItems.byId,
            ...invalidCatalogItems
          },
          allIds: [...activeScoped.catalogItems.allIds, ...invalidCatalogItemIds]
        }
      }
    }
  };
}
