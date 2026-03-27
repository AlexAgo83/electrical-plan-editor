## item_538_history_label_displayref_resolution_for_user_facing_entity_identifiers - History label displayRef resolution for user-facing entity identifiers
> From version: 1.2.0
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: UX / History readability
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.
> Schema version: 1.0

# Problem
`Recent changes` currently surfaces opaque storage identifiers in multiple history entries instead of readable business references, which makes the timeline hard to scan during operational review.

# Scope
- In:
  - define a shared `displayRef` resolution strategy for history labels by entity kind;
  - prefer user-facing references such as `technicalId`, name, manufacturer reference, or readable endpoint-derived labels;
  - define deterministic human-oriented fallback text when no business reference is available;
  - apply the strategy to normal history-label generation paths without changing undo/redo semantics.
- Out:
  - persistence compatibility/migration behavior;
  - delete/update previous-state refinement details handled separately;
  - redesign of the Recent changes panel UI.

# Acceptance criteria
- AC1: History-label generation prefers user-facing references over internal IDs for supported entity kinds.
- AC2: Connector, splice, wire, catalog, and network entries render readable target references when available.
- AC3: Node, segment, and layout entries use human-readable label strategies rather than raw storage IDs.
- AC4: When no readable business reference exists, fallback wording remains deterministic and human-oriented.
- AC5: Undo/redo mechanics remain unchanged while label readability improves.

# AC Traceability
- AC1/AC2/AC3/AC4/AC5 -> `displayRef` strategy and history-label resolution path.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_096_recent_changes_human_readable_entity_references_instead_of_system_ids.md`.
- Orchestrated by `logics/tasks/task_089_req_096_recent_changes_human_readable_entity_references_orchestration_and_delivery_control.md`.
- Risks:
  - overly generic fallback text may hide distinctions useful for debugging;
  - entity-specific resolution rules can drift if not centralized.
- References:
  - `src/app/hooks/useStoreHistory.ts`
  - `src/app/types/app-controller.ts`

# Delivery
- Centralized recent-change label composition in a shared helper so readable `displayRef` resolution is defined once for networks, catalog items, connectors, splices, nodes, segments, wires, and layout events.
- Preferred business-facing identifiers such as `technicalId`, manufacturer reference, linked node refs, and endpoint-derived segment text before falling back to generic kind wording.
