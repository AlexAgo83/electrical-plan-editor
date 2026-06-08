## item_318_req_051_catalog_screen_catalog_first_integration_closure_ci_build_and_ac_traceability - req_051 Catalog Screen and Catalog-First Integration Closure (CI, Build, and AC Traceability)
> From version: 0.9.4
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Closure gate for req_051 delivery across catalog domain, UI, migration fallback, onboarding, and regression coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_051` spans several risky areas (schema, migration/import fallback, UI workflow changes, onboarding, and integrity guards). A closure item is required to run the final validation matrix, confirm AC traceability, and synchronize `logics` docs.

# Scope
- In:
  - Run and record final validation gates for `req_051`.
  - Confirm AC traceability across items `311`..`317`.
  - Synchronize `req_051`, `task_052`, and backlog item statuses/notes.
  - Record residual risks/deferred V1 recommendations (if any remain optional).
- Out:
  - New features beyond req_051 scope.

# Acceptance criteria
- Final validation gates are executed and recorded for `req_051`.
- AC traceability for req_051 is documented across delivery items.
- `logics` request/task/backlog docs are synchronized to closure state.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Closure execution snapshot:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `npm run -s quality:ui-modularization` ✅
  - `npm run -s quality:store-modularization` ✅
  - `npm run -s quality:pwa` ✅
  - `npm run -s build` ✅
  - `npm run -s test:ci` ✅ (`37` files / `245` tests)
  - `npm run -s test:e2e` ✅ (`2` tests)
- AC traceability summary:
  - AC1-AC4/AC16/AC17: Catalog navigation/layout/composition delivered and covered by `item_313`, `item_314`, `item_317`.
  - AC5-AC7: Catalog CRUD validation/optional fields delivered and covered by `item_314`, `item_317`.
  - AC8/AC8a/AC15: Migration/import legacy bootstrap + deterministic collision behavior delivered by `item_312`.
  - AC9-AC11/AC13/AC14/AC18: Connector/splice catalog-first integration and guards delivered by `item_315`, covered by `item_317`.
  - AC12: Onboarding Catalog step insertion/guidance delivered by `item_316`, covered by `item_317`.
- Dependencies: `req_051`, item_311, item_312, item_313, item_314, item_315, item_316, item_317.
- Blocks: none (closure item).
- Related AC: AC1-AC19 (traceability/closure).
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `logics/tasks/task_052_req_051_catalog_screen_and_catalog_first_connector_splice_integration_orchestration_and_delivery_control.md`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: A `Catalog` modeling sub-screen exists and is accessible from the nav bar and drawer menu.
- request-AC2 -> This backlog slice. Evidence needed: The `Catalog` nav entry is positioned before `Connectors` / `Splices` / other entity sub-screen entries.
- request-AC3 -> This backlog slice. Evidence needed: The `Catalog` workspace screen reuses the expected modeling look-and-feel and includes `Network summary`, `Route preview`, `Catalog`, and `Edit catalog item` panels.
- request-AC4 -> This backlog slice. Evidence needed: The catalog screen does not render the analysis panel/column.
- request-AC5 -> This backlog slice. Evidence needed: `Manufacturer reference` is mandatory to save a catalog item.
- request-AC6 -> This backlog slice. Evidence needed: `Connection count` is mandatory to save a catalog item.
- request-AC7 -> This backlog slice. Evidence needed: `Name`, `Unit price (excl. tax)`, and `URL` are supported as optional inputs.
- request-AC8 -> This backlog slice. Evidence needed: Legacy saves with connectors/splices using `manufacturerReference` are backfilled into `Catalog` (using manufacturer ref + way/port count -> `connectionCount`) without duplicate churn.
- request-AC9 -> This backlog slice. Evidence needed: Connector/Splice forms use a catalog-backed manufacturer selector instead of free-text manufacturer reference.
- request-AC10 -> This backlog slice. Evidence needed: Connector `way` count and Splice `port` count are derived from the selected catalog item `connectionCount`.
- request-AC11 -> This backlog slice. Evidence needed: New connector/splice creation follows a `catalog-first` workflow (catalog item created/selected first), with legacy entities still supported via fallback resolution.
- request-AC12 -> This backlog slice. Evidence needed: Onboarding includes a new `Catalog` step in 2nd position (before the connectors/splices library step) with contextual target action(s) consistent with existing onboarding behavior.
- request-AC13 -> This backlog slice. Evidence needed: Catalog item deletion is blocked while referenced by a connector/splice.
- request-AC14 -> This backlog slice. Evidence needed: Catalog item `connectionCount` reduction is blocked when it would invalidate linked connector/splice way/port usage.
- request-AC15 -> This backlog slice. Evidence needed: Legacy fallback bootstrap behavior is applied consistently on both persisted load and import of older data.
- request-AC16 -> This backlog slice. Evidence needed: (Recommended V1) Catalog supports default sort by `manufacturerReference` and basic filtering on `manufacturerReference`/`name`.
- request-AC17 -> This backlog slice. Evidence needed: (Recommended V1) Catalog can open connector/splice creation flows prefilled from the selected catalog item.
- request-AC18 -> This backlog slice. Evidence needed: When no catalog item exists, connector/splice creation UI provides a clear blocking message and CTA to open/create catalog items.
- request-AC19 -> This backlog slice. Evidence needed: Regression tests cover navigation access/order, required-field validation, legacy fallback bootstrap, connector/splice catalog integration behavior, and onboarding step/order integration.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC11 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC12 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC13 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC14 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC15 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC16 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC17 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC18 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC19 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
