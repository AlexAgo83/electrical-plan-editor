## item_407_home_changelog_feed_progressive_lazy_loading_on_scroll - Home changelog feed progressive lazy loading on scroll
> From version: 0.9.16
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Home changelog scalability via incremental rendering
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Rendering all changelog entries at once can increase initial Home rendering cost as changelog history grows.

# Scope
- In:
  - Add chunked initial render for Home changelog entries.
  - Load/render additional chunks when scrolling near list end (infinite-scroll style behavior).
  - Preserve current changelog ordering and content rendering semantics.
  - Keep behavior safe on small screens and keyboard scrolling paths.
  - Lock V1 loading contract:
    - initial batch = `4`,
    - incremental batch = `+4`,
    - trigger via `IntersectionObserver` sentinel near panel end.
- Out:
  - Changelog source strategy redesign.
  - Server-driven pagination.

# Acceptance criteria
- Home changelog feed renders an initial limited batch.
- Additional batches load on near-end scroll until all entries are rendered.
- Ordering and rendered markdown semantics remain non-regressed.
- Batch progression follows the deterministic `4 + 4` contract with sentinel-based triggering.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_078`.
- Blocks: `item_408`.
- Related AC: AC7.
- References:
  - `logics/request/req_078_update_app_button_breathing_glow_and_timestamped_save_filename.md`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
  - `src/app/lib/changelogFeed.ts`
  - `src/tests/app.ui.home.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: `Update app` action no longer blinks.
- request-AC2 -> This backlog slice. Evidence needed: `Update app` action displays a breathing glow when update is available.
- request-AC3 -> This backlog slice. Evidence needed: Reduced-motion environments do not receive forced breathing animation and keep an accessible highlighted state.
- request-AC4 -> This backlog slice. Evidence needed: Save/export filenames include a timestamp suffix.
- request-AC5 -> This backlog slice. Evidence needed: Filename timestamp format is filesystem-safe and deterministic.
- request-AC6 -> This backlog slice. Evidence needed: Export payload content/schema remains unchanged.
- request-AC7 -> This backlog slice. Evidence needed: Home changelog feed supports lazy loading on scroll (infinite-scroll style) while preserving entry order.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
