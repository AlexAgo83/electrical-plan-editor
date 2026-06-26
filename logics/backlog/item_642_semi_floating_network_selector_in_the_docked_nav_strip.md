## item_642_semi_floating_network_selector_in_the_docked_nav_strip - Semi-floating network selector in the docked nav strip
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
While scrolling, keep the network-selection control accessible inside the semi-floating (docked) nav strip, next to the entity counters ("Cat.22 Conn.27 Spl.18 Nodes45 Seg.40 Wires151 AI Agent").
Goal: faster navigation in large harnesses, less context loss.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: When the nav strip is docked on scroll, a network selector is visible next to the counters and lets the user switch the active network without scrolling back up.
- AC2: Switching network from the docked control updates `activeNetworkId` identically to the existing `NetworkSummaryHeader` selector (same callback, same result).
- AC3: The docked selector reflects the current active network and the available network list.
- AC4: On narrow/mobile viewports, if the row would overflow, the docked selector is omitted (desktop-only) and counters remain intact — no layout breakage.
- AC5: No regression to the existing in-content network selector in `NetworkSummaryHeader`.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: When the nav strip is docked on scroll, a network selector is visible next to the counters and lets the user switch the active network without scrolling back up.
- request-AC2 -> This backlog slice. Proof: AC2: Switching network from the docked control updates `activeNetworkId` identically to the existing `NetworkSummaryHeader` selector (same callback, same result).
- request-AC3 -> This backlog slice. Proof: AC3: The docked selector reflects the current active network and the available network list.
- request-AC4 -> This backlog slice. Proof: AC4: On narrow/mobile viewports, if the row would overflow, the docked selector is omitted (desktop-only) and counters remain intact — no layout breakage.
- request-AC5 -> This backlog slice. Proof: AC5: No regression to the existing in-content network selector in `NetworkSummaryHeader`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_156_floating_network_selector.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Semi-floating network selector in the docked nav strip
- Keywords: backlog-groom, request, semi-floating network selector in the docked nav strip, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Semi-floating network selector in the docked nav strip.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_156_floating_network_selector` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_156_floating_network_selector.md`.
- Generated locally by logics-manager.
- Task `task_151_semi_floating_network_selector_in_the_docked_nav_strip` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_151_semi_floating_network_selector_in_the_docked_nav_strip`
