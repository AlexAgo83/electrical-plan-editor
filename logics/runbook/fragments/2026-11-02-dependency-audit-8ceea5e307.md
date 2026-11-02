# Dependency audit repair — mission 8ceea5e307

The initial dependency audit rejected 27 packages (25 moderate and two low).
The moderate reports originated in minimatch and glob; downstream reports included
ESLint, Archiver, EJS, ExcelJS, and Workbox.

## Dependency changes

- Override minimatch with the first patched release, 11.0.1
  (GHSA-g3hv-75wg-m249), replacing the three obsolete brace-expansion overrides.
- Override glob with the first patched release, 14.0.2
  (GHSA-3g3m-2fjr-6pw4). This also replaces legacy glob 7, whose matcher internals
  are incompatible with minimatch 11.
- Override only ExcelJS's unzipper with 0.12.3. This removes fstream/rimraf's
  callback-based glob dependency, which cannot consume glob 14. Archiver stays
  at 5.3.2: an experimental upgrade to 7 broke ExcelJS streaming output and was
  discarded. Regression tests cover Archiver file expansion and streaming XLSX
  write/read compatibility using the actual dependencies.
- Pin Terser 5.46.0 as a development dependency for reproducible build minification.

The audit policy and allowlist are unchanged. The remaining four low reports are
one existing exception: deepmerge 4.3.1, propagated through
@rollup/plugin-node-resolve, workbox-build, and vite-plugin-pwa. There is no
patched deepmerge release for GHSA-gcqx-w48m-w2h4. The existing restriction to this
exact build-only advisory and dependency chain remains in force. npm's proposed
PWA downgrade to 0.2.1 is not a viable remediation.

Advisories:
- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/advisories/GHSA-3g3m-2fjr-6pw4
- https://github.com/advisories/GHSA-gcqx-w48m-w2h4

## Bundle preservation

The first measured build exceeded the existing initial and total gzip budgets
(194.95 KiB and 913.18 KiB). No budget was increased. The final build:

- Loads development performance logging only in development, avoiding its eager
  localization dependency in the production entry.
- Lets the bundler split AI code naturally rather than forcing shared dependencies
  into a preloaded AI chunk; route-level dynamic imports remain intact.
- Compresses changelog text in one chunk and uses Terser with two compression passes.
- Selects ExcelJS's browser bundle without legacy polyfills only for production
  builds. The existing modern browser target already supplies these ES features.
  ExcelJS remains lazy and excluded from PWA precaching.

Measured final budgets: largest initial chunk 213.28 KiB raw (limit 500 KiB),
initial gzip 69.05 KiB (limit 130 KiB), total gzip 847.87 KiB (limit 850 KiB).
The total budget has limited headroom; reviewers should retain these gates.

## Validation evidence

All local validation attempts, including reproductions and retries, are measured
by `.jarvis-input/mission-test-runner.py`. Receipts are retained in
`.jarvis-artifacts/mission-tests.jsonl`; detailed logs are alongside them.
Raw npm audit exits nonzero for the existing accepted deepmerge exception;
`npm run -s quality:dependency-audit` is the project's acceptance gate.

Final checks and their measured results are recorded in the mission delivery.
No deployment or operator secret access is required. No product layout or copy
was changed. No shared runbook history or design document was edited.

Final measured attempts (seconds from the timer receipt):

| Command | Exit code | Seconds |
| --- | ---: | ---: |
| `npm ci` | 0 | 4.016 |
| `npm run -s lint` | 0 | 36.869 |
| `npm run -s typecheck` | 0 | 17.294 |
| `npm run -s quality:dependency-audit` | 0 | 0.567 |
| `npm run -s test:ci:segmentation:check` | 0 | 0.116 |
| `npm run -s test:ci:fast` | 0 | 50.994 |
| `npm run -s test:ci:ui:shard -- --shard=1/3` | 0 | 35.213 |
| `npm run -s test:ci:ui:shard -- --shard=2/3` | 0 | 36.414 |
| `npm run -s test:ci:ui:shard -- --shard=3/3` | 0 | 34.013 |
| `npm run -s test:e2e` | 0 | 31.146 |
| `npm run -s build:vite` | 0 | 7.657 |
| `npm run -s quality:pwa` | 0 | 0.112 |
| `npm run -s bundle:metrics:report` | 0 | 0.189 |
| `npm run -s quality:i18n` | 0 | 1.474 |
| `node .jarvis-artifacts/dependency-smoke.mjs` | 0 | 0.276 |
| `node .jarvis-artifacts/production-xlsx-smoke.mjs` | 0 | 1.057 |
| `logics-manager lint --require-status` | 0 | 0.251 |
| `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability` | 0 | 0.617 |

Fast suite: 108 files / 767 tests. UI shards: 25 / 24 / 24 files and
146 / 171 / 134 tests. E2E: 15 tests. The production Chromium smoke also
verifies application startup without runtime errors and Unicode XLSX roundtripping
using the actual generated bare browser bundle.

Human review: inspect the necessary major transitive overrides and bundle configuration;
track the upstream deepmerge fix and the remaining 2.13 KiB total gzip headroom.
No host-only verification is outstanding.
