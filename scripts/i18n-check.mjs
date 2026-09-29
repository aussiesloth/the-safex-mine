import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const i18nDirectory = path.join(repositoryRoot, "src", "i18n");
const cataloguesDirectory = path.join(i18nDirectory, "catalogues");
const registryPath = path.join(i18nDirectory, "locales.json");
const frontendSourcePaths = [
  path.join(repositoryRoot, "src", "main.ts"),
];
const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;
const FRONTEND_KEY_PATTERNS = [
  /translate\(\s*["']([^"']+)["']/g,
  /labelKey:\s*["']([^"']+)["']/g,
];

const errors = [];

function addError(message) {
  errors.push(message);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    addError(`${path.relative(repositoryRoot, filePath)}: ${String(error)}`);
    return null;
  }
}

function placeholders(value) {
  return [...value.matchAll(PLACEHOLDER_PATTERN)]
    .map((match) => match[1])
    .sort();
}

function sameStrings(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

const registry = await readJson(registryPath);

if (!registry || typeof registry !== "object") {
  addError("Locale registry is missing or invalid.");
} else {
  if (registry.canonicalLocale !== "en-AU") {
    addError('locales.json: canonicalLocale must be "en-AU".');
  }

  if (!Array.isArray(registry.locales) || registry.locales.length === 0) {
    addError("locales.json: locales must be a non-empty array.");
  } else {
    const seenLocaleIds = new Set();

    for (const [index, locale] of registry.locales.entries()) {
      const prefix = `locales.json: locales[${index}]`;

      if (!locale || typeof locale !== "object") {
        addError(`${prefix} must be an object.`);
        continue;
      }

      if (
        typeof locale.id !== "string" ||
        !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(locale.id)
      ) {
        addError(`${prefix}.id is malformed.`);
      } else if (seenLocaleIds.has(locale.id)) {
        addError(`${prefix}.id duplicates ${locale.id}.`);
      } else {
        seenLocaleIds.add(locale.id);
      }

      if (
        typeof locale.nativeName !== "string" ||
        locale.nativeName.trim() === ""
      ) {
        addError(`${prefix}.nativeName must be non-blank.`);
      }

      if (locale.direction !== "ltr" && locale.direction !== "rtl") {
        addError(`${prefix}.direction must be "ltr" or "rtl".`);
      }

      if (locale.fallback !== null && typeof locale.fallback !== "string") {
        addError(`${prefix}.fallback must be a locale ID or null.`);
      }

      if (typeof locale.enabled !== "boolean") {
        addError(`${prefix}.enabled must be boolean.`);
      }
    }

    for (const locale of registry.locales) {
      if (
        locale &&
        typeof locale === "object" &&
        typeof locale.fallback === "string" &&
        !seenLocaleIds.has(locale.fallback)
      ) {
        addError(
          `locales.json: fallback ${locale.fallback} for ${locale.id} is not registered.`,
        );
      }
    }

    const canonicalMetadata = registry.locales.find(
      (locale) => locale?.id === registry.canonicalLocale,
    );

    if (!canonicalMetadata) {
      addError("locales.json: canonical locale is not registered.");
    } else if (canonicalMetadata.enabled !== true) {
      addError("locales.json: canonical locale must be enabled.");
    }
  }
}

const catalogueFiles = (await readdir(cataloguesDirectory))
  .filter((name) => name.endsWith(".json"))
  .sort();

const catalogues = new Map();

for (const fileName of catalogueFiles) {
  const localeId = fileName.slice(0, -".json".length);
  const catalogue = await readJson(path.join(cataloguesDirectory, fileName));

  if (catalogue && typeof catalogue === "object" && !Array.isArray(catalogue)) {
    catalogues.set(localeId, catalogue);
  } else {
    addError(
      `src/i18n/catalogues/${fileName}: catalogue must be a JSON object.`,
    );
  }
}

if (registry?.locales && Array.isArray(registry.locales)) {
  const registeredLocaleIds = new Set(
    registry.locales.map((locale) => locale?.id),
  );

  for (const localeId of catalogues.keys()) {
    if (!registeredLocaleIds.has(localeId)) {
      addError(
        `src/i18n/catalogues/${localeId}.json: locale is not registered.`,
      );
    }
  }

  for (const locale of registry.locales) {
    if (locale?.enabled === true && !catalogues.has(locale.id)) {
      addError(`Missing catalogue for enabled locale ${locale.id}.`);
    }
  }
}

const canonicalLocale = registry?.canonicalLocale ?? "en-AU";
const canonicalCatalogue = catalogues.get(canonicalLocale);

const frontendTranslationKeys = new Set();

for (const sourcePath of frontendSourcePaths) {
  let sourceText;

  try {
    sourceText = await readFile(sourcePath, "utf8");
  } catch (error) {
    addError(`${path.relative(repositoryRoot, sourcePath)}: ${String(error)}`);
    continue;
  }

  for (const pattern of FRONTEND_KEY_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of sourceText.matchAll(pattern)) {
      frontendTranslationKeys.add(match[1]);
    }
  }
}

if (!canonicalCatalogue) {
  addError(`Missing canonical catalogue ${canonicalLocale}.json.`);
} else {
  const canonicalKeys = Object.keys(canonicalCatalogue).sort();

  for (const key of [...frontendTranslationKeys].sort()) {
    if (!(key in canonicalCatalogue)) {
      addError(`frontend: translation key ${key} is missing from ${canonicalLocale}.`);
    }
  }

  for (const [key, value] of Object.entries(canonicalCatalogue)) {
    if (typeof value !== "string") {
      addError(`${canonicalLocale}:${key} must be a string.`);
    } else if (value.trim() === "") {
      addError(`${canonicalLocale}:${key} is blank.`);
    }
  }

  for (const [localeId, catalogue] of catalogues.entries()) {
    const localeKeys = Object.keys(catalogue).sort();
    const missingKeys = canonicalKeys.filter((key) => !(key in catalogue));
    const unexpectedKeys = localeKeys.filter(
      (key) => !(key in canonicalCatalogue),
    );

    for (const key of missingKeys) {
      addError(`${localeId}: missing key ${key}.`);
    }

    for (const key of unexpectedKeys) {
      addError(`${localeId}: unexpected key ${key}.`);
    }

    for (const key of canonicalKeys) {
      const value = catalogue[key];
      const canonicalValue = canonicalCatalogue[key];

      if (typeof value !== "string") {
        addError(`${localeId}:${key} must be a string.`);
        continue;
      }

      if (value.trim() === "") {
        addError(`${localeId}:${key} is blank.`);
      }

      if (typeof canonicalValue === "string") {
        const expectedPlaceholders = placeholders(canonicalValue);
        const actualPlaceholders = placeholders(value);

        if (!sameStrings(expectedPlaceholders, actualPlaceholders)) {
          addError(
            `${localeId}:${key} placeholder mismatch; expected {${expectedPlaceholders.join(", ")}} but found {${actualPlaceholders.join(", ")}}.`,
          );
        }
      }
    }
  }

  if (errors.length === 0) {
    console.log(
      `i18n:check passed (${catalogues.size} locale, ${canonicalKeys.length} keys, ${frontendTranslationKeys.size} frontend references).`,
    );
  }
}

if (errors.length > 0) {
  console.error("i18n:check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}
