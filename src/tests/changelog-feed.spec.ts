import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildHomeChangelogEntriesFromModules } from "../app/lib/changelogFeed";

describe("home changelog feed", () => {
  it("sorts versions descending, trims content, and ignores non-matching files", () => {
    const entries = buildHomeChangelogEntriesFromModules({
      "../../../changelogs/CHANGELOGS_0_9_16.md": "  Latest notes \n",
      "../../../changelogs/CHANGELOGS_0_10_0.md": "\nNext major minor\n",
      "../../../changelogs/CHANGELOGS_0_8_1.md": "Older",
      "../../../changelogs/README.md": "ignore me",
      "../../../changelogs/CHANGELOGS_foo_bar_baz.md": "ignore me too",
      "../../../changelogs/CHANGELOGS_0_9_16.txt": "wrong extension"
    });

    expect(entries.map((entry) => entry.version)).toEqual(["0.10.0", "0.9.16", "0.8.1"]);
    expect(entries[0]?.content).toBe("Next major minor");
    expect(entries[1]?.content).toBe("Latest notes");
    expect(entries[2]?.content).toBe("Older");
  });

  it("uses source path lexical order as tie-breaker for same version", () => {
    const entries = buildHomeChangelogEntriesFromModules({
      "../../../changelogs/zeta/CHANGELOGS_0_9_16.md": "Z",
      "../../../changelogs/alpha/CHANGELOGS_0_9_16.md": "A"
    });

    expect(entries).toHaveLength(2);
    expect(entries[0]?.sourcePath).toBe("../../../changelogs/alpha/CHANGELOGS_0_9_16.md");
    expect(entries[1]?.sourcePath).toBe("../../../changelogs/zeta/CHANGELOGS_0_9_16.md");
  });

  it("keeps every root changelog compatible with the home feed section format", () => {
    const changelogDirectory = join(process.cwd(), "changelogs");
    const changelogFiles = readdirSync(changelogDirectory)
      .filter((fileName) => /^CHANGELOGS_\d+_\d+_\d+\.md$/.test(fileName))
      .sort();

    expect(changelogFiles.length).toBeGreaterThan(0);

    for (const fileName of changelogFiles) {
      const content = readFileSync(join(changelogDirectory, fileName), "utf8");
      const majorHighlightsIndex = content.indexOf("## Major Highlights");
      const firstVersionSectionIndex = content.search(/^## Version /m);

      expect(majorHighlightsIndex, `${fileName} should include Major Highlights`).toBeGreaterThan(-1);
      if (firstVersionSectionIndex !== -1) {
        expect(majorHighlightsIndex, `${fileName} should list Major Highlights before Version sections`).toBeLessThan(firstVersionSectionIndex);
      }
    }
  });
});
