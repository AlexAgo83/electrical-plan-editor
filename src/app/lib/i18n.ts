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

type TranslationValues = Readonly<Record<string, string | number>>;

let activeLocale: AppLocale = DEFAULT_APP_LOCALE;

export function setActiveLocale(locale: AppLocale): void {
  activeLocale = locale;
}

export function translate(locale: AppLocale, key: string, values: TranslationValues = {}): string {
  const template = catalogValue(CATALOGS[locale], key) ?? catalogValue(enCatalog, key) ?? key;
  return template.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

export function translateCurrent(key: string, values: TranslationValues = {}): string {
  return translate(activeLocale, key, values);
}


export function normalizeAppLocale(value: unknown): AppLocale {
  return value === "fr" ? "fr" : "en";
}
