import type { CatalogItemId, ConnectorLayout, ConnectorLayoutKeyingShape, ConnectorLayoutShellShape, ConnectorLayoutWayShape } from "../core/entities";
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

export const doorDemoCatalogIds = {
  doorModule16Way: asCatalogItemId("CAT-DOOR-MODULE-16W"),
  motor6Way: asCatalogItemId("CAT-DOOR-MOTOR-6W"),
  mirror8Way: asCatalogItemId("CAT-DOOR-MIRROR-8W"),
  speaker2Way: asCatalogItemId("CAT-DOOR-SPEAKER-2W"),
  bodyPassThrough12Way: asCatalogItemId("CAT-DOOR-BODY-12W"),
  doorSplice6Port: asCatalogItemId("CAT-DOOR-SPLICE-6P")
} as const;

export const chargingDemoCatalogIds = {
  chargeInlet8Way: asCatalogItemId("CAT-CHG-INLET-8W"),
  onboardCharger12Way: asCatalogItemId("CAT-CHG-OBC-12W"),
  dcDc6Way: asCatalogItemId("CAT-CHG-DCDC-6W"),
  serviceDisconnect4Way: asCatalogItemId("CAT-CHG-SERVICE-4W"),
  hvInterlockSplice4Port: asCatalogItemId("CAT-CHG-HVIL-SPLICE-4P")
} as const;

function buildConnectorLayout(
  connectionCount: number,
  columns: number,
  options: {
    shellShape?: ConnectorLayoutShellShape;
    wayShape?: ConnectorLayoutWayShape;
    alternateWayShape?: ConnectorLayoutWayShape;
    keyingShape?: ConnectorLayoutKeyingShape;
    keyingColor?: string;
    shellCornerRadius?: number;
  } = {}
): ConnectorLayout {
  const rows = Math.ceil(connectionCount / columns);
  return {
    version: 1,
    units: "grid",
    width: columns,
    height: rows,
    shellShape: options.shellShape ?? "square",
    shellPadding: 0.65,
    shellCornerRadius: options.shellCornerRadius ?? 0.75,
    shellStrokeWidth: 0.1,
    cellPadding: 0.3,
    keyings: [
      {
        side: "top",
        placement: { mode: "guided", pathPosition: 0.12 },
        shape: options.keyingShape ?? "arrow",
        color: options.keyingColor ?? "#2563eb",
        scale: 1.15
      }
    ],
    ways: Array.from({ length: connectionCount }, (_, index) => ({
      cavityIndex: index + 1,
      x: (index % columns) + 1,
      y: Math.floor(index / columns) + 1,
      shape:
        options.alternateWayShape !== undefined && index % 3 === 2
          ? options.alternateWayShape
          : (options.wayShape ?? "round"),
      label: String(index + 1)
    }))
  };
}

export function buildMainSampleCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: mainSampleCatalogIds.powerSource12Way,
      manufacturerReference: "SAMPLE-CAT-SRC-12W",
      name: "Sample source connector 12-way",
      connectionCount: 12,
      unitPriceExclTax: 10.5,
      connectorLayout: buildConnectorLayout(12, 4, {
        wayShape: "square",
        alternateWayShape: "slot",
        keyingColor: "#d32f2f"
      })
    }),
    appActions.upsertCatalogItem({
      id: mainSampleCatalogIds.actuator8Way,
      manufacturerReference: "SAMPLE-CAT-ACT-8W",
      name: "Sample actuator connector 8-way",
      connectionCount: 8,
      unitPriceExclTax: 7.25,
      connectorLayout: buildConnectorLayout(8, 4, {
        wayShape: "round",
        alternateWayShape: "square",
        keyingShape: "diamond",
        keyingColor: "#f57c00"
      })
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
      unitPriceExclTax: 6.8,
      connectorLayout: buildConnectorLayout(6, 3, {
        wayShape: "slot",
        keyingColor: "#fbc02d"
      })
    }),
    appActions.upsertCatalogItem({
      id: lightingDemoCatalogIds.lamp4Way,
      manufacturerReference: "LIGHT-CAT-LAMP-4W",
      name: "Lamp connector 4-way",
      connectionCount: 4,
      unitPriceExclTax: 4.2,
      connectorLayout: buildConnectorLayout(4, 2, {
        shellShape: "circle",
        wayShape: "round",
        keyingShape: "round",
        keyingColor: "#f59e0b"
      })
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
      unitPriceExclTax: 11.4,
      connectorLayout: buildConnectorLayout(12, 6, {
        wayShape: "square",
        alternateWayShape: "round",
        keyingShape: "square",
        keyingColor: "#3949ab"
      })
    }),
    appActions.upsertCatalogItem({
      id: sensorDemoCatalogIds.sensor4Way,
      manufacturerReference: "SENSOR-CAT-CONN-4W",
      name: "Sensor connector 4-way",
      connectionCount: 4,
      unitPriceExclTax: 3.95,
      connectorLayout: buildConnectorLayout(4, 2, {
        shellShape: "circle",
        wayShape: "slot",
        keyingShape: "diamond",
        keyingColor: "#00897b"
      })
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

export function buildDoorDemoCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: doorDemoCatalogIds.doorModule16Way,
      manufacturerReference: "DOOR-CAT-MOD-16W",
      name: "Door module connector 16-way",
      connectionCount: 16,
      unitPriceExclTax: 13.8,
      connectorLayout: buildConnectorLayout(16, 4, {
        wayShape: "square",
        alternateWayShape: "round",
        keyingShape: "square",
        keyingColor: "#8e2430"
      })
    }),
    appActions.upsertCatalogItem({
      id: doorDemoCatalogIds.motor6Way,
      manufacturerReference: "DOOR-CAT-MOTOR-6W",
      name: "Window motor connector 6-way",
      connectionCount: 6,
      unitPriceExclTax: 6.3,
      connectorLayout: buildConnectorLayout(6, 3, { wayShape: "slot", keyingColor: "#1976d2" })
    }),
    appActions.upsertCatalogItem({
      id: doorDemoCatalogIds.mirror8Way,
      manufacturerReference: "DOOR-CAT-MIR-8W",
      name: "Mirror connector 8-way",
      connectionCount: 8,
      unitPriceExclTax: 7.9,
      connectorLayout: buildConnectorLayout(8, 4, { wayShape: "round", alternateWayShape: "slot", keyingColor: "#7b1fa2" })
    }),
    appActions.upsertCatalogItem({
      id: doorDemoCatalogIds.speaker2Way,
      manufacturerReference: "DOOR-CAT-SPK-2W",
      name: "Speaker connector 2-way",
      connectionCount: 2,
      unitPriceExclTax: 2.4,
      connectorLayout: buildConnectorLayout(2, 2, { shellShape: "circle", keyingShape: "round", keyingColor: "#6d4c41" })
    }),
    appActions.upsertCatalogItem({
      id: doorDemoCatalogIds.bodyPassThrough12Way,
      manufacturerReference: "DOOR-CAT-BODY-12W",
      name: "Door body pass-through 12-way",
      connectionCount: 12,
      unitPriceExclTax: 10.9,
      connectorLayout: buildConnectorLayout(12, 6, { wayShape: "square", alternateWayShape: "slot", keyingColor: "#0097a7" })
    }),
    appActions.upsertCatalogItem({
      id: doorDemoCatalogIds.doorSplice6Port,
      manufacturerReference: "DOOR-CAT-SPL-6P",
      name: "Door ground splice 6-port",
      connectionCount: 6,
      unitPriceExclTax: 4.7
    })
  ];
}

export function buildChargingDemoCatalogActions(): AppAction[] {
  return [
    appActions.upsertCatalogItem({
      id: chargingDemoCatalogIds.chargeInlet8Way,
      manufacturerReference: "CHG-CAT-INLET-8W",
      name: "Charge inlet connector 8-way",
      connectionCount: 8,
      unitPriceExclTax: 18.2,
      connectorLayout: buildConnectorLayout(8, 4, { wayShape: "slot", alternateWayShape: "round", keyingColor: "#d32f2f" })
    }),
    appActions.upsertCatalogItem({
      id: chargingDemoCatalogIds.onboardCharger12Way,
      manufacturerReference: "CHG-CAT-OBC-12W",
      name: "On-board charger connector 12-way",
      connectionCount: 12,
      unitPriceExclTax: 22.5,
      connectorLayout: buildConnectorLayout(12, 4, { wayShape: "square", alternateWayShape: "slot", keyingColor: "#f57c00" })
    }),
    appActions.upsertCatalogItem({
      id: chargingDemoCatalogIds.dcDc6Way,
      manufacturerReference: "CHG-CAT-DCDC-6W",
      name: "DC/DC connector 6-way",
      connectionCount: 6,
      unitPriceExclTax: 9.8,
      connectorLayout: buildConnectorLayout(6, 3, { wayShape: "round", alternateWayShape: "square", keyingColor: "#2e7d32" })
    }),
    appActions.upsertCatalogItem({
      id: chargingDemoCatalogIds.serviceDisconnect4Way,
      manufacturerReference: "CHG-CAT-SVC-4W",
      name: "Service disconnect 4-way",
      connectionCount: 4,
      unitPriceExclTax: 12.1,
      connectorLayout: buildConnectorLayout(4, 2, { shellShape: "circle", wayShape: "slot", keyingColor: "#8e2430" })
    }),
    appActions.upsertCatalogItem({
      id: chargingDemoCatalogIds.hvInterlockSplice4Port,
      manufacturerReference: "CHG-CAT-HVIL-SPL-4P",
      name: "HVIL splice 4-port",
      connectionCount: 4,
      unitPriceExclTax: 5.2
    })
  ];
}
