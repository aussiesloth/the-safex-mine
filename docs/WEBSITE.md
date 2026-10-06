# GitHub Pages website

## Purpose

The public project website is a small static, multilingual front door for **The Safex Mine**.

It is intentionally separate from the Tauri/Vite desktop application and is designed to be published by GitHub Pages from:

```text
main /docs
```

Expected public URL:

```text
https://aussiesloth.github.io/the-safex-mine/
```

The website does not replace the GitHub repository or GitHub Releases. Installers and checksums remain release assets on GitHub.

## Structure

```text
docs/
├── index.html
├── .nojekyll
├── assets/
│   └── website/
│       ├── site.css
│       ├── site.js
│       ├── translations.json
│       └── release.json
└── images/
    └── website/
        ├── mining.png
        ├── safex-gradient-logo.svg
        ├── favicon.png
        └── the-safex-mine-v1.1.0.png
```

The site uses plain HTML, CSS and browser JavaScript. It has no framework, external JavaScript, analytics, advertising, cookies or external fonts.

The only local browser state written by the site is the selected language override.

## Localisation

English (Australia), `en-AU`, is the canonical website source language.

The ordinary release-enabled locales in:

```text
src/i18n/locales.json
```

are authoritative for which languages the website may expose and for each language's native display name and text direction.

Website-specific copy lives in:

```text
docs/assets/website/translations.json
```

The site does not treat the application UI catalogue as website copy. This keeps website wording maintainable while allowing `npm run pages:check` to enforce exact locale parity with the released application.

Disabled, deferred and developer-only application locales are not exposed on the website.

Language selection priority is:

1. a valid explicit `?lang=<locale>` URL parameter;
2. a previously selected website language stored in the browser;
3. the closest supported browser language;
4. `en-AU`.

A manual selection is stored locally and updates the shareable URL. The page `lang` and `dir` attributes are updated with the active locale.

Translated Windows installation-guide links point to the existing Markdown files rendered by GitHub. Those guides remain the longer-form security and first-use instructions.

Translations use the same project position as the v1.1.0 application: AI-assisted community-project localisation, with English (Australia) as the canonical reference. They are not described as professional, native-speaker or legal certification.

A website-specific localisation quality pass was completed on 6 October 2026 across all 23 translated release locales. The review compared every website string against canonical `en-AU`, used the already-reviewed application catalogues as the preferred terminology reference, preserved product names and technical identifiers that users need to recognise, and specifically checked for unnecessary English prose embedded in translated copy. Native-speaker corrections remain welcome.

`pages:check` also emits non-failing review warnings for two common regression patterns: long translated strings that are copied unchanged from canonical English, and suspicious ordinary-English prose appearing in non-Latin-script locales outside the protected technical-term set. These warnings require human review rather than automatically failing the build.

## Release metadata

The current public release data is isolated in:

```text
docs/assets/website/release.json
```

For a future public release, update that file as part of release/documentation work:

- `version`;
- publication date;
- installer filename;
- direct installer URL;
- GitHub release URL;
- checksum-file URL;
- published installer SHA-256.

The site deliberately does not call the GitHub API at runtime to discover the current release.

The HTML and fetched website data use explicit cache-version query strings. When changing `site.js`, `site.css`, `translations.json` or other runtime website data, bump the shared website asset version so returning browsers do not continue using a stale cached copy.

`npm run pages:check` verifies that the website release version matches `package.json` and that release metadata is structurally consistent.

## Website assets

The website owns copies of the production assets it publishes under `docs/images/website/`.

That prevents GitHub Pages from depending on application files outside the `/docs` publishing root.

The source application assets remain authoritative for application packaging. When intentionally updating a website copy, record the source in `docs/ASSETS.md`.

## Validation

Run:

```powershell
npm.cmd run pages:check
npm.cmd run i18n:check
npm.cmd run build
```

`pages:check` verifies, among other things:

- website locale parity with the ordinary enabled application locales;
- native names and text directions against the app registry;
- canonical website translation-key parity;
- non-blank translations;
- placeholder parity;
- presence of every translated installation guide;
- required website assets;
- release metadata;
- website translation keys referenced by the HTML;
- absence of external JavaScript/CSS runtime dependencies in the landing page;
- review warnings for suspicious English-language leakage or wholly untranslated long strings.

## Local preview

Because the site loads JSON with `fetch()`, preview it through a local HTTP server rather than opening `docs/index.html` directly as a `file://` URL.

For example, from the repository root with Python available:

```powershell
python -m http.server 8000 --directory docs
```

Then open:

```text
http://localhost:8000/
```

Representative visual checks should include a narrow phone-sized viewport and language/script stress checks such as German, Vietnamese, Greek, Russian or Ukrainian, Simplified Chinese, Japanese or Korean, Hindi and Bengali.

## Publishing

After the website PR is reviewed and merged, enable GitHub Pages in the repository settings:

1. open **Settings -> Pages**;
2. choose **Deploy from a branch**;
3. select branch **main**;
4. select folder **/docs**;
5. save.

After GitHub reports a successful deployment, inspect the live site before adding a prominent website link to other project surfaces if desired.
