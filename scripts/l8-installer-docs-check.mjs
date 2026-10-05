import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");

const errors = [];

function addError(message) {
  errors.push(message);
}

async function readText(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await readText(relativePath));
  } catch (error) {
    addError(`${relativePath}: unable to read valid JSON (${error.message}).`);
    return null;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    addError(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}.`);
  }
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

const registry = await readJson("src/i18n/locales.json");
const installerManifest = await readJson("src-tauri/nsis/installer-locales.json");
const releaseConfig = await readJson("src-tauri/tauri.release.conf.json");
const packageJson = await readJson("package.json");
const tauriConfig = await readJson("src-tauri/tauri.conf.json");
const translationStatus = await readJson("src/i18n/translation-status.json");

const packageLock = await readJson("package-lock.json");
const cargoToml = await readText("src-tauri/Cargo.toml");
const cargoLock = await readText("src-tauri/Cargo.lock");
const helperCargoToml = await readText("src-tauri/helper/Cargo.toml");
const helperCargoLock = await readText("src-tauri/helper/Cargo.lock");
const riskSource = await readText("src/riskAcknowledgement.ts");

const releaseVersion = packageJson?.version;
if (!/^\d+\.\d+\.\d+$/.test(releaseVersion ?? "")) {
  addError(`package.json: release version must be a semantic x.y.z version, got ${JSON.stringify(releaseVersion)}.`);
}
assertEqual(packageLock?.version, releaseVersion, "package-lock.json root version must match package.json.");
assertEqual(packageLock?.packages?.[""]?.version, releaseVersion, "package-lock.json root package version must match package.json.");
assertEqual(tauriConfig?.version, releaseVersion, "tauri.conf.json version must match package.json.");

const cargoPackageVersion = cargoToml.match(/\[package\][\s\S]*?^version\s*=\s*"([^"]+)"/m)?.[1];
assertEqual(cargoPackageVersion, releaseVersion, "Rust application package version must match package.json.");

const cargoLockPackageVersion = cargoLock.match(/\[\[package\]\]\s*\nname\s*=\s*"the-safex-mine"\s*\nversion\s*=\s*"([^"]+)"/m)?.[1];
assertEqual(cargoLockPackageVersion, releaseVersion, "Rust application lockfile version must match package.json.");

const helperPackageVersion = helperCargoToml.match(/\[package\][\s\S]*?^version\s*=\s*"([^"]+)"/m)?.[1];
assertEqual(helperPackageVersion, releaseVersion, "Helper package version must match package.json.");

const helperLockPackageVersion = helperCargoLock.match(/\[\[package\]\]\s*\nname\s*=\s*"safex-mine-helper"\s*\nversion\s*=\s*"([^"]+)"/m)?.[1];
assertEqual(helperLockPackageVersion, releaseVersion, "Helper lockfile version must match package.json.");

assertEqual(
  translationStatus?.riskAcknowledgementVersion,
  "1.0",
  "Mining Risk Acknowledgement version must remain 1.0 unless canonical acknowledgement content changes substantively.",
);
if (!/ACKNOWLEDGEMENT_VERSION\s*=\s*"1\.0"/.test(riskSource)) {
  addError('src/riskAcknowledgement.ts: ACKNOWLEDGEMENT_VERSION must remain "1.0".');
}

const enabledLocales = Array.isArray(registry?.locales)
  ? registry.locales.filter((locale) => locale?.enabled === true).map((locale) => locale.id)
  : [];
const manifestLocales = installerManifest?.applicationLocales
  ? Object.keys(installerManifest.applicationLocales)
  : [];

if (JSON.stringify(sorted(enabledLocales)) !== JSON.stringify(sorted(manifestLocales))) {
  addError(
    `src-tauri/nsis/installer-locales.json must account for every enabled application locale exactly. Enabled: ${enabledLocales.join(", ")}; mapped: ${manifestLocales.join(", ")}.`,
  );
}

assertEqual(installerManifest?.tauriCliVersion, "2.11.4", "Installer manifest Tauri CLI version drifted.");
assertEqual(installerManifest?.nsisVersion, "3.11", "Installer manifest NSIS version drifted.");
assertEqual(installerManifest?.canonicalInstallerLanguage, "English", "English must remain the canonical installer fallback.");
assertEqual(installerManifest?.displayLanguageSelector, false, "The release installer uses automatic Windows-language selection.");

const nsis = releaseConfig?.bundle?.windows?.nsis;
if (!nsis) {
  addError("src-tauri/tauri.release.conf.json: bundle.windows.nsis is missing.");
}

const configuredLanguages = Array.isArray(nsis?.languages) ? nsis.languages : [];
if (configuredLanguages[0] !== "English") {
  addError("NSIS languages must list English first so unsupported Windows languages fall back deterministically.");
}
assertEqual(nsis?.displayLanguageSelector, false, "NSIS displayLanguageSelector must remain false for the release installer.");

const mappedInstallerLanguages = [];
for (const localeId of manifestLocales) {
  const entry = installerManifest.applicationLocales[localeId];
  if (!entry?.installerLanguage || !entry?.support) {
    addError(`installer-locales.json: ${localeId} must define installerLanguage and support.`);
    continue;
  }
  if (entry.support !== "english-fallback") {
    mappedInstallerLanguages.push(entry.installerLanguage);
  }
}

const expectedLanguageSet = sorted(new Set(["English", ...mappedInstallerLanguages]));
if (JSON.stringify(sorted(new Set(configuredLanguages))) !== JSON.stringify(expectedLanguageSet)) {
  addError(
    `tauri.release.conf.json NSIS language set does not match the installer manifest. Configured: ${configuredLanguages.join(", ")}; expected: ${expectedLanguageSet.join(", ")}.`,
  );
}
if (configuredLanguages.indexOf("Portuguese") > configuredLanguages.indexOf("PortugueseBR")) {
  addError("Portuguese must precede PortugueseBR so non-Brazilian Portuguese primary-language fallback prefers pt-PT.");
}

const expectedFallbacks = new Set(["fil", "bn"]);
for (const localeId of manifestLocales) {
  const entry = installerManifest.applicationLocales[localeId];
  if (entry.support === "english-fallback") {
    if (!expectedFallbacks.has(localeId)) {
      addError(`Unexpected English installer fallback for ${localeId}.`);
    }
    if (entry.installerLanguage !== "English") {
      addError(`${localeId}: english-fallback must map to English.`);
    }
  }
}
for (const localeId of expectedFallbacks) {
  if (installerManifest?.applicationLocales?.[localeId]?.support !== "english-fallback") {
    addError(`${localeId}: approved L8 behaviour requires an English installer fallback.`);
  }
}

const customEntries = Object.entries(installerManifest?.applicationLocales ?? {})
  .filter(([, entry]) => entry.support === "project-custom-tauri-messages");
const configuredCustomFiles = nsis?.customLanguageFiles ?? {};

const requiredLangStringKeys = [
  "addOrReinstall",
  "alreadyInstalled",
  "alreadyInstalledLong",
  "appRunning",
  "appRunningOkKill",
  "chooseMaintenanceOption",
  "choowHowToInstall",
  "createDesktop",
  "dontUninstall",
  "dontUninstallDowngrade",
  "failedToKillApp",
  "installingWebview2",
  "newerVersionInstalled",
  "older",
  "olderOrUnknownVersionInstalled",
  "silentDowngrades",
  "unableToUninstall",
  "uninstallApp",
  "uninstallBeforeInstalling",
  "unknown",
  "webview2AbortError",
  "webview2DownloadError",
  "webview2DownloadSuccess",
  "webview2Downloading",
  "webview2InstallError",
  "webview2InstallSuccess",
  "deleteAppData",
];

const placeholderRequirements = {
  alreadyInstalledLong: ["${PRODUCTNAME}", "${VERSION}"],
  appRunning: ["{{product_name}}"],
  appRunningOkKill: ["{{product_name}}"],
  choowHowToInstall: ["${PRODUCTNAME}"],
  failedToKillApp: ["{{product_name}}"],
  newerVersionInstalled: ["${PRODUCTNAME}"],
  olderOrUnknownVersionInstalled: ["$R4", "${PRODUCTNAME}"],
  uninstallApp: ["${PRODUCTNAME}"],
  webview2DownloadError: ["$0"],
  webview2InstallError: ["$1"],
};

for (const [localeId, entry] of customEntries) {
  const language = entry.installerLanguage;
  const relativePath = configuredCustomFiles[language];
  if (!relativePath) {
    addError(`${localeId}/${language}: customLanguageFiles entry is missing.`);
    continue;
  }
  const repoRelativePath = path.posix.join("src-tauri", relativePath.replaceAll("\\", "/"));
  let content;
  try {
    content = await readText(repoRelativePath);
  } catch (error) {
    addError(`${repoRelativePath}: custom NSIS language file cannot be read (${error.message}).`);
    continue;
  }

  const foundKeys = new Set(
    [...content.matchAll(/^LangString\s+(\S+)\s+\$\{LANG_[A-Z0-9]+\}/gm)].map((match) => match[1]),
  );
  for (const key of requiredLangStringKeys) {
    if (!foundKeys.has(key)) {
      addError(`${repoRelativePath}: missing LangString ${key}.`);
    }
  }
  if (foundKeys.size !== requiredLangStringKeys.length) {
    addError(
      `${repoRelativePath}: expected exactly ${requiredLangStringKeys.length} Tauri LangString keys, found ${foundKeys.size}.`,
    );
  }

  for (const [key, placeholders] of Object.entries(placeholderRequirements)) {
    const line = content.split(/\r?\n/).find((value) => value.startsWith(`LangString ${key} `)) ?? "";
    for (const placeholder of placeholders) {
      if (!line.includes(placeholder)) {
        addError(`${repoRelativePath}: LangString ${key} must preserve placeholder ${placeholder}.`);
      }
    }
  }
}

const configuredCustomLanguages = sorted(Object.keys(configuredCustomFiles));
const expectedCustomLanguages = sorted(customEntries.map(([, entry]) => entry.installerLanguage));
if (JSON.stringify(configuredCustomLanguages) !== JSON.stringify(expectedCustomLanguages)) {
  addError(
    `customLanguageFiles keys must match project-custom-tauri-messages mappings. Configured: ${configuredCustomLanguages.join(", ")}; expected: ${expectedCustomLanguages.join(", ")}.`,
  );
}

const translatedLocales = enabledLocales.filter((localeId) => localeId !== registry?.canonicalLocale);
const requiredDocMarkers = [
  "SHA-256",
  "Get-FileHash",
  "Microsoft Defender",
  "SmartScreen",
  "%LOCALAPPDATA%\\The Safex Mine",
  "Mining Risk Acknowledgement",
  "safex-mine-helper.exe",
  "XMRig",
  "MSR",
  "../../WINDOWS_INSTALLATION.md",
  "../../MINING_RISK_ACKNOWLEDGEMENT.md",
  "../../../TROUBLESHOOTING.md",
];

for (const localeId of translatedLocales) {
  const relativePath = `docs/localised/${localeId}/WINDOWS_INSTALLATION.md`;
  let content;
  try {
    content = await readText(relativePath);
  } catch (error) {
    addError(`${relativePath}: translated installation guide is missing (${error.message}).`);
    continue;
  }

  for (const marker of requiredDocMarkers) {
    if (!content.includes(marker)) {
      addError(`${relativePath}: required installation/security marker is missing: ${marker}`);
    }
  }

  const opening = content.slice(0, 1400);
  if (!/^>\s+\*\*/m.test(opening)) {
    addError(`${relativePath}: translation/community status blockquote should be stated near the top of the guide.`);
  }
}

const localisedIndex = await readText("docs/localised/README.md");
for (const localeId of translatedLocales) {
  if (!localisedIndex.includes(`(${localeId}/WINDOWS_INSTALLATION.md)`)) {
    addError(`docs/localised/README.md: missing navigation entry for ${localeId}.`);
  }
}

for (const localeId of expectedFallbacks) {
  const fallbackGuide = await readText(`docs/localised/${localeId}/WINDOWS_INSTALLATION.md`);
  if (!fallbackGuide.includes("NSIS 3.11") || !/English/i.test(fallbackGuide)) {
    addError(`docs/localised/${localeId}/WINDOWS_INSTALLATION.md must clearly explain the English NSIS 3.11 installer fallback.`);
  }
}

if (errors.length > 0) {
  console.error("Release conformance validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Release conformance validation passed for v${releaseVersion}: ${configuredLanguages.length} NSIS languages, ${translatedLocales.length} translated installation guides, 2 documented English installer fallbacks.`,
);
