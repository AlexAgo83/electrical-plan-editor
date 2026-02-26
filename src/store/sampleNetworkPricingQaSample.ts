import type { CatalogItemId, ConnectorId, NetworkId, SpliceId } from "../core/entities";
import { appActions } from "./actions";
import { appReducer } from "./reducer";
import { createSampleNetworkState } from "./sampleNetwork";
import type { AppState } from "./types";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

export function createPricingBomQaSampleNetworkState(): AppState {
  const base = createSampleNetworkState();
  const activeNetworkId = base.activeNetworkId as NetworkId;

  return [
    appActions.updateNetwork(
      activeNetworkId,
      "Pricing / BOM QA sample",
      "NET-PRICING-BOM-QA-SAMPLE",
      "2026-02-27T00:00:00.000Z"
    ),
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-QA-BOM-PRICE"),
      manufacturerReference: "QA-BOM-PRICE-19-99",
      name: "QA priced component",
      connectionCount: 4,
      unitPriceExclTax: 19.99,
      url: "https://example.com/qa-priced-component"
    }),
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-QA-BOM-NOPRICE"),
      manufacturerReference: "QA-BOM-NOPRICE",
      name: "QA component without price",
      connectionCount: 2
    }),
    appActions.upsertConnector({
      id: asConnectorId("C-QA-BOM-1"),
      name: "QA BOM Connector A",
      technicalId: "CONN-QA-BOM-A",
      cavityCount: 4,
      catalogItemId: asCatalogItemId("CAT-QA-BOM-PRICE")
    }),
    appActions.upsertConnector({
      id: asConnectorId("C-QA-BOM-2"),
      name: "QA BOM Connector B",
      technicalId: "CONN-QA-BOM-B",
      cavityCount: 4,
      catalogItemId: asCatalogItemId("CAT-QA-BOM-PRICE")
    }),
    appActions.upsertSplice({
      id: asSpliceId("S-QA-BOM-1"),
      name: "QA BOM Splice",
      technicalId: "SPL-QA-BOM-1",
      portCount: 2,
      catalogItemId: asCatalogItemId("CAT-QA-BOM-NOPRICE")
    })
  ].reduce(appReducer, base);
}
