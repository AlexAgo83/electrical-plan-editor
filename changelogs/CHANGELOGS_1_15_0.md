# Changelog (`1.14.8 -> 1.15.0`)

## Major Highlights

- Reducers in `src/store/reducer/networkReducer.ts` and `src/store/reducer/harnessAssemblyReducer.ts` are now pure: timestamps are injected through action payloads (`nowIso`) instead of being generated inside the reducer.
- Persistence sync (`attachPersistenceSync`) now debounces localStorage writes by default (200 ms) so a rapid burst of dispatches no longer triggers one full `JSON.stringify` + write per action.
- Added a strict Content-Security-Policy and a set of defense-in-depth response headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) served from Render.
- AI provider client now refuses to send the API key to a non-secure endpoint (`https://` required, with `http://` allowed only on `localhost`/`127.0.0.1`); the Settings panel surfaces an explicit security notice about local key storage.
- Refreshed Vitest tooling on the `^4.1.8` line via the lockfile and removed the now-stale `GHSA-5xrq-8626-4rwp` allowlist entries.

## Patch Notes

- `appActions.createNetwork`, `duplicateNetwork`, `deleteNetwork`, `importNetworks` now embed `nowIso` in their payloads; the corresponding reducer branches consume it instead of calling `new Date()`.
- `cleanupHarnessAssembliesForDeletedNetwork` accepts an explicit `nowIso` parameter and is called from `network/delete` with the action's timestamp.
- `attachPersistenceSync` exposes a new optional `debounceMs` (default 200 ms). Setting `debounceMs: 0` preserves the synchronous-save behaviour for tests that assert save call counts.
- `src/tests/store.create-store.spec.ts` opts into `debounceMs: 0` for the persistence feedback assertion.
- Added `isAiEndpointSecure(endpoint)` in `src/app/lib/aiSettings.ts`; `resolveAiProviderReadiness` returns the new `"insecureEndpoint"` status when the configured endpoint is not HTTPS (or localhost HTTP).
- `requestAiAgentProviderProposal` throws before sending the key if the endpoint is insecure.
- Added a `.settings-panel-warning` banner in the AI provider panel of `SettingsWorkspaceContent.tsx` describing where the API key lives and how it travels.
- `index.html` declares a CSP meta with `default-src 'self'`, scoped `connect-src` for OpenAI/Gemini plus generic `https:` (still required for the user-supplied logo fetch), and `object-src 'none'`.
- `render.yaml` adds HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a `Permissions-Policy` denying geolocation, microphone, camera, and `interest-cohort`.
- Dropped the `vitest`/`@vitest/coverage-v8` entries from `scripts/quality/check-npm-audit-allowlist.mjs`; the audit gate continues to pass with zero reported vulnerabilities.

## Version 1.15.0 - Security Hardening, Pure Reducers, Debounced Persistence

### Pure Reducers (1.1)

- Removed every `new Date().toISOString()` from `src/store/reducer/networkReducer.ts` and `src/store/reducer/harnessAssemblyReducer.ts`.
- Action payloads for `network/create`, `network/duplicate`, `network/delete`, and `network/importMany` now require `nowIso: string`; action creators in `src/store/actions.ts` default it via a single private helper.
- Time-travel debugging and deterministic action replay no longer depend on freezing `Date` globally.

### Debounced Persistence (1.4)

- `attachPersistenceSync` in `src/app/store.ts` schedules a single trailing `saveState` call per debounce window (200 ms default) regardless of how many actions arrive in that window.
- The detach handle clears any pending timer so React unmounts and explicit unsubscribes do not leak timers.
- Existing recovery, quota, and write-failure feedback paths are preserved.

### CSP & Security Headers (1.3)

- `index.html` declares a `Content-Security-Policy` meta covering `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `worker-src`, `manifest-src`, `object-src`, `base-uri`, and `form-action`.
- `render.yaml` extends the existing cache-control headers with HSTS, MIME-sniffing protection, referrer policy, frame ancestors, and a permissions policy.

### AI Provider Hardening (1.2)

- `src/app/lib/aiSettings.ts` exports `isAiEndpointSecure` and extends `AiProviderReadinessStatus` with `"insecureEndpoint"`.
- `requestAiAgentProviderProposal` throws if the configured endpoint is not HTTPS (or `http://localhost`).
- The AI provider Settings panel renders an explicit security notice describing the local storage and direct-to-provider transmission of the API key.

### Vitest 4 Sync (1.5)

- `package-lock.json` is already aligned with `vitest`/`@vitest/coverage-v8` `^4.1.8`; this release installs the new lockfile and prunes the obsolete allowlist entries that targeted `GHSA-5xrq-8626-4rwp`.

### Verification

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:dependency-audit`
- `npm run -s test:ci:segmentation:check`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:ui-timeout-governance`
- `npm run -s quality:hooks-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:exceljs-boundary`
- `npm run -s test:ci:fast`
- `npm run -s test:ci:ui`
- `npm run -s build:vite`
- `npm run -s quality:pwa`
