## req_154_catalog_copy_from_reference - Catalog connector: copy configuration from another reference
> From version: 1.16.10
> Schema version: 1.0
> Status: Draft
> Understanding: 90
> Confidence: 70
> Complexity: Medium
> Theme: catalogue
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let the user create a new catalog connector by copying the full configuration of an existing reference: ways (connectionCount), reference, name, material defaults, additional accessories, physical layout, fuse box, etc.
- Ideally also copy from the catalog of another harness (network).
- Goal: faster catalog creation, less re-typing, fewer errors.

# Context
- `CatalogItem` (`src/core/entities.ts:120-131`) holds everything to copy: `connectionCount`, `manufacturerReference`, `name`, `unitPriceExclTax`, `url`, `additionalAccessories`, `connectorDefaults` (terminals/seals/plugs/pinElectricalRoles/rearBackshell), `connectorLayout` (ways/keying), `fuseBoxConfig`.
- Create/edit flow: form `ModelingCatalogFormPanel.tsx`, state hook `useCatalogHandlers.ts` (`startCatalogEdit` already maps a CatalogItem into the form fields → derive a "duplicate"/"copy from" variant), upsert via `catalog/upsert` (`src/store/actions.ts`), reducer `catalogReducer.ts` (validates ref uniqueness, normalizes, propagates).
- Catalog is **network-scoped**: `networkStates[networkId].catalogItems` (`src/store/types.ts:132-143`). Only one `activeNetworkId` at a time, BUT other networks' catalogs remain **readable** in state → a source-network selector is enough for cross-harness copy; no multi-active-network support needed.
- No existing duplicate/clone feature today (only automatic legacy-migration id generation in `src/store/catalog.ts`).

# Decisions
- **manufacturerReference on copy**: copied then auto-suffixed to stay unique (e.g. `<ref>-copy`, `-2`…); user adjusts afterwards. Must guarantee uniqueness against the *target* network's catalog.
- **Entry point**: a **"Copy from…" selector inside the create form** — pick a source reference (and a source network), fields pre-fill. Single flow that naturally handles cross-harness.
- **Cross-harness included** in this slice: source can be the active network or any other network in the document.
- Copy is a starting point: all copied fields remain editable before submit; submit goes through the normal `catalog/upsert` validation.

# Acceptance criteria
- AC1: From the catalog create form, a "Copy from…" selector lets the user pick a source reference; selecting it pre-fills all configuration fields (ways, name, material defaults, accessories, layout, fuse box).
- AC2: The source selector can target the active network or another network's catalog in the same document.
- AC3: On copy, `manufacturerReference` is pre-filled with a unique auto-suffixed value (no collision with the target network's existing references).
- AC4: All pre-filled fields stay editable; submitting creates a brand-new catalog item via `catalog/upsert` and never mutates the source.
- AC5: Copy produces a deep, independent copy (editing accessories/layout/fuse box on the new item does not affect the source).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: "Copy from…" source selector (reference + network) in the create form, deep copy of all CatalogItem fields, unique auto-suffixed reference, cross-harness sourcing.
- Out: bulk copy of multiple references at once; live linking/sync between source and copy; copying connectors placed on the plan (this is catalog-level only).

# Risks / Open questions
- Auto-suffix uniqueness must be computed against the *target* network's catalog, not the source's.
- Deep-copy correctness for nested structures (`additionalAccessories`, `connectorLayout.ways`/keying, `fuseBoxConfig.pairs`, `connectorDefaults`) — avoid shared references.
- Cross-harness reading: confirm how to enumerate other networks for the source selector (HarnessAssembly grouping vs all `networkStates`).
- New `id` (CatalogItemId) must be freshly generated, never reused from source.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/core/entities.ts:120-131` (CatalogItem + nested layout/defaults/fusebox types)
- `src/app/components/workspace/ModelingCatalogFormPanel.tsx` (catalog form)
- `src/app/hooks/useCatalogHandlers.ts` (startCatalogEdit / form state — base for copy)
- `src/store/actions.ts` (catalog/upsert)
- `src/store/reducer/catalogReducer.ts` (uniqueness/normalize/propagate)
- `src/store/types.ts:132-143,162-177` (network-scoped catalog, activeNetworkId, networkStates)

# AI Context
- Summary: "Copy from…" source selector in the catalog create form that deep-copies a CatalogItem (same or other network) into a new item with a unique auto-suffixed reference, all fields editable before upsert.
- Keywords: catalog, connector, copy-from, duplicate, cross-harness, network-scoped
- Use when: implementing catalog connector copy/duplicate, including cross-network sourcing.
- Skip when: working on bulk import/export or plan-level connector placement.

# Backlog
- none
- `item_640_catalog_connector_copy_configuration_from_another_reference`
