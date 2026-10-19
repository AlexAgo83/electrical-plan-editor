import { translateCurrent as t } from "../i18n";
import { decodeText } from "./lineageDirectory";
import { LINEAGE_MANIFEST_FILE_NAME, parseLineageManifest } from "./lineageFormat";
import { FolderLineageDirectory, type FolderDirectoryHandle } from "./lineageLibrary";

/** Inspect only the selected root and immediate children. Never repair or initialize candidates. */
export async function resolveLineageFolder(root: FolderDirectoryHandle, workspaceId: string): Promise<FolderDirectoryHandle> {
  const matches: FolderDirectoryHandle[] = [];
  const inspect = async (handle: FolderDirectoryHandle, selected: boolean): Promise<boolean> => {
    const bytes = await new FolderLineageDirectory(handle).readFile(LINEAGE_MANIFEST_FILE_NAME);
    if (bytes === null) return false;
    const parsed = parseLineageManifest(decodeText(bytes));
    if (!parsed.ok) {
      if (selected) throw new Error(t("ui.workspaceLineageErrorInvalidFolder"));
      return true;
    }
    if (parsed.manifest.workspaceId === workspaceId) matches.push(handle);
    return true;
  };
  const isRoot = await inspect(root, true);
  if (!isRoot && root.values !== undefined) {
    for await (const entry of root.values()) {
      if ("getDirectoryHandle" in entry) await inspect(entry, false);
    }
  }
  if (matches.length === 0) throw new Error(t("ui.workspaceLineageErrorWrongFolder"));
  if (matches.length > 1) throw new Error(t("ui.workspaceLineageErrorAmbiguousFolder"));
  return matches[0]!;
}
