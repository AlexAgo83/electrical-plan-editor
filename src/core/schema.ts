import packageMetadata from "../../package.json";

export const APP_SCHEMA_VERSION = 2;
export const APP_RELEASE_VERSION = packageMetadata.version;

export type AppSchemaVersion = typeof APP_SCHEMA_VERSION;
