## item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized - Make workspace status, alerts and read-only signals truthful and localized
> From version: 1.19.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 15:35:55

# AI Context
- preserveLegacyStateIfNeeded in lineageSessionController preserves any non-empty state, including the sample (use hasSampleNetworkSignature).
- Dates use browser locale in lineageStatus.formatTime and lineageFormat.formatLineageDateTime; switch to the app locale.
- Find the automatic write that calls reportBlockedMutationAttempt (useStoreHistory) when navigating in read-only mode; silence the notification, never the gate.

# Problem
- A fresh browser shows a misleading preserved-snapshot alert, the normal browser-only state is permanently orange, dates ignore the app locale, read-only is shown three times and navigation triggers a spurious blocked-mutation toast.

# Scope
- In:
  - Skip preserving empty or built-in sample state; move the preserved notice to Transfer and recovery with explanatory neutral copy.
  - Split saved status from the export reminder: success tone for the saved state, neutral export hint with adjacent Export package action, warning only past a documented threshold; apply consistently to Settings, Home rows and the Ops panel.
  - Format lineage times and dates with the app locale.
  - Keep a single themed read-only banner; replace Settings duplicates with disabled actions plus explanation; find and silence the automatic write that reports a blocked mutation when navigating while read-only, without weakening the gate.
- Out:
  - Changes to recovery, preservation storage or read-only enforcement semantics.

# Acceptance criteria
- AC1: Fresh browser with only the sample shows no preserved notice; a real preserved state shows the neutral notice with Download and Dismiss in Transfer and recovery.
- AC2: Browser-only normal state is success-toned with a separate neutral export hint; FR shows French time and date formats.
- AC3: One read-only banner; no toast on navigation in read-only mode; edits remain blocked and still notify when attempted.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Fresh browser with only the sample shows no preserved notice; a real preserved state shows the neutral notice with Download and Dismiss in Transfer and recovery.
- request-AC4 -> This backlog slice. Proof: AC2: Browser-only normal state is success-toned with a separate neutral export hint; FR shows French time and date formats.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_workspace_experience_polish_after_the_1_19_1_visual_review`
- Architecture decision(s): (none yet)
- Request: `req_169_remediate_workspace_ui_and_ux_findings_from_the_1_19_1_visual_review_on_home_and_settings`
- Primary task(s): `task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
