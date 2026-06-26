## task_151_semi_floating_network_selector_in_the_docked_nav_strip - Semi-floating network selector in the docked nav strip
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 92
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.

# Backlog
- `item_642_semi_floating_network_selector_in_the_docked_nav_strip`

# Acceptance criteria
- AC1: When the nav strip is docked on scroll, a network selector is visible next to the counters and lets the user switch the active network without scrolling back up.
- AC2: Switching network from the docked control updates `activeNetworkId` identically to the existing `NetworkSummaryHeader` selector (same callback, same result).
- AC3: The docked selector reflects the current active network and the available network list.
- AC4: On narrow/mobile viewports, if the row would overflow, the docked selector is omitted (desktop-only) and counters remain intact — no layout breakage.
- AC5: No regression to the existing in-content network selector in `NetworkSummaryHeader`.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_151_semi_floating_network_selector_in_the_docked_nav_strip.md` after implementation.
- Finish workflow executed on 2026-06-26.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-06-26.
- Linked backlog item(s): `item_642_semi_floating_network_selector_in_the_docked_nav_strip`
- Related request(s): `req_156_floating_network_selector`

# AI Context
- Summary: Implement semi-floating network selector in the docked nav strip.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_156_floating_network_selector`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
