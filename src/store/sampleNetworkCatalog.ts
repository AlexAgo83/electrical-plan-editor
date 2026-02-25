import type { CatalogItemId } from "../core/entities";
import { appActions, type AppAction } from "./actions";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

export const mainSampleCatalogIds = {
  powerSource12Way: asCatalogItemId("CAT-SAMPLE-SRC-12W"),
  actuator8Way: asCatalogItemId("CAT-SAMPLE-ACT-8W"),
  mainJunction10Port: asCatalogItemId("CAT-SAMPLE-J1-10P"),
  branchJunction8Port: asCatalogItemId("CAT-SAMPLE-J2-8P")
} as const;

export const lightingDemoCatalogIds = {
  source6Way: asCatalogItemId("CAT-LIGHT-SRC-6W"),
  lamp4Way: asCatalogItemId("CAT-LIGHT-LAMP-4W"),
  split4Port: asCatalogItemId("CAT-LIGHT-SPLIT-4P")
} as const;

export const sensorDemoCatalogIds = {
  ecu12Way: asCatalogItemId("CAT-SENSOR-ECU-12W"),
  sensor4Way: asCatalogItemId("CAT-SENSOR-CONN-4W"),
  groundSplice6Port: asCatalogItemId("CAT-SENSOR-GND-6P")
} as const;

export const validationSampleCatalogIds = {
  powerSource12Way: asCatalogItemId("CAT-VALID-SRC-12W"),
  actuator8Way: asCatalogItemId("CAT-VALID-ACT-8W"),
  mainJunction10Port: asCatalogItemId("CAT-VALID-J1-10P"),
  branchJunction8Port: asCatalogItemId("CAT-VALID-J2-8P")
} as const;

export function buildMainSampleCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: mainSampleCatalogIds.powerSource12Way,
      manufacturerReference: "SAMPLE-CAT-SRC-12W",
      name: "Sample source connector 12-way",
      connectionCount: 12,
      unitPriceExclTax: 10.5
    }),
    appActions.upsertCatalogItem({
      id: mainSampleCatalogIds.actuator8Way,
      manufacturerReference: "SAMPLE-CAT-ACT-8W",
      name: "Sample actuator connector 8-way",
      connectionCount: 8,
      unitPriceExclTax: 7.25
    }),
    appActions.upsertCatalogItem({
      id: mainSampleCatalogIds.mainJunction10Port,
      manufacturerReference: "SAMPLE-CAT-J1-10P",
      name: "Sample main junction 10-port",
      connectionCount: 10,
      unitPriceExclTax: 5.9
    }),
    appActions.upsertCatalogItem({
      id: mainSampleCatalogIds.branchJunction8Port,
      manufacturerReference: "SAMPLE-CAT-J2-8P",
      name: "Sample branch junction 8-port",
      connectionCount: 8,
      unitPriceExclTax: 5.1
    })
  ];
}

export function buildLightingDemoCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: lightingDemoCatalogIds.source6Way,
      manufacturerReference: "LIGHT-CAT-SRC-6W",
      name: "Lighting source connector 6-way",
      connectionCount: 6,
      unitPriceExclTax: 6.8
    }),
    appActions.upsertCatalogItem({
      id: lightingDemoCatalogIds.lamp4Way,
      manufacturerReference: "LIGHT-CAT-LAMP-4W",
      name: "Lamp connector 4-way",
      connectionCount: 4,
      unitPriceExclTax: 4.2
    }),
    appActions.upsertCatalogItem({
      id: lightingDemoCatalogIds.split4Port,
      manufacturerReference: "LIGHT-CAT-SPLIT-4P",
      name: "Lighting split splice 4-port",
      connectionCount: 4,
      unitPriceExclTax: 3.75
    })
  ];
}

export function buildSensorDemoCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: sensorDemoCatalogIds.ecu12Way,
      manufacturerReference: "SENSOR-CAT-ECU-12W",
      name: "Sensor ECU connector 12-way",
      connectionCount: 12,
      unitPriceExclTax: 11.4
    }),
    appActions.upsertCatalogItem({
      id: sensorDemoCatalogIds.sensor4Way,
      manufacturerReference: "SENSOR-CAT-CONN-4W",
      name: "Sensor connector 4-way",
      connectionCount: 4,
      unitPriceExclTax: 3.95
    }),
    appActions.upsertCatalogItem({
      id: sensorDemoCatalogIds.groundSplice6Port,
      manufacturerReference: "SENSOR-CAT-GND-6P",
      name: "Sensor ground splice 6-port",
      connectionCount: 6,
      unitPriceExclTax: 4.8
    })
  ];
}

export function buildValidationSampleCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: validationSampleCatalogIds.powerSource12Way,
      manufacturerReference: "VAL-CAT-SRC-12W",
      name: "Validation source connector 12-way",
      connectionCount: 12,
      unitPriceExclTax: 12
    }),
    appActions.upsertCatalogItem({
      id: validationSampleCatalogIds.actuator8Way,
      manufacturerReference: "VAL-CAT-ACT-8W",
      name: "Validation actuator connector 8-way",
      connectionCount: 8,
      unitPriceExclTax: 8.5
    }),
    appActions.upsertCatalogItem({
      id: validationSampleCatalogIds.mainJunction10Port,
      manufacturerReference: "VAL-CAT-J1-10P",
      name: "Validation main junction 10-port",
      connectionCount: 10,
      unitPriceExclTax: 6.25
    }),
    appActions.upsertCatalogItem({
      id: validationSampleCatalogIds.branchJunction8Port,
      manufacturerReference: "VAL-CAT-J2-8P",
      name: "Validation branch junction 8-port",
      connectionCount: 8,
      unitPriceExclTax: 5.5
    })
  ];
}
