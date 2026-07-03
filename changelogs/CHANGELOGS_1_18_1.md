# Changelog (`1.18.0 -> 1.18.1`)

## Major Highlights

- Developer feedback is faster without reducing the existing CI coverage.

## Patch Notes

- Split blocking CI checks into parallel lanes while preserving lint, typecheck, dependency audit, segmented unit/UI tests, e2e, build, and PWA validation.
- Replaced bespoke size gates with ESLint-backed checks and removed verified dead code and orphaned test artifacts.
- Completed the shared modal migration for import/export, choice, feedback, and focus handling.
- Updated development dependencies through the npm dev minor/patch Dependabot group.
- Closed and settled the related Logics workflow corpus.

## Verification

- GitHub Actions CI on `main`

## Notes

- Builds on `1.18.0`.
