const STORAGE_KEY = "safexMine.websiteLanguage";
const TRANSLATIONS_URL = "./assets/website/translations.json";
const RELEASE_URL = "./assets/website/release.json";
const CANONICAL_LOCALE = "en-AU";

function normaliseTag(tag) {
  return String(tag || "").trim().replace(/_/g, "-").toLowerCase();
}

function getEnabledLocales(data) {
  return Object.values(data.locales).filter((locale) => locale.enabled === true);
}

function resolveLocale(tag, data) {
  const requested = normaliseTag(tag);
  if (!requested) return null;

  const enabled = getEnabledLocales(data);
  const exact = enabled.find((locale) => normaliseTag(locale.id) === requested);
  if (exact) return exact.id;

  if (requested === "en" || requested.startsWith("en-")) return "en-AU";

  if (requested === "zh" || requested === "zh-cn" || requested === "zh-sg" || requested === "zh-my" || requested.startsWith("zh-hans")) {
    return data.locales["zh-Hans"]?.enabled ? "zh-Hans" : null;
  }

  if (requested === "pt-br" && data.locales["pt-BR"]?.enabled) return "pt-BR";
  if ((requested === "pt" || requested.startsWith("pt-")) && data.locales["pt-PT"]?.enabled) return "pt-PT";

  if ((requested === "sr" || requested.startsWith("sr-")) && data.locales["sr-Latn"]?.enabled) return "sr-Latn";

  const base = requested.split("-")[0];
  const baseMatches = enabled.filter((locale) => normaliseTag(locale.id).split("-")[0] === base);
  return baseMatches.length === 1 ? baseMatches[0].id : null;
}

function queryLanguage(data) {
  const value = new URLSearchParams(window.location.search).get("lang");
  if (value === null) return null;
  return resolveLocale(value, data) || CANONICAL_LOCALE;
}

function storedLanguage(data) {
  try {
    return resolveLocale(window.localStorage.getItem(STORAGE_KEY), data);
  } catch {
    return null;
  }
}

function browserLanguage(data) {
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const resolved = resolveLocale(candidate, data);
    if (resolved) return resolved;
  }

  return null;
}

function chooseInitialLocale(data) {
  return queryLanguage(data) || storedLanguage(data) || browserLanguage(data) || CANONICAL_LOCALE;
}

function setStoredLanguage(localeId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, localeId);
  } catch {
    // The site remains functional when storage is unavailable.
  }
}

function updateLanguageQuery(localeId) {
  const url = new URL(window.location.href);
  if (localeId === CANONICAL_LOCALE) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", localeId);
  }
  window.history.replaceState({}, "", url);
}

function translatePage(localeId, data) {
  const locale = data.locales[localeId] || data.locales[CANONICAL_LOCALE];
  const canonical = data.locales[CANONICAL_LOCALE];
  const strings = locale.strings;

  document.documentElement.lang = locale.id;
  document.documentElement.dir = locale.direction;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    const key = element.dataset.i18n;
    element.textContent = strings[key] ?? canonical.strings[key] ?? key;
  }

  for (const element of document.querySelectorAll("[data-i18n-alt]")) {
    const key = element.dataset.i18nAlt;
    element.setAttribute("alt", strings[key] ?? canonical.strings[key] ?? "");
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", strings["meta.description"] ?? canonical.strings["meta.description"]);
  }

  document.title = strings["meta.title"] ?? canonical.strings["meta.title"];
  document.getElementById("language-select").setAttribute("aria-label", strings["language.label"] ?? canonical.strings["language.label"]);
}

function configureLanguageSelector(data, activeLocale) {
  const select = document.getElementById("language-select");
  select.replaceChildren();

  for (const locale of getEnabledLocales(data)) {
    const option = document.createElement("option");
    option.value = locale.id;
    option.textContent = locale.nativeName;
    option.selected = locale.id === activeLocale;
    select.append(option);
  }
}

function installationGuideUrl(localeId) {
  const root = "https://github.com/aussiesloth/the-safex-mine/blob/main/";
  return localeId === CANONICAL_LOCALE
    ? root + "docs/WINDOWS_INSTALLATION.md"
    : root + "docs/localised/" + encodeURIComponent(localeId) + "/WINDOWS_INSTALLATION.md";
}

function applyRelease(release) {
  document.getElementById("download-link").href = release.installerUrl;
  document.getElementById("release-link").href = release.releaseUrl;
  document.getElementById("checksum-link").href = release.checksumUrl;
  document.getElementById("release-version").textContent = "v" + release.version;
  document.getElementById("release-sha").textContent = release.sha256;
}

function setLocale(localeId, data, persist = true) {
  const resolved = resolveLocale(localeId, data) || CANONICAL_LOCALE;
  translatePage(resolved, data);
  configureLanguageSelector(data, resolved);
  document.getElementById("install-guide-link").href = installationGuideUrl(resolved);

  if (persist) {
    setStoredLanguage(resolved);
    updateLanguageQuery(resolved);
  }

  return resolved;
}

async function start() {
  const [translationsResponse, releaseResponse] = await Promise.all([
    fetch(TRANSLATIONS_URL),
    fetch(RELEASE_URL),
  ]);

  if (!translationsResponse.ok || !releaseResponse.ok) {
    throw new Error("Website data could not be loaded.");
  }

  const translations = await translationsResponse.json();
  const release = await releaseResponse.json();

  applyRelease(release);

  let activeLocale = setLocale(chooseInitialLocale(translations), translations, false);

  document.getElementById("language-select").addEventListener("change", (event) => {
    activeLocale = setLocale(event.target.value, translations, true);
  });

  document.getElementById("install-guide-link").href = installationGuideUrl(activeLocale);
}

start().catch((error) => {
  console.error(error);
});
