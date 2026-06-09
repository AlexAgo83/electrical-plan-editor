# Changelog (`1.15.3 -> 1.15.4`)

## Major Highlights

- Local-first persistence is durable again across tab close, reload, navigation, tab hide, and component unmount. Edits made within the 200 ms debounce window introduced in `1.15.0` are no longer silently lost.
- A pending debounced save is now flushed synchronously on `pagehide` and on `visibilitychange` when the document becomes hidden, and also when the persistence subscription is detached.
- The synchronous write completes the `localStorage` write before any storage-pressure estimation, so the save survives page teardown where an awaited write would not.

## Patch Notes

- Added `saveStateSync` in `src/adapters/persistence/localStorage.ts`, which writes the snapshot immediately without awaiting `navigator.storage.estimate()`.
- Refactored `saveState` to write the snapshot first (via a shared `writeStateSnapshot` helper) and only then compute the non-blocking near-quota warning, so durability no longer depends on the asynchronous storage estimate.
- `attachPersistenceSync` in `src/app/store.ts` now registers `pagehide` and `visibilitychange` listeners that flush a pending save through the synchronous path, and removes those listeners on detach.
- The detach handle flushes a pending save before clearing the debounce timer and unsubscribing, instead of discarding it.
- The synchronous flush is a no-op when no debounce timer is pending, so `debounceMs: 0` (synchronous) behavior and existing save-count assertions are unchanged.
- A late-resolving asynchronous save can no longer overwrite the feedback produced by a forced synchronous flush, thanks to a shared save-sequence guard.
- Added `src/tests/store.persistence-durability.spec.ts` covering page-hide flush, visibility-hidden flush, no-flush-while-visible, detach flush, the `debounceMs: 0` no-op, lifecycle-listener cleanup, and synchronous-write ordering.

## Version 1.15.4 - Persistence Durability on Tab Close and Unmount

### Lifecycle Flush

- A pending debounced save is forced to `localStorage` when the page is hidden (`visibilitychange` -> `hidden`) or unloaded (`pagehide`), and when `attachPersistenceSync` is detached.
- `beforeunload` is intentionally avoided to preserve back/forward-cache eligibility; the hidden-state and pagehide signals cover close, reload, navigation, and tab switching.

### Synchronous Write Path

- `saveStateSync` performs the `localStorage` write synchronously, before any awaited storage-pressure estimation, so the durable write completes before the page tears down.
- `saveState` writes first and then augments the result with the near-quota warning, keeping quota, recovery, and write-failure feedback intact.

### Preserved In-Session Behavior

- Normal editing keeps the 200 ms trailing debounce, so bursts of dispatches still collapse to a single write.
- Recovery, quota-exceeded, storage-near-quota, and write-failure feedback paths are unchanged.

### Architecture

- The durability contract (lifecycle flush plus synchronous write) is recorded in `adr_011`.

### Verification

- `logics-manager lint --require-status`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s ci:blocking`
