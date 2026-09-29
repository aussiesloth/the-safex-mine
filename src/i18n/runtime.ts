import { invoke } from "@tauri-apps/api/core";

import {
  CANONICAL_LOCALE,
  getLanguageOverride,
  getLocaleMetadata,
  setLanguageOverride,
  setUiLocale,
  supportedLocales,
} from "./index";

interface WindowsLocaleSelection {
  preferredLanguages: string[];
  matchedLocale: string | null;
}

export const UI_LANGUAGE_CHANGED_EVENT =
  "safex-mine:ui-language-changed";

let initialisationPromise: Promise<string> | null = null;
let windowsLocaleSelection: WindowsLocaleSelection = {
  preferredLanguages: [],
  matchedLocale: null,
};

function enabledLocaleIds(): string[] {
  return supportedLocales
    .filter((locale) => locale.enabled)
    .map((locale) => locale.id);
}

function applyDocumentLanguage(localeId: string) {
  const metadata = getLocaleMetadata(localeId);

  document.documentElement.lang = metadata.id;
  document.documentElement.dir = metadata.direction;
}

function applyResolvedLocale(localeId: string): string {
  const resolvedLocale = setUiLocale(localeId);
  applyDocumentLanguage(resolvedLocale);
  return resolvedLocale;
}

async function initialiseUiLanguage(): Promise<string> {
  try {
    windowsLocaleSelection =
      await invoke<WindowsLocaleSelection>(
        "windows_locale_selection",
        {
          supportedLocales: enabledLocaleIds(),
        },
      );
  } catch (error) {
    windowsLocaleSelection = {
      preferredLanguages: [],
      matchedLocale: null,
    };

    console.error(
      "Unable to detect Windows preferred UI languages:",
      error,
    );
  }

  const override = getLanguageOverride();

  return applyResolvedLocale(
    override ??
      windowsLocaleSelection.matchedLocale ??
      CANONICAL_LOCALE,
  );
}

export function initializeUiLanguage(): Promise<string> {
  initialisationPromise ??= initialiseUiLanguage();
  return initialisationPromise;
}

export function getWindowsPreferredUiLanguages(): readonly string[] {
  return windowsLocaleSelection.preferredLanguages;
}

export function getWindowsMatchedLocale(): string | null {
  return windowsLocaleSelection.matchedLocale;
}

export function selectUiLanguage(
  localeId: string | null,
): string | null {
  if (!setLanguageOverride(localeId)) {
    return null;
  }

  const resolvedLocale = applyResolvedLocale(
    localeId ??
      windowsLocaleSelection.matchedLocale ??
      CANONICAL_LOCALE,
  );

  window.dispatchEvent(
    new CustomEvent(UI_LANGUAGE_CHANGED_EVENT, {
      detail: {
        locale: resolvedLocale,
        override: localeId,
      },
    }),
  );

  return resolvedLocale;
}

export function onUiLanguageChanged(
  listener: () => void,
): () => void {
  const handler = () => listener();

  window.addEventListener(
    UI_LANGUAGE_CHANGED_EVENT,
    handler,
  );

  return () => {
    window.removeEventListener(
      UI_LANGUAGE_CHANGED_EVENT,
      handler,
    );
  };
}
