# Changelog (`1.6.2 -> 1.6.3`)

## Major Highlights

- Added a native `Save As` flow for JSON network exports when the browser supports the File System Access API.
- Kept the previous download-based export path as a fallback for browsers that do not expose the native save picker.
- Fixed the TypeScript/ESLint safety issue in the save-picker integration so CI passes on `main`.

## Version 1.6.3 - Export Save-As Reliability

### Native Save Dialog

- Exporting a network can now open a system file-save dialog where the user chooses the destination folder and can rename the file before saving.
- The suggested filename still follows the existing timestamped export naming convention.

### Compatibility Fallback

- Browsers without `showSaveFilePicker` continue to use the existing download flow.
- Cancelling the native picker no longer degrades into an unnecessary fallback download.

### CI and Regression Coverage

- Hardened the picker detection with safe runtime narrowing compatible with the repo's strict TypeScript ESLint rules.
- Added regression coverage for the native save-picker export path.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npx vitest run src/tests/network-import-export.spec.ts --pool=forks --maxWorkers=2`
- `npm run -s build`
