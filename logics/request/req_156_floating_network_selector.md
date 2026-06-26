## req_156_floating_network_selector - Semi-floating network selector in the docked nav strip
> From version: 1.16.10
> Schema version: 1.0
> Status: Draft
> Understanding: 95
> Confidence: 85
> Complexity: Low
> Theme: navigation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- While scrolling, keep the network-selection control accessible inside the semi-floating (docked) nav strip, next to the entity counters ("Cat.22 Conn.27 Spl.18 Nodes45 Seg.40 Wires151 AI Agent").
- Goal: faster navigation in large harnesses, less context loss.

# Context
- The entity counters component `NetworkSummaryQuickEntityNavigation` (`src/app/components/network-summary/NetworkSummaryQuickEntityNavigation.tsx`) already **docks into the sticky header on scroll**: rendered twice, `variant="panel"` in `NetworkSummaryPanel` and `variant="header"` inside `header-docked-nav-shell` in `AppShellLayout` (scroll detection ~lines 258-346). This docked strip IS the "semi-floating tab" referenced by the need.
- The network selector is currently a `<select>` in `NetworkSummaryHeader.tsx` (~lines 102-113, `onSelectActiveNetwork`), living **inside the scrollable content** → it scrolls away and is unavailable once the user has scrolled into the tables.
- Styling: `src/app/styles/canvas/canvas-quick-nav.css` (`.header-docked-nav-shell`, fade/translate on dock); sticky header `.header-block` in `base-foundation.css`.

# Decisions
- Add a **compact network selector into the docked nav strip**, adjacent to the counter chips, shown when the nav is docked (during scroll).
- Reuse the existing `onSelectActiveNetwork` callback and active-network state; do not introduce a second source of truth.
- **Desktop-only fallback**: if adding the control overloads the docked button row, integrate it for desktop mode only (hide on mobile/narrow viewports). The existing nav already has responsive/compact-label behavior to follow.

# Acceptance criteria
- AC1: When the nav strip is docked on scroll, a network selector is visible next to the counters and lets the user switch the active network without scrolling back up.
- AC2: Switching network from the docked control updates `activeNetworkId` identically to the existing `NetworkSummaryHeader` selector (same callback, same result).
- AC3: The docked selector reflects the current active network and the available network list.
- AC4: On narrow/mobile viewports, if the row would overflow, the docked selector is omitted (desktop-only) and counters remain intact — no layout breakage.
- AC5: No regression to the existing in-content network selector in `NetworkSummaryHeader`.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: a compact network selector inside `header-docked-nav-shell` next to the counters, wired to existing active-network switching, with a desktop-only fallback when space is tight.
- Out: redesigning the counters strip; multi-network simultaneous view; changing the in-content selector behavior.

# Risks / Open questions
- Horizontal space in the docked row is the main constraint — confirm the breakpoint/threshold for the desktop-only fallback against existing nav responsive rules.
- Visual form factor: compact `<select>` vs a button-with-menu — pick whatever matches the existing chip styling and stays within the row height.
- Ensure the docked selector and the in-content selector stay in sync (single state source).

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/app/components/network-summary/NetworkSummaryQuickEntityNavigation.tsx` (counters, docked variant)
- `src/app/components/network-summary/NetworkSummaryHeader.tsx` (existing network `<select>` + onSelectActiveNetwork)
- `src/app/components/layout/AppShellLayout.tsx` (dock-on-scroll logic, header-docked-nav-shell)
- `src/app/styles/canvas/canvas-quick-nav.css` (docked nav styling)

# AI Context
- Summary: Inject a compact, space-aware network selector into the already-docking nav strip so the active-network switch stays reachable while scrolling large harnesses; desktop-only fallback if the row overflows.
- Keywords: network-selector, docked-nav, sticky-header, navigation, responsive, desktop-only
- Use when: making the network switch reachable from the floating counters strip.
- Skip when: working on the in-content header selector or the counters layout itself.

# Backlog
- none
- `item_642_semi_floating_network_selector_in_the_docked_nav_strip`
