## req_154_catalog_copy_from_reference - Catalog connector: copy configuration from another reference
> From version: 1.16.10
> Schema version: 1.0
> Status: Draft
> Understanding: 95
> Confidence: 90
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
- **Source enumeration = all networks in the document** (decision 2026-06-26): the source-network picker lists every network via `selectNetworks(state)` (`src/store/selectors.ts:91-93`), not just the active one and not limited to a HarnessAssembly group. Other networks' catalogs are already readable in `networkStates`.
- **manufacturerReference on copy**: copied then auto-suffixed to stay unique (e.g. `<ref>-copy`, `-2`…); user adjusts afterwards. Uniqueness MUST be computed against the **target** network's catalog (`networkStates[targetNetworkId].catalogItems`), NOT the active/top-level list — see Risks: the existing `catalogReducer` check only scopes the active network.
- **Deep copy via `structuredClone`** (already used in `src/app/lib/aiAgentApply.ts:91,97`): clone the source CatalogItem's nested structures (`additionalAccessories`, `connectorLayout.ways`/keying, `fuseBoxConfig.pairs`, `connectorDefaults`) so the new item shares no references with the source.
- **Entry point**: a **"Copy from…" selector inside the create form** — pick a source network + reference, fields pre-fill. Single flow that naturally handles cross-harness.
- Copy is a starting point: all copied fields remain editable before submit; submit goes through the normal `catalog/upsert` validation; a fresh `CatalogItemId` is generated (never reused from source).

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
- KNOWN GAP — `hasDuplicateManufacturerReference` (`src/store/reducer/catalogReducer.ts:20-31`) checks only `state.catalogItems.allIds` (active/top-level network). The auto-suffix routine MUST instead check the **target** network's `networkStates[targetNetworkId].catalogItems.allIds`; reusing the existing helper as-is would give wrong uniqueness when copying into a non-active network. Implementation must add a target-scoped uniqueness check.
- RESOLVED — deep copy: use `structuredClone` (already in the codebase) on the source CatalogItem; avoids the shallow-clone reference sharing in `src/store/networking.ts`.
- RESOLVED — source enumeration: `selectNetworks(state)` lists all networks; no HarnessAssembly restriction.
- RESOLVED — fresh `CatalogItemId` generated on copy, never reused from source.

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
- `src/store/selectors.ts:91-93` (`selectNetworks` — enumerate all networks for the source picker)
- `src/store/reducer/catalogReducer.ts:20-31` (`hasDuplicateManufacturerReference` — active-network-scoped; needs target-scoped variant)
- `src/app/lib/aiAgentApply.ts:91,97` (`structuredClone` precedent for deep copy)

# AI Context
- Summary: "Copy from…" source selector in the catalog create form that deep-copies a CatalogItem (same or other network) into a new item with a unique auto-suffixed reference, all fields editable before upsert.
- Keywords: catalog, connector, copy-from, duplicate, cross-harness, network-scoped
- Use when: implementing catalog connector copy/duplicate, including cross-network sourcing.
- Skip when: working on bulk import/export or plan-level connector placement.

# Backlog
- none
- `item_640_catalog_connector_copy_configuration_from_another_reference`
