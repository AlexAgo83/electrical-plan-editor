// @vitest-environment node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
// eslint-disable-next-line no-restricted-imports -- Exercise the overridden Node XLSX dependency chain.
import ExcelJS from "exceljs";

const directories: string[] = [];
function temporaryDirectory() {
  const directory = mkdtempSync(path.join(tmpdir(), "dependency-overrides-"));
  directories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

it("preserves Archiver file expansion with the patched glob and minimatch", () => {
  const require = createRequire(import.meta.url);
  const excelRequire = createRequire(require.resolve("exceljs"));
  const archiverRequire = createRequire(excelRequire.resolve("archiver"));
  const utils = archiverRequire("archiver-utils") as {
    file: { expand: (options: { cwd: string }, patterns: string[]) => string[] };
  };
  const directory = temporaryDirectory();
  mkdirSync(path.join(directory, "nested"));
  writeFileSync(path.join(directory, "nested", "included.txt"), "included");
  writeFileSync(path.join(directory, "nested", "excluded.txt"), "excluded");
  expect(utils.file.expand({ cwd: directory }, ["**/*.txt", "!**/excluded.txt"]))
    .toEqual(["nested/included.txt"]);
});

it("roundtrips streaming XLSX output through the overridden unzipper", async () => {
  const filename = path.join(temporaryDirectory(), "roundtrip.xlsx");
  const writer = new ExcelJS.stream.xlsx.WorkbookWriter({ filename });
  writer.addWorksheet("Data").addRow(["dependency compatibility", 42]).commit();
  await writer.commit();
  const reader = new ExcelJS.Workbook();
  await reader.xlsx.readFile(filename);
  expect(reader.getWorksheet("Data")?.getCell("A1").value).toBe("dependency compatibility");
  expect(reader.getWorksheet("Data")?.getCell("B1").value).toBe(42);
});
