## item_041_first_run_bootstrap_and_no_overwrite_guards - First Run Bootstrap and No Overwrite Guards
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Startup Safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Bootstrap logic can accidentally overwrite user data if first-run detection or guard conditions are weak.

# Scope
- In:
  - Implement first-run detection for empty persisted state.
  - Auto-create and activate sample network only when no user network exists.
  - Add explicit guards preventing mutation/overwrite of existing user data.
  - Ensure deterministic sample naming/ID assignment on bootstrap.
- Out:
  - User-triggered reset/recreate controls.
  - Import/export workflow changes.

# Acceptance criteria
- Clean install starts with one active sample network.
- Existing persisted networks are never overwritten by bootstrap.
- Bootstrap decision path is deterministic and testable.
- App startup remains stable if storage read/write fails.

# Priority
- Impact: Very high (data protection and onboarding reliability).
- Urgency: Immediate after fixture definition.

# Notes
- Dependencies: item_040.
- Blocks: item_042, item_044.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_007_bootstrap_with_comprehensive_sample_network.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/persistence/migrations.ts`
  - `src/app/App.tsx`

