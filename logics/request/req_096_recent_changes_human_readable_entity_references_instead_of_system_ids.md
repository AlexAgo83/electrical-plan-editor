## req_096_recent_changes_human_readable_entity_references_instead_of_system_ids - Recent changes human-readable entity references instead of system IDs
> From version: 1.2.0
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UX / History readability
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Stop exposing opaque system IDs (UUID-like values) as primary text in `Recent changes`.
- Show user-facing entity references that are immediately readable in operational workflows.
- Keep deterministic fallback behavior when a readable reference is missing.

# Context
- `Recent changes` entries are generated from action history in `useStoreHistory`.
- Current target resolution often falls back to internal IDs for multiple actions (`remove`, route actions, node/segment/layout actions), producing low-value labels for users.
- This makes timeline scanning harder, especially in Network Scope where users expect business references (`technicalId`, names, endpoint refs), not storage identifiers.
- The issue is a UX quality gap in the history layer; the underlying undo/redo mechanics are already in place.

# Objective
- Standardize history labels around human-readable entity references.
- Preserve event-time clarity for create/update/delete actions and for entries persisted across reload.
- Eliminate raw UUID-like display from normal `Recent changes` rendering.

# Scope
- In:
  - define a normalized `displayRef` strategy per entity/action in history labeling;
  - update history entry generation so labels use readable references from `previousState`/`nextState` context;
  - keep deterministic fallback when readable fields are absent;
  - persist/read history entries without breaking existing stored snapshots;
  - add regression tests for history labels across key action families.
- Out:
  - redesign of the `Recent changes` panel layout;
  - changes to undo/redo stack semantics or limits;
  - introducing analytics/telemetry around history events.

# Locked execution decisions
- Decision 1: `Recent changes` labels must prefer user-facing references over internal IDs.
- Decision 2: History label generation uses state-aware resolution (access to `previousState` and `nextState`) so delete/update actions can still reference meaningful entity identifiers.
- Decision 3: Raw UUID-like values must not appear as the primary visible identifier in standard history entries.
- Decision 4: If no readable business reference exists, fallback is deterministic and human-oriented (`<Kind> #<index-like fallback>` or kind-only wording), not raw UUID.
- Decision 5: Existing persisted history entries remain readable and compatible; no destructive migration is required.
- Decision 6: Scope applies to `Recent changes` labels (Network Scope + persisted recent-changes metadata) and not to technical IDs in modeling tables/forms.

# Functional behavior contract
- Label composition:
  - keep existing action verbs (`created`, `updated`, `deleted`, etc.);
  - replace target reference source with readable `displayRef`.
- Reference priority (by kind):
  - `network`: `technicalId`, else `name`, else deterministic fallback;
  - `catalog`: `manufacturerReference`, else deterministic fallback;
  - `connector` / `splice` / `wire`: `technicalId`, else `name` (when available), else deterministic fallback;
  - `node`: linked connector/splice reference when applicable, else node label, else deterministic fallback;
  - `segment`: segment ID/label if user-facing, otherwise endpoint-based readable ref;
  - `layout`: readable node reference for `setNodePosition`, count-based readable text for batch updates.
- Delete/update safety:
  - delete actions resolve reference from `previousState` before entity removal;
  - update actions preserve clear target identity even if payload only carries internal ID.
- Persistence:
  - generated labels persist as before in recent-changes storage;
  - legacy entries continue to load and render.

# Acceptance criteria
- AC1: New `Recent changes` entries no longer show raw UUID-like IDs as primary target references.
- AC2: Connector/splice/wire/history labels use readable references (`technicalId`/name-style identifiers) when available.
- AC3: Delete actions keep readable target references (not internal IDs) after deletion.
- AC4: Node/segment/layout history labels are human-readable and not raw storage identifiers.
- AC5: Existing recent-changes snapshots remain loadable after the change.
- AC6: Undo/redo behavior and recent-changes alignment remain non-regressed.
- AC7: `logics_lint`, `lint`, `typecheck`, and relevant UI tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - history label output for create/update/delete across connector/splice/wire/network;
  - remove-action label quality (pre-delete readable snapshot);
  - persistence restore of recent changes after remount/reload.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Overly aggressive fallback normalization can hide useful technical distinctions if the fallback is too generic.
- History-label tests may become brittle if wording is not normalized with helper utilities.
- Some legacy records may still include old labels until new actions are generated.

# Backlog
- To create from this request:
  - `item_478_history_label_displayref_resolution_for_user_facing_entity_identifiers.md`
  - `item_479_remove_update_action_history_refinement_using_previous_next_state_context.md`
  - `item_480_recent_changes_persistence_compatibility_and_legacy_entry_non_regression.md`
  - `item_481_req_096_history_readability_validation_matrix_and_closure_traceability.md`

# References
- `src/app/hooks/useStoreHistory.ts`
- `src/app/types/app-controller.ts`
- `src/adapters/persistence/recentChanges.ts`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/tests/app.ui.undo-redo-global.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
- `logics/request/req_075_network_scope_recent_changes_panel_from_undo_history.md`
- `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`
