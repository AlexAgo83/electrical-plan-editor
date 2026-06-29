# Changelog (`1.17.0 -> 1.17.1`)

## Major Highlights

- Network-summary callouts no longer repeat an entity's technical ID when the operator baked that ID into the entity name.

## Patch Notes

- Fixed splice and connector callout headers that rendered `EP-01 · AV-EP-01 Epissure Masse` instead of `EP-01 · Epissure Masse`. The free-form name is now stripped of a leading technical-ID token (raw `AV-EP-01` or prefix-stripped `EP-01` form) before the title is composed.
- The de-duplication is conservative: a token is only removed when it sits at the start of the name and is followed by a separator (space, `·`, `-`, `:`, `_`) or the end of the string, so names that merely resemble the ID (e.g. `EP-010 ...`) are never truncated.
- Change is display-only — stored entity names and callout table rows are untouched.

## Verification

- `npm run -s lint`
- `npm run -s typecheck`
- Focused suites: `callout-header-display`, `network-summary-callout-prefix`

## Notes

- Builds on `1.17.0`.
