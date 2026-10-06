import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const websiteRoot = path.join(repositoryRoot, "docs");
const websiteAssets = path.join(websiteRoot, "assets", "website");
const translationsPath = path.join(websiteAssets, "translations.json");
const releasePath = path.join(websiteAssets, "release.json");
const registryPath = path.join(repositoryRoot, "src", "i18n", "locales.json");
const packagePath = path.join(repositoryRoot, "package.json");
const htmlPath = path.join(websiteRoot, "index.html");
const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;
const HTML_KEY_PATTERN = /data-i18n(?:-alt)?="([^"]+)"/g;

const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    fail(path.relative(repositoryRoot, filePath) + ": " + String(error));
    return null;
  }
}

function placeholders(value) {
  return [...String(value).matchAll(PLACEHOLDER_PATTERN)]
    .map((match) => match[1])
    .sort();
}

function sameStrings(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isNonBlankString(value) {
  return typeof value === "string" && value.trim() !== "";
}

const [registry, website, release, packageJson] = await Promise.all([
  readJson(registryPath),
  readJson(translationsPath),
  readJson(releasePath),
  readJson(packagePath),
]);

let html = "";
try {
  html = await readFile(htmlPath, "utf8");
} catch (error) {
  fail("docs/index.html: " + String(error));
}

if (registry?.canonicalLocale !== "en-AU") {
  fail('src/i18n/locales.json: canonicalLocale must remain "en-AU".');
}

if (website?.schemaVersion !== 1) {
  fail("docs/assets/website/translations.json: schemaVersion must be 1.");
}

if (website?.canonicalLocale !== registry?.canonicalLocale) {
  fail("Website canonical locale does not match the application locale registry.");
}

const enabledApplicationLocales = Array.isArray(registry?.locales)
  ? registry.locales.filter((locale) => locale?.enabled === true && locale?.developerOnly !== true)
  : [];

const websiteLocales = website?.locales && typeof website.locales === "object"
  ? website.locales
  : {};

const enabledIds = enabledApplicationLocales.map((locale) => locale.id).sort();
const websiteIds = Object.keys(websiteLocales).sort();

for (const id of enabledIds) {
  if (!websiteLocales[id]) {
    fail("Website catalogue missing enabled application locale " + id + ".");
  }
}

for (const id of websiteIds) {
  if (!enabledIds.includes(id)) {
    fail("Website exposes locale " + id + " which is not an ordinary release-enabled application locale.");
  }
}

const canonical = websiteLocales[registry?.canonicalLocale];
const canonicalKeys = canonical?.strings && typeof canonical.strings === "object"
  ? Object.keys(canonical.strings).sort()
  : [];

if (!canonical || canonicalKeys.length === 0) {
  fail("Canonical website catalogue is missing or empty.");
}

for (const locale of enabledApplicationLocales) {
  const siteLocale = websiteLocales[locale.id];
  if (!siteLocale) continue;

  if (siteLocale.nativeName !== locale.nativeName) {
    fail(locale.id + ": website nativeName disagrees with src/i18n/locales.json.");
  }

  if (siteLocale.direction !== locale.direction) {
    fail(locale.id + ": website text direction disagrees with src/i18n/locales.json.");
  }

  if (siteLocale.enabled !== true) {
    fail(locale.id + ": website locale must be enabled.");
  }

  const strings = siteLocale.strings;
  if (!strings || typeof strings !== "object" || Array.isArray(strings)) {
    fail(locale.id + ": strings must be an object.");
    continue;
  }

  const keys = Object.keys(strings).sort();
  for (const key of canonicalKeys) {
    if (!(key in strings)) {
      fail(locale.id + ": missing website key " + key + ".");
      continue;
    }

    if (!isNonBlankString(strings[key])) {
      fail(locale.id + ":" + key + " must be a non-blank string.");
      continue;
    }

    const expected = placeholders(canonical.strings[key]);
    const actual = placeholders(strings[key]);
    if (!sameStrings(expected, actual)) {
      fail(locale.id + ":" + key + " placeholder mismatch.");
    }
  }

  for (const key of keys) {
    if (!canonicalKeys.includes(key)) {
      fail(locale.id + ": unexpected website key " + key + ".");
    }
  }

  const guidePath = locale.id === registry.canonicalLocale
    ? path.join(repositoryRoot, "docs", "WINDOWS_INSTALLATION.md")
    : path.join(repositoryRoot, "docs", "localised", locale.id, "WINDOWS_INSTALLATION.md");

  try {
    await access(guidePath);
  } catch {
    fail(locale.id + ": translated Windows installation guide is missing.");
  }
}

for (const match of html.matchAll(HTML_KEY_PATTERN)) {
  if (!canonicalKeys.includes(match[1])) {
    fail("docs/index.html references unknown translation key " + match[1] + ".");
  }
}

for (const key of canonicalKeys) {
  if (!html.includes('data-i18n="' + key + '"') && !html.includes('data-i18n-alt="' + key + '"') && !key.startsWith("meta.")) {
    fail("Canonical website key is not referenced by docs/index.html: " + key + ".");
  }
}

const requiredFiles = [
  "docs/.nojekyll",
  "docs/index.html",
  "docs/assets/website/site.css",
  "docs/assets/website/site.js",
  "docs/assets/website/translations.json",
  "docs/assets/website/release.json",
  "docs/images/website/mining.png",
  "docs/images/website/safex-gradient-logo.svg",
  "docs/images/website/favicon.png",
  "docs/images/website/the-safex-mine-v1.1.0.png",
];

for (const relativePath of requiredFiles) {
  try {
    await access(path.join(repositoryRoot, relativePath));
  } catch {
    fail(relativePath + " is required by the GitHub Pages site.");
  }
}

if (!isNonBlankString(release?.version)) {
  fail("release.json: version must be non-blank.");
} else if (release.version !== packageJson?.version) {
  fail("release.json version must match package.json version.");
}

if (!/^[A-F0-9]{64}$/.test(release?.sha256 ?? "")) {
  fail("release.json: sha256 must be 64 uppercase hexadecimal characters.");
}

for (const field of ["installerName", "installerUrl", "releaseUrl", "checksumUrl", "publishedDate"]) {
  if (!isNonBlankString(release?.[field])) {
    fail("release.json: " + field + " must be non-blank.");
  }
}

if (release?.version && !String(release.releaseUrl ?? "").includes("/tag/v" + release.version)) {
  fail("release.json: releaseUrl does not match the declared version.");
}

if (release?.installerName && !String(release.installerUrl ?? "").endsWith("/" + release.installerName)) {
  fail("release.json: installerUrl does not end with installerName.");
}

if (/https?:\/\/[^"']+\.(?:js|css)(?:["'?])/i.test(html)) {
  fail("docs/index.html must not load external JavaScript or CSS dependencies.");
}

if (errors.length > 0) {
  console.error("GitHub Pages validation failed:");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("GitHub Pages checks passed for " + enabledIds.length + " release-enabled locales.");
}
