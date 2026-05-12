export interface HomeChangelogEntry {
  version: string;
  content: string;
  sourcePath: string;
}

export interface HomeChangelogEntrySummary {
  version: string;
  sourcePath: string;
}

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

const ROOT_CHANGELOG_LOADERS = import.meta.glob<string>("../../../changelogs/CHANGELOGS_*.md", {
  query: "?raw",
  import: "default"
});

function parseVersionFromSourcePath(sourcePath: string): ParsedVersion | null {
  const match = /CHANGELOGS_(\d+)_(\d+)_(\d+)\.md$/i.exec(sourcePath);
  if (match === null) {
    return null;
  }

  const major = Number.parseInt(match[1] ?? "", 10);
  const minor = Number.parseInt(match[2] ?? "", 10);
  const patch = Number.parseInt(match[3] ?? "", 10);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  return { major, minor, patch };
}

function compareVersionsDesc(left: ParsedVersion, right: ParsedVersion): number {
  if (left.major !== right.major) {
    return right.major - left.major;
  }
  if (left.minor !== right.minor) {
    return right.minor - left.minor;
  }
  return right.patch - left.patch;
}

export function buildHomeChangelogEntriesFromModules(
  modulesBySourcePath: Readonly<Record<string, string>>
): HomeChangelogEntry[] {
  const entriesWithVersion = Object.entries(modulesBySourcePath).flatMap(([sourcePath, content]) => {
    const parsedVersion = parseVersionFromSourcePath(sourcePath);
    if (parsedVersion === null) {
      return [];
    }

    return [
      {
        sourcePath,
        content,
        parsedVersion
      }
    ];
  });

  entriesWithVersion.sort((left, right) => {
    const versionCompare = compareVersionsDesc(left.parsedVersion, right.parsedVersion);
    if (versionCompare !== 0) {
      return versionCompare;
    }
    return left.sourcePath.localeCompare(right.sourcePath);
  });

  return entriesWithVersion.map((entry) => ({
    version: `${entry.parsedVersion.major}.${entry.parsedVersion.minor}.${entry.parsedVersion.patch}`,
    content: entry.content.trim(),
    sourcePath: entry.sourcePath
  }));
}

export function buildHomeChangelogEntrySummariesFromPaths(sourcePaths: readonly string[]): HomeChangelogEntrySummary[] {
  const entriesWithVersion = sourcePaths.flatMap((sourcePath) => {
    const parsedVersion = parseVersionFromSourcePath(sourcePath);
    if (parsedVersion === null) {
      return [];
    }

    return [
      {
        sourcePath,
        parsedVersion
      }
    ];
  });

  entriesWithVersion.sort((left, right) => {
    const versionCompare = compareVersionsDesc(left.parsedVersion, right.parsedVersion);
    if (versionCompare !== 0) {
      return versionCompare;
    }
    return left.sourcePath.localeCompare(right.sourcePath);
  });

  return entriesWithVersion.map((entry) => ({
    version: `${entry.parsedVersion.major}.${entry.parsedVersion.minor}.${entry.parsedVersion.patch}`,
    sourcePath: entry.sourcePath
  }));
}

export const HOME_CHANGELOG_ENTRY_SUMMARIES = buildHomeChangelogEntrySummariesFromPaths(Object.keys(ROOT_CHANGELOG_LOADERS));

export async function loadHomeChangelogEntryContent(sourcePath: string): Promise<string> {
  const loader = ROOT_CHANGELOG_LOADERS[sourcePath];
  if (loader === undefined) {
    return "";
  }
  return (await loader()).trim();
}

export async function loadHomeChangelogEntries(): Promise<HomeChangelogEntry[]> {
  return Promise.all(
    HOME_CHANGELOG_ENTRY_SUMMARIES.map(async (entry) => ({
      ...entry,
      content: await loadHomeChangelogEntryContent(entry.sourcePath)
    }))
  );
}
