export interface HomeChangelogEntry {
  version: string;
  content: string;
  sourcePath: string;
}

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

const ROOT_CHANGELOG_MODULES = import.meta.glob<string>("../../../CHANGELOGS_*.md", {
  query: "?raw",
  import: "default",
  eager: true
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

export function buildHomeChangelogEntries(): HomeChangelogEntry[] {
  const entriesWithVersion = Object.entries(ROOT_CHANGELOG_MODULES).flatMap(([sourcePath, content]) => {
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

export const HOME_CHANGELOG_ENTRIES = buildHomeChangelogEntries();
