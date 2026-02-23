## item_198_import_export_file_format_versioning_migration_and_future_version_rejection - Import/Export File Format Versioning, Migration, and Future-Version Rejection
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: File Portability Contract with Backward Compatibility and Safe Forward-Incompatibility Handling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Exported files need explicit version metadata and a compatibility-aware import path, otherwise users risk losing data when moving files across app versions.

# Scope
- In:
  - Add version metadata to exported workspace/network payload files.
  - Detect file payload version during import.
  - Route legacy/older file payloads through migration before import.
  - Reject unsupported future-version file payloads safely with clear messaging.
  - Ensure failed imports do not mutate current workspace state.
- Out:
  - Cloud sync and remote version negotiation.
  - Support for downgrading exports to older app versions.

# Acceptance criteria
- Exported files include explicit version metadata.
- Supported legacy files import through migration successfully.
- Unsupported future-version files are rejected safely without state mutation.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_033`, item_195, item_196.
- Blocks: item_200, item_202.
- Related AC: AC2, AC4, AC5, AC7.
- References:
  - `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
  - `src/app/hooks/useNetworkImportExport.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/networkReducer.ts`
  - `src/tests/app.ui.import-export.spec.tsx`

