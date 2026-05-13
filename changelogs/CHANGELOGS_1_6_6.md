# Changelog (`1.6.5 -> 1.6.6`)

## Major Highlights

- Added connector catalog material defaults for terminals, seals, and plugs so connector modeling starts from richer reusable catalog data.
- Extended connector/catalog workflows to capture and persist material references across modeling forms, persistence migrations, import/export, validation, and BOM exports.
- Added audit hardening documentation and follow-up delivery structure for security, CI, maintainability, and release traceability.
- Fixed the multi-harness assembly product traceability status to use a valid Logics product status value.

## Version 1.6.6 - Connector Catalog Material Defaults

### Connector Catalog Materials

- Added the `connectorCatalogMaterials` core module with default terminal, seal, and plug material definitions.
- Added catalog-backed connector material reference fields in modeling forms and handler flows.
- Added settings and UI preference wiring for connector material defaults.
- Added validation coverage for missing or invalid connector material references.

### Persistence, Import/Export, and BOM

- Added migration and portability support for connector material reference fields.
- Extended network file import/export normalization for the new connector material data.
- Enriched network summary BOM CSV generation with connector material details.
- Added regression coverage for catalog reducer behavior and network summary BOM CSV output.

### Audit and Release Hardening

- Added the 2026-05-12 project audit and global Logics review artifacts.
- Added an architecture decision for security, CI bundle, and maintainability hardening strategy.
- Added follow-up request, backlog, and task entries for audit hardening delivery.
- Backfilled release traceability metadata across existing backlog/task orchestration documents.

## Validation and Regression Evidence

- `npm run -s typecheck`
- `npm run -s lint`
