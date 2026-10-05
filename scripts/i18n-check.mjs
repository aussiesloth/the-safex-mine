import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const i18nDirectory = path.join(repositoryRoot, "src", "i18n");
const cataloguesDirectory = path.join(i18nDirectory, "catalogues");
const registryPath = path.join(i18nDirectory, "locales.json");
const translationStatusPath = path.join(
  i18nDirectory,
  "translation-status.json",
);
const riskAcknowledgementsDirectory = path.join(
  i18nDirectory,
  "riskAcknowledgements",
);
const frontendSourcePaths = [
  path.join(repositoryRoot, "src", "main.ts"),
  path.join(repositoryRoot, "src", "riskAcknowledgement.ts"),
  path.join(repositoryRoot, "src", "i18n", "languageSelector.ts"),
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


function isNonBlankString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validateRiskSegments(segments, prefix) {
  if (!Array.isArray(segments) || segments.length === 0) {
    addError(`${prefix}.segments must be a non-empty array.`);
    return [];
  }

  return segments.map((segment, index) => {
    const segmentPrefix = `${prefix}.segments[${index}]`;

    if (!segment || typeof segment !== "object") {
      addError(`${segmentPrefix} must be an object.`);
      return { strong: null };
    }

    if (!isNonBlankString(segment.text)) {
      addError(`${segmentPrefix}.text must be non-blank.`);
    }

    if (typeof segment.strong !== "boolean") {
      addError(`${segmentPrefix}.strong must be boolean.`);
    }

    return { strong: segment.strong };
  });
}

function validateRiskBlock(block, prefix, seenIds) {
  if (!block || typeof block !== "object") {
    addError(`${prefix} must be an object.`);
    return { type: "invalid" };
  }

  if (!isNonBlankString(block.id)) {
    addError(`${prefix}.id must be non-blank.`);
  } else if (seenIds.has(block.id)) {
    addError(`${prefix}.id duplicates ${block.id}.`);
  } else {
    seenIds.add(block.id);
  }

  if (block.type === "paragraph") {
    if (typeof block.emphasis !== "boolean") {
      addError(`${prefix}.emphasis must be boolean.`);
    }

    return {
      id: block.id,
      type: block.type,
      emphasis: block.emphasis,
      segments: validateRiskSegments(block.segments, prefix),
    };
  }

  if (block.type === "list") {
    if (!Array.isArray(block.items) || block.items.length === 0) {
      addError(`${prefix}.items must be a non-empty array.`);
      return {
        id: block.id,
        type: block.type,
        items: [],
      };
    }

    const items = block.items.map((item, index) => {
      const itemPrefix = `${prefix}.items[${index}]`;

      if (!item || typeof item !== "object") {
        addError(`${itemPrefix} must be an object.`);
        return { id: null, segments: [] };
      }

      if (!isNonBlankString(item.id)) {
        addError(`${itemPrefix}.id must be non-blank.`);
      } else if (seenIds.has(item.id)) {
        addError(`${itemPrefix}.id duplicates ${item.id}.`);
      } else {
        seenIds.add(item.id);
      }

      return {
        id: item.id,
        segments: validateRiskSegments(item.segments, itemPrefix),
      };
    });

    return {
      id: block.id,
      type: block.type,
      items,
    };
  }

  if (block.type === "section") {
    if (!isNonBlankString(block.heading)) {
      addError(`${prefix}.heading must be non-blank.`);
    }

    if (!Array.isArray(block.blocks) || block.blocks.length === 0) {
      addError(`${prefix}.blocks must be a non-empty array.`);
      return {
        id: block.id,
        type: block.type,
        blocks: [],
      };
    }

    return {
      id: block.id,
      type: block.type,
      blocks: block.blocks.map((child, index) =>
        validateRiskBlock(
          child,
          `${prefix}.blocks[${index}]`,
          seenIds,
        ),
      ),
    };
  }

  addError(`${prefix}.type is not recognised.`);
  return {
    id: block.id,
    type: block.type,
  };
}

function validateRiskDocument(document, prefix, expectedVersion, expectedLocale) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    addError(`${prefix}: document must be a JSON object.`);
    return null;
  }

  if (document.schemaVersion !== 1) {
    addError(`${prefix}: schemaVersion must be 1.`);
  }

  if (document.acknowledgementVersion !== expectedVersion) {
    addError(
      `${prefix}: acknowledgementVersion must be "${expectedVersion}".`,
    );
  }

  if (document.locale !== expectedLocale) {
    addError(`${prefix}: locale must be "${expectedLocale}".`);
  }

  if (!Array.isArray(document.blocks) || document.blocks.length === 0) {
    addError(`${prefix}: blocks must be a non-empty array.`);
    return null;
  }

  const seenIds = new Set();

  return document.blocks.map((block, index) =>
    validateRiskBlock(
      block,
      `${prefix}: blocks[${index}]`,
      seenIds,
    ),
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

      if (
        locale.developerOnly !== undefined &&
        typeof locale.developerOnly !== "boolean"
      ) {
        addError(`${prefix}.developerOnly must be boolean when present.`);
      }

      if (locale.enabled === true && locale.developerOnly === true) {
        addError(
          `${prefix} cannot be both release-enabled and developer-only.`,
        );
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
    if (
      (locale?.enabled === true || locale?.developerOnly === true) &&
      !catalogues.has(locale.id)
    ) {
      addError(
        `Missing catalogue for available locale ${locale.id}.`,
      );
    }
  }
}

const translationStatus = await readJson(translationStatusPath);

if (
  !translationStatus ||
  typeof translationStatus !== "object" ||
  Array.isArray(translationStatus)
) {
  addError("translation-status.json: status data is missing or invalid.");
} else {
  if (translationStatus.schemaVersion !== 1) {
    addError("translation-status.json: schemaVersion must be 1.");
  }

  if (translationStatus.canonicalSourceLocale !== "en-AU") {
    addError(
      'translation-status.json: canonicalSourceLocale must be "en-AU".',
    );
  }

  if (translationStatus.riskAcknowledgementVersion !== "1.0") {
    addError(
      'translation-status.json: riskAcknowledgementVersion must be "1.0".',
    );
  }

  if (
    !translationStatus.locales ||
    typeof translationStatus.locales !== "object" ||
    Array.isArray(translationStatus.locales)
  ) {
    addError("translation-status.json: locales must be an object.");
  } else if (Array.isArray(registry?.locales)) {
    for (const locale of registry.locales) {
      if (
        locale?.enabled !== true &&
        locale?.developerOnly !== true
      ) {
        continue;
      }

      if (locale.id === registry.canonicalLocale) {
        continue;
      }

      const status = translationStatus.locales[locale.id];

      if (!status || typeof status !== "object") {
        addError(
          `translation-status.json: missing status for ${locale.id}.`,
        );
        continue;
      }

      for (const field of [
        "ui",
        "accessibilityAndStatus",
        "riskAcknowledgement",
      ]) {
        if (status[field] !== "complete") {
          addError(
            `translation-status.json: ${locale.id}.${field} must be "complete".`,
          );
        }
      }

      if (!isNonBlankString(status.review)) {
        addError(
          `translation-status.json: ${locale.id}.review must be non-blank.`,
        );
      }

      if (
        locale.developerOnly === true &&
        status.developerOnly !== true
      ) {
        addError(
          `translation-status.json: ${locale.id} must be marked developerOnly.`,
        );
      }

      if (
        locale.enabled === true &&
        status.releaseEnabled !== true
      ) {
        addError(
          `translation-status.json: ${locale.id} must be marked releaseEnabled.`,
        );
      }
    }
  }
}

// Cross-check that enabled/developer catalogues are actually imported by the
// frontend, rather than merely existing as complete but unreachable JSON files.
const frontendCatalogueRegistry = await readFile(
  path.join(i18nDirectory, "index.ts"),
  "utf8",
);
const riskDocumentRegistry = await readFile(
  path.join(riskAcknowledgementsDirectory, "index.ts"),
  "utf8",
);
if (Array.isArray(registry?.locales)) {
  for (const locale of registry.locales) {
    if (!locale || (locale.enabled !== true && locale.developerOnly !== true)) {
      continue;
    }

    if (!frontendCatalogueRegistry.includes(`from "./catalogues/${locale.id}.json";`)) {
      addError(`Available locale ${locale.id} is not imported by src/i18n/index.ts.`);
    }
    if (!riskDocumentRegistry.includes(`from "./v1.0/${locale.id}.json";`)) {
      addError(`Available locale ${locale.id} has no registered Risk Acknowledgement v1.0 import.`);
    }

    if (locale.id !== registry.canonicalLocale) {
      const status = translationStatus?.locales?.[locale.id];
      if (status && status.releaseEnabled !== (locale.enabled === true)) {
        addError(
          `translation-status.json: ${locale.id}.releaseEnabled disagrees with locales.json.`,
        );
      }
    }
  }

  // An inactive locale must not be recorded as release-enabled in provenance.
  for (const locale of registry.locales) {
    const status = translationStatus?.locales?.[locale.id];
    if (status?.releaseEnabled === true && locale.enabled !== true) {
      addError(
        `translation-status.json: ${locale.id} claims release enablement while disabled.`,
      );
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

}

let riskAcknowledgementVersionCount = 0;

try {
  const versionDirectories = (
    await readdir(riskAcknowledgementsDirectory, {
      withFileTypes: true,
    })
  )
    .filter(
      (entry) =>
        entry.isDirectory() &&
        /^v[0-9]+(?:\.[0-9]+)*$/.test(entry.name),
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  riskAcknowledgementVersionCount = versionDirectories.length;

  if (versionDirectories.length === 0) {
    addError(
      "src/i18n/riskAcknowledgements: no versioned acknowledgement data found.",
    );
  }

  const registeredLocaleIds = new Set(
    Array.isArray(registry?.locales)
      ? registry.locales.map((locale) => locale?.id)
      : [],
  );

  const availableLocaleIds = Array.isArray(registry?.locales)
    ? registry.locales
        .filter(
          (locale) =>
            locale?.enabled === true ||
            locale?.developerOnly === true,
        )
        .map((locale) => locale.id)
    : [];

  for (const versionEntry of versionDirectories) {
    const expectedVersion = versionEntry.name.slice(1);
    const versionDirectory = path.join(
      riskAcknowledgementsDirectory,
      versionEntry.name,
    );

    const files = (await readdir(versionDirectory))
      .filter((name) => name.endsWith(".json"))
      .sort();

    const documents = new Map();

    for (const fileName of files) {
      const localeId = fileName.slice(0, -".json".length);
      const relativePath = path.join(
        "src",
        "i18n",
        "riskAcknowledgements",
        versionEntry.name,
        fileName,
      );
      const document = await readJson(
        path.join(versionDirectory, fileName),
      );

      if (!registeredLocaleIds.has(localeId)) {
        addError(`${relativePath}: locale is not registered.`);
      }

      const structure = validateRiskDocument(
        document,
        relativePath,
        expectedVersion,
        localeId,
      );

      if (document && structure) {
        documents.set(localeId, {
          document,
          structure,
        });
      }
    }

    for (const localeId of availableLocaleIds) {
      if (!documents.has(localeId)) {
        addError(
          `Missing Mining Risk Acknowledgement ${expectedVersion} for available locale ${localeId}.`,
        );
      }
    }

    const canonicalRisk =
      documents.get(canonicalLocale);

    if (!canonicalRisk) {
      addError(
        `Missing canonical Mining Risk Acknowledgement ${expectedVersion} for ${canonicalLocale}.`,
      );
      continue;
    }

    const canonicalStructure =
      JSON.stringify(canonicalRisk.structure);

    for (const [localeId, risk] of documents.entries()) {
      if (
        JSON.stringify(risk.structure) !==
        canonicalStructure
      ) {
        addError(
          `Mining Risk Acknowledgement ${expectedVersion} for ${localeId} does not match the canonical ${canonicalLocale} structure.`,
        );
      }
    }
  }
} catch (error) {
  addError(
    `src/i18n/riskAcknowledgements: ${String(error)}`,
  );
}

if (errors.length === 0 && canonicalCatalogue) {
  const canonicalKeys = Object.keys(canonicalCatalogue).sort();

  console.log(
    `i18n:check passed (${catalogues.size} locale, ${canonicalKeys.length} keys, ${frontendTranslationKeys.size} frontend references, ${riskAcknowledgementVersionCount} risk acknowledgement version).`,
  );
}

if (errors.length > 0) {
  console.error("i18n:check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}
