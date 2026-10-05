import deCatalogue from "./catalogues/de.json";
import enAuCatalogue from "./catalogues/en-AU.json";
import enXaCatalogue from "./catalogues/en-XA.json";
import esCatalogue from "./catalogues/es.json";
import elCatalogue from "./catalogues/el.json";
import jaCatalogue from "./catalogues/ja.json";
import srCyrlCatalogue from "./catalogues/sr-Cyrl.json";
import srLatnCatalogue from "./catalogues/sr-Latn.json";
import zhHansCatalogue from "./catalogues/zh-Hans.json";
import filCatalogue from "./catalogues/fil.json";
import frCatalogue from "./catalogues/fr.json";
import huCatalogue from "./catalogues/hu.json";
import idCatalogue from "./catalogues/id.json";
import itCatalogue from "./catalogues/it.json";
import nlCatalogue from "./catalogues/nl.json";
import plCatalogue from "./catalogues/pl.json";
import ptBrCatalogue from "./catalogues/pt-BR.json";
import ptPtCatalogue from "./catalogues/pt-PT.json";
import ruCatalogue from "./catalogues/ru.json";
import slCatalogue from "./catalogues/sl.json";
import trCatalogue from "./catalogues/tr.json";
import ukCatalogue from "./catalogues/uk.json";
import viCatalogue from "./catalogues/vi.json";
import localeRegistryData from "./locales.json";
import type {
  InterpolationValues,
  LocaleMetadata,
  TextDirection,
} from "./types";

export {
  formatRegionalDate,
  formatRegionalNumber,
  getRegionalFormattingLocale,
} from "./formatting";
export type {
  InterpolationValue,
  InterpolationValues,
  LocaleMetadata,
  TextDirection,
} from "./types";

export const CANONICAL_LOCALE = localeRegistryData.canonicalLocale;
export const LANGUAGE_OVERRIDE_STORAGE_KEY = "safexMine.uiLanguage";

const catalogues: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  de: deCatalogue,
  "en-AU": enAuCatalogue,
  "en-XA": enXaCatalogue,
  es: esCatalogue,
  el: elCatalogue,
  ja: jaCatalogue,
  "sr-Cyrl": srCyrlCatalogue,
  "sr-Latn": srLatnCatalogue,
  "zh-Hans": zhHansCatalogue,
  fil: filCatalogue,
  fr: frCatalogue,
  hu: huCatalogue,
  id: idCatalogue,
  it: itCatalogue,
  nl: nlCatalogue,
  pl: plCatalogue,
  "pt-BR": ptBrCatalogue,
  "pt-PT": ptPtCatalogue,
  ru: ruCatalogue,
  sl: slCatalogue,
  tr: trCatalogue,
  uk: ukCatalogue,
  vi: viCatalogue,
};

export const supportedLocales: readonly LocaleMetadata[] =
  localeRegistryData.locales.map((locale) => ({
    id: locale.id,
    nativeName: locale.nativeName,
    direction: locale.direction as TextDirection,
    fallback: locale.fallback,
    enabled: locale.enabled,
    developerOnly: "developerOnly" in locale
      ? locale.developerOnly
      : false,
  }));

const localeById = new Map(
  supportedLocales.map((locale) => [locale.id, locale] as const),
);

let uiLocale = CANONICAL_LOCALE;

const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

export function isSupportedLocale(localeId: string): boolean {
  const locale = localeById.get(localeId);

  return (
    locale?.enabled === true ||
    (import.meta.env.DEV && locale?.developerOnly === true)
  );
}

export function resolveLocale(localeId?: string | null): string {
  if (localeId && isSupportedLocale(localeId)) {
    return localeId;
  }

  return CANONICAL_LOCALE;
}

export function getUiLocale(): string {
  return uiLocale;
}

export function getLocaleMetadata(
  localeId: string = uiLocale,
): LocaleMetadata {
  return (
    localeById.get(resolveLocale(localeId)) ??
    localeById.get(CANONICAL_LOCALE)!
  );
}

export function setUiLocale(localeId?: string | null): string {
  uiLocale = resolveLocale(localeId);
  return uiLocale;
}

export function getLanguageOverride(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): string | null {
  try {
    const storedLocale = storage.getItem(LANGUAGE_OVERRIDE_STORAGE_KEY);
    return storedLocale && isSupportedLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
}

export function setLanguageOverride(
  localeId: string | null,
  storage: Pick<Storage, "setItem" | "removeItem"> = window.localStorage,
): boolean {
  try {
    if (localeId === null) {
      storage.removeItem(LANGUAGE_OVERRIDE_STORAGE_KEY);
      return true;
    }

    if (!isSupportedLocale(localeId)) {
      return false;
    }

    storage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, localeId);
    return true;
  } catch {
    return false;
  }
}

export function interpolate(
  template: string,
  values: InterpolationValues = {},
): string {
  return template.replace(PLACEHOLDER_PATTERN, (placeholder, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, name)) {
      return placeholder;
    }

    return String(values[name]);
  });
}

export function translate(
  key: string,
  values: InterpolationValues = {},
  localeId: string = uiLocale,
): string {
  const resolvedLocale = resolveLocale(localeId);
  const template =
    catalogues[resolvedLocale]?.[key] ?? catalogues[CANONICAL_LOCALE]?.[key];

  if (template === undefined) {
    return key;
  }

  return interpolate(template, values);
}
