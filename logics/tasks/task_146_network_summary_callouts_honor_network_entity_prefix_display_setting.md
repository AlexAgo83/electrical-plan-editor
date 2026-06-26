## task_146_network_summary_callouts_honor_network_entity_prefix_display_setting - Network Summary callouts honor the network entity prefix display setting
> From version: 1.16.8
> Schema version: 1.0
> Status: Done
> Understanding: 98
> Confidence: 95
> Progress: 100%
> Owner: claudea
> Complexity: Low
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [x] Thread the existing per-network `formatEntityId` resolver (built from `activeNetwork.entityPrefix` + `canvasShowNetworkEntityPrefix` in `NetworkSummaryPanel.tsx`) into the callout model builders.
- [x] Apply the resolver to the connector and splice callout title via `buildCalloutHeaderDisplay` (format the `technicalId` argument), preserving the existing name/manufacturer-reference subtitle behavior.
- [x] Apply the resolver to the wire-row `End ID` cell (`targetId` from `describeWireEndpointForCallout`) for both connector and splice endpoints.
- [x] Apply the resolver to the wire-row `Wire ID` cell (`entry.technicalId`) so the wire's own technical ID drops the active prefix when hidden.
- [x] Keep canonical IDs for all non-display uses: callout keys (`connector:<id>` / `splice:<id>`), selection targets (`onSelectConnectorFromCallout` / `onSelectSpliceFromCallout`), drag-position persistence, sorting, and grouping must not be formatted.
- [x] Confirm SVG/PNG/PDF network-plan exports reflect the on-screen prefix visibility through the existing live-DOM snapshot (no separate export formatting path needed).
- [x] All acceptance criteria AC1-AC7 are covered.
- [x] Validation passes (code + Logics gates).

# Backlog
- `item_637_network_summary_callouts_honor_network_entity_prefix_display_setting`

# Acceptance criteria
- AC1: When `canvasShowNetworkEntityPrefix` is off, connector and splice callout titles in the Network Summary 2D plan omit the active network prefix (e.g. `LAT-EP 2` renders as `EP 2`).
- AC2: When the setting is off, callout wire-detail rows omit the active network prefix in both the `Wire ID` column (the wire's own `technicalId`) and the `End ID` column (the far-endpoint connector/splice `technicalId`).
- AC3: When the setting is on, callout titles and wire-detail ID cells remain backward-compatible and continue to include the stored prefix.
- AC4: Prefix hiding in callouts is display-only: callout selection, drag-position persistence keys, sorting, and grouping continue to use canonical entity IDs and behave identically whether the prefix is shown or hidden.
- AC5: SVG/PNG/PDF network-plan exports that snapshot the live callouts reflect the same prefix visibility as the on-screen callouts.
- AC6: AI-agent JSON and machine-readable identifiers are unaffected and continue to expose canonical full IDs.
- AC7: Targeted tests cover callout title prefix hiding, wire-row `Wire ID` and `End ID` prefix hiding, the prefix-shown backward-compatible path, and a non-regression check that callout selection/keys use canonical IDs.

# Implementation plan
1. Add an optional `formatEntityId?: (id: string) => string` option (defaulting to identity) to the callout model builders in `calloutModel.ts`: `buildConnectorCalloutGroupsById`, `buildSpliceCalloutGroupsById`, and `buildCableCalloutViewModels`.
2. In `createCalloutEntry` / `describeWireEndpointForCallout`, format the emitted display cells only: set `technicalId` (Wire ID) and `targetId` (End ID) through the resolver while leaving sort keys and any internal lookups on canonical values, or format at the row level in `calloutLayout.ts` so canonical entries stay intact for sorting.
3. In `buildCableCalloutViewModels`, format the `technicalId` passed to `buildCalloutHeaderDisplay` for both connector and splice titles, keeping `key`, `entityId`, `nodeId`, selection, and persistence values canonical.
4. Pass the panel's memoized `formatEntityId` into the three builders from `NetworkSummaryPanel.tsx` and add it to the relevant `useMemo` dependency arrays.
5. Verify the live-DOM export snapshot picks up the formatted callout text and that hiding the prefix does not change export geometry or selection behavior.
6. Add focused tests for the formatted title, Wire ID, and End ID cells, the prefix-shown path, and canonical-key non-regression.

# Validation
- Callout model tests:
  - connector and splice callout titles drop the active prefix when `formatEntityId` hides it and keep it when shown;
  - wire-row `Wire ID` (`entry.technicalId`) and `End ID` (`targetId`) drop the active prefix when hidden, for both connector and splice endpoints;
  - callout keys, `entityId`, selection targets, and sort order are identical whether the prefix is shown or hidden.
- Confirm no change to AI-agent JSON / machine-readable identifiers.
- Run `npm run -s typecheck`, `npm run -s lint`, and the focused vitest suite(s) covering the callout model; run broader `npm run -s test:ci:fast` if feasible.
- Logics gates: run `logics-manager lint --require-status` and `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`.
- Finish workflow executed on 2026-06-26.
- Linked backlog/request close verification passed.

# Report
- Implemented and validated (typecheck, eslint, `test:ci:fast`, `test:ci:ui`, Logics lint + audit all green).
- Callout model now honors the existing `canvasShowNetworkEntityPrefix` setting via the shared
- Finished on 2026-06-26.
- Linked backlog item(s): `item_637_network_summary_callouts_honor_network_entity_prefix_display_setting`
- Related request(s): `req_151_network_summary_callouts_honor_network_entity_prefix_display_setting`
  `formatEntityId` resolver, threaded into `buildConnectorCalloutGroupsById`,
  `buildSpliceCalloutGroupsById`, and `buildCableCalloutViewModels` (optional option, identity
  default so existing callers are unaffected).
- Formatted display cells only:
  - connector and splice callout titles format the `technicalId` argument passed to
    `buildCalloutHeaderDisplay` (e.g. `LAT-EP 2 · name` -> `EP 2 · name` when hidden) — AC1;
  - the wire-row `End ID` cell (`targetId` from `describeWireEndpointForCallout`) drops the active
    prefix for both connector and splice endpoints — AC2;
  - the wire-row `Wire ID` cell (`entry.technicalId` from `createCalloutEntry`) drops the active
    prefix — AC2.
- Display-only guarantee (AC4): callout keys (`connector:<id>` / `splice:<id>`), `entityId`,
  selection targets, drag-position persistence, the canonical `wireId` row key, and entry sorting
  continue to use canonical IDs. Within a network the prefix is constant, so stripping it does not
  reorder entries; a test asserts identical callout keys/order whether the prefix is shown or hidden.
- `NetworkSummaryPanel.tsx`: moved the memoized `formatEntityId` above the callout `useMemo`s
  (avoids a temporal-dead-zone reference) and passed it into all three callout builders with the
  dependency arrays updated.
- Exports (AC5): SVG/PNG/PDF network-plan exports snapshot the live callout DOM, so they inherit the
  formatted callout text with no separate export path; no export-geometry change.
- AI-agent JSON and machine-readable identifiers untouched (AC6).
- Tests (AC7): new `src/tests/network-summary-callout-prefix.spec.ts` covers connector/splice
  `Wire ID` + `End ID` prefix hiding, the prefix-shown backward-compatible path, title prefix hiding,
  canonical key/`entityId` preservation, and identical key/order across show/hide. Existing callout
  specs (`network-summary-callout-splice-side-labels`, `network-summary-callouts-layer`) still pass.
- Validation: `npm run -s typecheck`, `npm run -s lint`, `npm run -s test:ci:fast` (540 tests),
  `npm run -s test:ci:ui` (86 tests), `logics-manager lint --require-status`, and
  `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability` all green.
- Closeout note: left at `In Progress` / 95% because `logics-manager flow finish task` is unavailable
  in this environment (the published 2.12.12 package omits the `flow` module); mirrors task_145.

# AI Context
- Summary: Implement prefix-aware Network Summary callout display by threading the existing `formatEntityId` resolver into the callout model so titles, `Wire ID`, and `End ID` cells honor `canvasShowNetworkEntityPrefix`, while keys/selection/persistence/sorting and AI-agent JSON keep canonical IDs.
- Keywords: task, implementation, network summary callout, entity prefix, formatEntityId, buildCalloutHeaderDisplay, Wire ID, End ID, display-only prefix, canvasShowNetworkEntityPrefix
- Use when: Implementing prefix-aware callout label display or its tests in the Network Summary.
- Skip when: The work is still at request/backlog shaping stage or concerns colocated splice geometry, new settings, AI-agent JSON identifiers, or modeling/inspector/analysis label surfaces.

# Links
- Request: `req_151_network_summary_callouts_honor_network_entity_prefix_display_setting`
- Backlog: `item_637_network_summary_callouts_honor_network_entity_prefix_display_setting`
- Product brief(s): (none)
- Architecture decision(s): (none)

# AC Traceability
- request-AC1 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
- request-AC2 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
- request-AC3 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
- request-AC4 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
- request-AC5 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
- request-AC6 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
- request-AC7 -> This task. Proof: Closed on 2026-06-26 after user confirmation that corpus work is finished; linked task report records implementation complete and validation passed: typecheck, eslint, test:ci:fast, test:ci:ui, Logics lint and audit.
