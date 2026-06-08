## item_465_splice_entity_capacity_mode_contract_and_migration_defaulting - Splice entity capacity mode contract and migration defaulting
> From version: 1.1.0
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Delivered in the `task_076` implementation wave for `req_092` to `req_095` to remove stale backlog placeholders and align execution tracking with shipped behavior.

# Scope
- In: Code delivery, persistence/validation/UI wiring, and targeted regression checks for the item scope.
- Out: Unrelated architecture changes outside `req_092` to `req_095`.

# Acceptance criteria
- AC1: Implemented and validated with passing `typecheck`, `lint`, and targeted tests for touched surfaces.

# AC Traceability
- AC1 -> Implemented in source code and validated through test commands executed in the orchestration run (`task_076`).
- request-AC1 -> This backlog slice. Evidence needed: Splice domain contract supports both `bounded` and `unbounded` capacity modes.
- request-AC2 -> This backlog slice. Evidence needed: Existing splices load as `bounded` without behavior regression.
- request-AC3 -> This backlog slice. Evidence needed: Users can create/edit an unbounded splice without specifying a max port count.
- request-AC4 -> This backlog slice. Evidence needed: Wire endpoint validation accepts positive splice port indexes beyond previous `portCount` limits when target splice is `unbounded`.
- request-AC5 -> This backlog slice. Evidence needed: Wire endpoint validation for bounded splices remains unchanged.
- request-AC6 -> This backlog slice. Evidence needed: Catalog-linked splice behavior remains bounded with derived `portCount` from catalog `connectionCount`.
- request-AC7 -> This backlog slice. Evidence needed: Selecting a catalog item on an unbounded splice automatically switches it to bounded mode and applies catalog-derived `portCount`, with explicit UX feedback.
- request-AC8 -> This backlog slice. Evidence needed: Unbounded splice analysis UI shows adaptive finite port rendering with explicit `∞` indicator and default `+2` free-slot buffer.
- request-AC9 -> This backlog slice. Evidence needed: Network summary splice callouts remain performant and readable for unbounded mode (no infinite rendering loops).
- request-AC10 -> This backlog slice. Evidence needed: Occupancy and conflict detection remains correct in both modes.
- request-AC11 -> This backlog slice. Evidence needed: Persistence/import round-trip supports mixed bounded/unbounded splice datasets.
- request-AC12 -> This backlog slice. Evidence needed: Export behavior distinguishes unbounded capacity for all splice-bearing outputs in scope (`portMode` present; numeric `portCount` empty/omitted for unbounded in JSON/CSV splice exports).
- request-AC13 -> This backlog slice. Evidence needed: BOM exports remain unchanged by this request.
- request-AC14 -> This backlog slice. Evidence needed: Change is delivered without temporary feature flag.
- request-AC15 -> This backlog slice. Evidence needed: Connector flows are non-regressed.
- request-AC16 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.
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

# Priority
- Impact: High (cross-cutting modeling and canvas behavior alignment).
- Urgency: High (execution bundle requested as uninterrupted delivery).

# Notes
- Request link: `req_093_splice_unbounded_port_mode_with_adaptive_port_rendering`.
