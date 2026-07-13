import type { AppLocale } from "../types/app-controller";
import enCatalog from "../i18n/en.json";
import frCatalog from "../i18n/fr.json";

export const DEFAULT_APP_LOCALE: AppLocale = "en";

const CATALOGS: Record<AppLocale, unknown> = { en: enCatalog, fr: frCatalog };

function catalogValue(catalog: unknown, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (typeof current !== "object" || current === null || !(segment in current)) return undefined;
    return (current as Record<string, unknown>)[segment];
  }, catalog);
  return typeof value === "string" ? value : undefined;
}

export function translate(locale: AppLocale, key: string): string {
  return catalogValue(CATALOGS[locale], key) ?? catalogValue(enCatalog, key) ?? key;
}

const LEGACY_KEY_BY_EN_TEXT: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(enCatalog.legacy).map(([key, value]) => [value, key])
);

export function normalizeAppLocale(value: unknown): AppLocale {
  return value === "fr" ? "fr" : "en";
}

function preserveCase(source: string, translated: string): string {
  if (source.toUpperCase() === source) {
    return translated.toUpperCase();
  }
  return translated;
}

export function translateTextValue(locale: AppLocale, input: string): string {
  if (locale === "en") {
    return input;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return input;
  }

  const legacyKey = LEGACY_KEY_BY_EN_TEXT[trimmed];
  const direct = legacyKey === undefined ? undefined : catalogValue(frCatalog, `legacy.${legacyKey}`);
  if (direct !== undefined) {
    return input.replace(trimmed, preserveCase(trimmed, direct));
  }

  const idleRowMatch = /^Select a\s+(.+)\s+row to view or edit it, or create a new one\.$/i.exec(trimmed);
  if (idleRowMatch !== null) {
    const entity = (idleRowMatch[1] ?? "").trim();
    const entityByEnglish: Record<string, string> = {
      connector: "connecteur",
      splice: "épissure",
      node: "nœud",
      segment: "segment",
      wire: "fil",
      catalog: "catalogue"
    };
    const translatedEntity = entityByEnglish[entity.toLowerCase()] ?? translateTextValue(locale, entity).trim();
    return input.replace(trimmed, `Sélectionnez une ligne ${translatedEntity} pour la consulter ou la modifier, ou créez-en une nouvelle.`);
  }

  const manufacturerReferenceLineMatch = /^Manufacturer reference:\s*(.+)$/i.exec(trimmed);
  if (manufacturerReferenceLineMatch !== null) {
    const value = manufacturerReferenceLineMatch[1] ?? "";
    return input.replace(trimmed, `Référence fabricant : ${value}`);
  }

  const unitPriceLabelMatch = /^Unit price \(excl\. tax\)\s*\[(.+)\]$/i.exec(trimmed);
  if (unitPriceLabelMatch !== null) {
    const currencyCode = unitPriceLabelMatch[1] ?? "";
    return input.replace(trimmed, `Prix unitaire (HT) [${currencyCode}]`);
  }

  const missingCatalogItemMatch = /^Missing catalog item\s*\((.+)\)$/i.exec(trimmed);
  if (missingCatalogItemMatch !== null) {
    const itemId = missingCatalogItemMatch[1] ?? "";
    return input.replace(trimmed, `Élément catalogue manquant (${itemId})`);
  }

  const capturedPlacementMatch = /^Canvas placement captured at x=([-+]?\d+),\s*y=([-+]?\d+)\.$/i.exec(trimmed);
  if (capturedPlacementMatch !== null) {
    const x = capturedPlacementMatch[1] ?? "0";
    const y = capturedPlacementMatch[2] ?? "0";
    return input.replace(trimmed, `Position canvas capturée à x=${x}, y=${y}.`);
  }

  const occupiedCountMatch = /^(\d+)\s*\/\s*Occupied\s+(\d+)$/i.exec(trimmed);
  if (occupiedCountMatch !== null) {
    const [, totalCount, occupiedCount] = occupiedCountMatch;
    return input.replace(trimmed, `${totalCount} / Occupé ${occupiedCount}`);
  }

  const wayIndexRangeMatch = /^Way index must be between 1 and (\d+)\.$/i.exec(trimmed);
  if (wayIndexRangeMatch !== null) {
    const [, maxIndex] = wayIndexRangeMatch;
    return input.replace(trimmed, `L'index de voie doit être entre 1 et ${maxIndex}.`);
  }

  const portIndexRangeMatch = /^Port index must be between 1 and (\d+)\.$/i.exec(trimmed);
  if (portIndexRangeMatch !== null) {
    const [, maxIndex] = portIndexRangeMatch;
    return input.replace(trimmed, `L'index de port doit être entre 1 et ${maxIndex}.`);
  }

  const wayUsedMatch = /^Way\s+C(\d+)\s+is already used\s+\((.+)\)\.(.*)$/i.exec(trimmed);
  if (wayUsedMatch !== null) {
    const [, wayIndex, occupantRef, suffixRaw] = wayUsedMatch;
    const suffix = (suffixRaw ?? "").trim();
    const translatedSuffix = suffix.length > 0 ? ` ${translateTextValue(locale, suffix).trim()}` : "";
    return input.replace(trimmed, `La voie C${wayIndex} est déjà utilisée (${occupantRef}).${translatedSuffix}`);
  }

  const portUsedMatch = /^Port\s+P(\d+)\s+is already used\s+\((.+)\)\.(.*)$/i.exec(trimmed);
  if (portUsedMatch !== null) {
    const [, portIndex, occupantRef, suffixRaw] = portUsedMatch;
    const suffix = (suffixRaw ?? "").trim();
    const translatedSuffix = suffix.length > 0 ? ` ${translateTextValue(locale, suffix).trim()}` : "";
    return input.replace(trimmed, `Le port P${portIndex} est déjà utilisé (${occupantRef}).${translatedSuffix}`);
  }

  const suggestedWayMatch = /^Suggested:\s*C(\d+)\.$/i.exec(trimmed);
  if (suggestedWayMatch !== null) {
    const [, wayIndex] = suggestedWayMatch;
    return input.replace(trimmed, `Suggestion : C${wayIndex}.`);
  }

  const suggestedPortMatch = /^Suggested:\s*P(\d+)\.$/i.exec(trimmed);
  if (suggestedPortMatch !== null) {
    const [, portIndex] = suggestedPortMatch;
    return input.replace(trimmed, `Suggestion : P${portIndex}.`);
  }

  const stepMatch = /^Step\s+(\d+)\s+of\s+(\d+)$/i.exec(trimmed);
  if (stepMatch !== null) {
    const [, step, total] = stepMatch;
    return input.replace(trimmed, `Étape ${step} sur ${total}`);
  }

  const openMatch = /^Open\s+(.+)$/i.exec(trimmed);
  if (openMatch !== null) {
    const openTarget = openMatch[1] ?? "";
    return input.replace(trimmed, `Ouvrir ${translateTextValue(locale, openTarget).trim()}`);
  }

  const scrollToMatch = /^Scroll to\s+(.+)$/i.exec(trimmed);
  if (scrollToMatch !== null) {
    const scrollTarget = scrollToMatch[1] ?? "";
    return input.replace(trimmed, `Aller à ${translateTextValue(locale, scrollTarget).trim()}`);
  }

  const lastImportMatch =
    /^Last import:\s*(\d+)\s+imported\s*\/\s*(\d+)\s+skipped(?:\s*\/\s*(\d+)\s+warnings)?(?:\s*\/\s*(\d+)\s+errors)?\.$/i.exec(
      trimmed
    );
  if (lastImportMatch !== null) {
    const importedCount = Number(lastImportMatch[1] ?? "0");
    const skippedCount = Number(lastImportMatch[2] ?? "0");
    const warningsCountRaw = lastImportMatch[3];
    const errorsCountRaw = lastImportMatch[4];
    let translated = `Dernier import : ${importedCount} importé${importedCount > 1 ? "s" : ""} / ${skippedCount} ignoré${skippedCount > 1 ? "s" : ""}`;
    if (warningsCountRaw !== undefined) {
      const warningsCount = Number(warningsCountRaw);
      translated += ` / ${warningsCount} avertissement${warningsCount > 1 ? "s" : ""}`;
    }
    if (errorsCountRaw !== undefined) {
      const errorsCount = Number(errorsCountRaw);
      translated += ` / ${errorsCount} erreur${errorsCount > 1 ? "s" : ""}`;
    }
    translated += ".";
    return input.replace(trimmed, translated);
  }

  const exportedCatalogItemsMatch = /^Exported\s+(\d+)\s+catalog item\(s\)\.$/i.exec(trimmed);
  if (exportedCatalogItemsMatch !== null) {
    const count = Number(exportedCatalogItemsMatch[1] ?? "0");
    return input.replace(trimmed, `${count} élément${count > 1 ? "s" : ""} catalogue exporté${count > 1 ? "s" : ""}.`);
  }

  const importedCatalogRowsMatch = /^Imported\s+(\d+)\s+catalog row\(s\):\s+(\d+)\s+created\s*\/\s*(\d+)\s+updated\.$/i.exec(trimmed);
  if (importedCatalogRowsMatch !== null) {
    const rowCount = Number(importedCatalogRowsMatch[1] ?? "0");
    const createdCount = Number(importedCatalogRowsMatch[2] ?? "0");
    const updatedCount = Number(importedCatalogRowsMatch[3] ?? "0");
    return input.replace(
      trimmed,
      `${rowCount} ligne${rowCount > 1 ? "s" : ""} catalogue importée${rowCount > 1 ? "s" : ""} : ${createdCount} créée${createdCount > 1 ? "s" : ""} / ${updatedCount} mise${updatedCount > 1 ? "s" : ""} à jour.`
    );
  }

  const importCatalogRowsConfirmMatch =
    /^Import\s+(\d+)\s+catalog row\(s\)\s+into the current catalog\?\s+Existing items are matched by manufacturer reference\.$/i.exec(
      trimmed
    );
  if (importCatalogRowsConfirmMatch !== null) {
    const rowCount = Number(importCatalogRowsConfirmMatch[1] ?? "0");
    return input.replace(
      trimmed,
      `Importer ${rowCount} ligne${rowCount > 1 ? "s" : ""} catalogue dans le catalogue courant ? Les éléments existants sont appariés par référence fabricant.`
    );
  }

  const catalogImportFailedAtRowMatch = /^Catalog CSV import failed at row\s+(\d+):\s+(.+)$/i.exec(trimmed);
  if (catalogImportFailedAtRowMatch !== null) {
    const rowNumber = catalogImportFailedAtRowMatch[1] ?? "0";
    const reason = translateTextValue(locale, catalogImportFailedAtRowMatch[2] ?? "").trim();
    return input.replace(trimmed, `Échec de l'import CSV catalogue à la ligne ${rowNumber} : ${reason}`);
  }

  const catalogImportAbortedSummaryMatch =
    /^Catalog CSV import aborted\s+\((.+)\):\s+(\d+)\s+rows parsed,\s+(\d+)\s+warnings,\s+(\d+)\s+errors\.$/i.exec(trimmed);
  if (catalogImportAbortedSummaryMatch !== null) {
    const fileName = catalogImportAbortedSummaryMatch[1] ?? "";
    const rowCount = Number(catalogImportAbortedSummaryMatch[2] ?? "0");
    const warningCount = Number(catalogImportAbortedSummaryMatch[3] ?? "0");
    const errorCount = Number(catalogImportAbortedSummaryMatch[4] ?? "0");
    return input.replace(
      trimmed,
      `Import CSV catalogue interrompu (${fileName}) : ${rowCount} ligne${rowCount > 1 ? "s" : ""} analysée${rowCount > 1 ? "s" : ""}, ${warningCount} avertissement${warningCount > 1 ? "s" : ""}, ${errorCount} erreur${errorCount > 1 ? "s" : ""}.`
    );
  }

  const catalogImportSkippedMatch = /^Catalog CSV import skipped\s+\((.+)\):\s+no row imported\.$/i.exec(trimmed);
  if (catalogImportSkippedMatch !== null) {
    const fileName = catalogImportSkippedMatch[1] ?? "";
    return input.replace(trimmed, `Import CSV catalogue ignoré (${fileName}) : aucune ligne importée.`);
  }

  const catalogImportBlockedDuplicatesMatch =
    /^Catalog import blocked:\s+existing catalog has duplicate manufacturer reference '(.+)'\.$/i.exec(trimmed);
  if (catalogImportBlockedDuplicatesMatch !== null) {
    const reference = catalogImportBlockedDuplicatesMatch[1] ?? "";
    return input.replace(trimmed, `Import catalogue bloqué : le catalogue existant contient une référence fabricant dupliquée '${reference}'.`);
  }

  const catalogImportAbortedAfterRowsMatch = /^Catalog CSV import aborted after\s+(\d+)\s+row\(s\);\s+(\d+)\s+warnings in file\.$/i.exec(
    trimmed
  );
  if (catalogImportAbortedAfterRowsMatch !== null) {
    const importedRows = Number(catalogImportAbortedAfterRowsMatch[1] ?? "0");
    const warningCount = Number(catalogImportAbortedAfterRowsMatch[2] ?? "0");
    return input.replace(
      trimmed,
      `Import CSV catalogue interrompu après ${importedRows} ligne${importedRows > 1 ? "s" : ""} ; ${warningCount} avertissement${warningCount > 1 ? "s" : ""} dans le fichier.`
    );
  }

  const catalogImportFailedOnReferenceMatch = /^Catalog import failed on '(.+)':\s+(.+)$/i.exec(trimmed);
  if (catalogImportFailedOnReferenceMatch !== null) {
    const manufacturerReference = catalogImportFailedOnReferenceMatch[1] ?? "";
    const reason = translateTextValue(locale, catalogImportFailedOnReferenceMatch[2] ?? "").trim();
    return input.replace(trimmed, `Échec de l'import catalogue sur '${manufacturerReference}' : ${reason}`);
  }

  const lastCatalogImportSummaryMatch =
    /^Last catalog CSV import\s+\((.+)\):\s+(\d+)\s+rows,\s+(\d+)\s+warnings,\s+(\d+)\s+errors\.$/i.exec(trimmed);
  if (lastCatalogImportSummaryMatch !== null) {
    const fileName = lastCatalogImportSummaryMatch[1] ?? "";
    const rowCount = Number(lastCatalogImportSummaryMatch[2] ?? "0");
    const warningCount = Number(lastCatalogImportSummaryMatch[3] ?? "0");
    const errorCount = Number(lastCatalogImportSummaryMatch[4] ?? "0");
    return input.replace(
      trimmed,
      `Dernier import CSV catalogue (${fileName}) : ${rowCount} ligne${rowCount > 1 ? "s" : ""}, ${warningCount} avertissement${warningCount > 1 ? "s" : ""}, ${errorCount} erreur${errorCount > 1 ? "s" : ""}.`
    );
  }

  const validationCounterMatch = /^(\d+)\s+validation issue(?:s)?(?:,\s+(\d+)\s+error(?:s)?)?(?:,\s+no errors)?$/i.exec(trimmed);
  if (validationCounterMatch !== null) {
    const issueCount = Number(validationCounterMatch[1] ?? "0");
    const errorCountRaw = validationCounterMatch[2];
    if (errorCountRaw !== undefined) {
      const errorCount = Number(errorCountRaw);
      return input.replace(
        trimmed,
        `${issueCount} issue${issueCount > 1 ? "s" : ""} de validation, ${errorCount} erreur${errorCount > 1 ? "s" : ""}`
      );
    }
    return input.replace(trimmed, `${issueCount} issue${issueCount > 1 ? "s" : ""} de validation, aucune erreur`);
  }

  const issueCounterMatch = /^(\d+)\s+issue(?:s)?(?:,\s+(\d+)\s+error(?:s)?)?(?:,\s+no errors)?$/i.exec(trimmed);
  if (issueCounterMatch !== null) {
    const issueCount = Number(issueCounterMatch[1] ?? "0");
    const errorCountRaw = issueCounterMatch[2];
    if (errorCountRaw !== undefined) {
      const errorCount = Number(errorCountRaw);
      return input.replace(trimmed, `${issueCount} issue${issueCount > 1 ? "s" : ""}, ${errorCount} erreur${errorCount > 1 ? "s" : ""}`);
    }
    return input.replace(trimmed, `${issueCount} issue${issueCount > 1 ? "s" : ""}, aucune erreur`);
  }

  const importedNetworksMatch = /^Imported\s+(\d+)\s+network\(s\)\.$/i.exec(trimmed);
  if (importedNetworksMatch !== null) {
    const count = Number(importedNetworksMatch[1] ?? "0");
    return input.replace(trimmed, `${count} réseau${count > 1 ? "x" : ""} importé${count > 1 ? "s" : ""}.`);
  }

  return input;
}
