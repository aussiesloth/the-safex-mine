import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const registryPath = path.join(repositoryRoot, "src", "i18n", "locales.json");
const cataloguesDirectory = path.join(repositoryRoot, "src", "i18n", "catalogues");
const localisedDocsDirectory = path.join(repositoryRoot, "docs", "localised");

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    fail(`${path.relative(repositoryRoot, filePath)}: ${String(error)}`);
    return null;
  }
}

const registry = await readJson(registryPath);
const releaseLocales = Array.isArray(registry?.locales)
  ? registry.locales.filter(
      (locale) =>
        locale?.enabled === true &&
        locale?.developerOnly !== true &&
        locale?.id !== registry.canonicalLocale,
    )
  : [];

const REQUIRED_IDENTIFIERS = [
  "SHA-256",
  "SmartScreen",
  "%LOCALAPPDATA%\\The Safex Mine",
  "safex-mine-helper.exe",
  "XMRig",
  "MSR",
];

const REQUIRED_LINK_TARGETS = [
  "../../WINDOWS_INSTALLATION.md",
  "../../MINING_RISK_ACKNOWLEDGEMENT.md",
  "../../../TROUBLESHOOTING.md",
];

const NON_LATIN_REVIEW_LOCALES = new Set([
  "bn",
  "hi",
  "el",
  "ru",
  "uk",
  "zh-Hans",
  "ja",
  "ko",
]);

const SUSPICIOUS_ENGLISH_PROSE_PATTERN =
  /\b(?:application|app|release|canonical|unsigned|miner|helper|driver|installer|download|restore|allow|quarantine|hash|source|antivirus|mining|components|security|product|profile|drive|exclusion|language|risk|notice|acceptance|graphical|user|session|approval|supervise|optimisation|optimization|performance|feature|uninstall|manually|troubleshooting|backend|endpoint|worker|thread|status|runtime|open|code)\b/i;

function stripProtectedTerms(line) {
  return String(line)
    .replace(/\]\([^)]+\)/g, "]")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:The Safex Mine|Safex Cash|Safex|Windows|XMRig|MSR|CPU|LAN|GitHub|SHA-256|WinRing|UAC|RPC|HTTP|HTTPS|x64|GPL-3\.0(?:-only)?|Unicode|PowerShell|SmartScreen|Defender|NSIS|AI|Microsoft|GUI|hashrate|Downloads|Get-FileHash|Algorithm|LOCALAPPDATA|v\d+(?:\.\d+)*)\b/gi, " ");
}

for (const locale of releaseLocales) {
  const guidePath = path.join(
    localisedDocsDirectory,
    locale.id,
    "WINDOWS_INSTALLATION.md",
  );
  const cataloguePath = path.join(
    cataloguesDirectory,
    `${locale.id}.json`,
  );

  try {
    await access(guidePath);
  } catch {
    fail(`${locale.id}: translated Windows installation guide is missing.`);
    continue;
  }

  const [guide, catalogue] = await Promise.all([
    readFile(guidePath, "utf8"),
    readJson(cataloguePath),
  ]);

  if (!catalogue) continue;

  for (let section = 1; section <= 6; section += 1) {
    if (!guide.includes(`## ${section}.`)) {
      fail(`${locale.id}: guide is missing section ${section}.`);
    }
  }

  for (const identifier of REQUIRED_IDENTIFIERS) {
    if (!guide.includes(identifier)) {
      fail(`${locale.id}: guide is missing required identifier ${identifier}.`);
    }
  }

  for (const target of REQUIRED_LINK_TARGETS) {
    if (!guide.includes(target)) {
      fail(`${locale.id}: guide is missing required canonical/help link ${target}.`);
    }
  }

  const requiredLocalisedLabels = [
    ["risk acknowledgement title", catalogue["riskAcknowledgement.title"]],
    ["Exit action", catalogue["riskAcknowledgement.action.exit"]],
    ["Start Mining action", catalogue["action.startMining"]],
  ];

  for (const [label, value] of requiredLocalisedLabels) {
    if (typeof value !== "string" || value.trim() === "") {
      fail(`${locale.id}: app catalogue is missing ${label}.`);
      continue;
    }

    if (!guide.includes(value)) {
      fail(
        `${locale.id}: guide does not use the released app's localised ${label}: "${value}".`,
      );
    }
  }

  for (const legacyLabel of [
    "**Mining Risk Acknowledgement — Version 1.0**",
    "**Start Mining**",
    "**Exit**",
  ]) {
    if (guide.includes(legacyLabel)) {
      fail(
        `${locale.id}: guide still contains legacy English app label ${legacyLabel}.`,
      );
    }
  }

  if (NON_LATIN_REVIEW_LOCALES.has(locale.id)) {
    for (const [index, line] of guide.split(/\r?\n/).entries()) {
      if (/^\s{4}/.test(line) || /^\s*```/.test(line)) continue;

      const reviewText = stripProtectedTerms(line);
      if (SUSPICIOUS_ENGLISH_PROSE_PATTERN.test(reviewText)) {
        warn(
          `${locale.id}:WINDOWS_INSTALLATION.md:${index + 1} contains English prose outside the protected technical-term set; review localisation quality.`,
        );
      }
    }
  }
}

if (warnings.length > 0) {
  console.warn("Localised installation-guide review warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Localised installation-guide validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Localised installation-guide checks passed for ${releaseLocales.length} translated release locales.`,
  );
}
