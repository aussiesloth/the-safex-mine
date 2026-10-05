# Localisation

The Safex Mine uses a small in-repository localisation layer under src/i18n.

## Current scope

Localisation Slice L1 established the framework. Localisation Slice L2 extracted the normal frontend UI into the canonical English catalogue. Localisation Slice L3 moved ordinary Rust/backend-originating status and error presentation across a structured machine-readable boundary so the frontend localisation layer owns the human-readable wording. Localisation Slice L4 refactored Mining Risk Acknowledgement v1.0 into versioned structured localisation data without changing its wording or acceptance semantics. Localisation Slice L5 adds Windows preferred-UI-language detection, locale matching and the persistent user language selector.

English (Australia), en-AU, is the canonical source locale. At the merged L5 baseline it remains the only enabled locale; the first pilot translations exist separately in unmerged L6 PR #9. Locale registrations are extensible metadata, not a locked release-language list. A proposed language is not automatically enabled merely because it is registered or has a review draft.


## Governing coverage policy for v1.1.0 and later

The revised governing programme (5 October 2026) **does not impose a locked language total, a permanent maximum, or an obligation to deliver every locale named in an earlier plan**. Scope is an approved per-release planning snapshot. Adding further languages or script variants is possible in any future separately governed slice; no new numerical ceiling should be introduced by a registry, validation script, installer, test plan or documentation.

The present proposed v1.1.0 target is **en-AU plus 23 LTR translations**, subject to completion and normal release approval. It is not the current published v1.0.0 feature set and is not a future limit:

| Delivery group | Planned release-intended locales |
| --- | --- |
| L6 pilots retained for release | `de`, `es`, `sr-Latn`, `zh-Hans`, `ja` |
| L7a — European and related Latin scripts | `fr`, `it`, `nl`, `pl`, `pt-BR`, `pt-PT`, `tr`, `hu`, `sl` |
| L7b — Cyrillic and Greek | `ru`, `uk`, `el` |
| L7c — Southeast Asian Latin scripts | `id`, `vi`, `fil` |
| L7d — remaining Asian LTR scripts | `ko`, `hi`, `bn` |

Serbian Cyrillic (`sr-Cyrl`) was included in L6 as a pilot and its completed material should be retained for future development, but it is **not** proposed as a selectable v1.1.0 release locale. Traditional Chinese (`zh-Hant`) is likewise deferred. Existing L6 PR #9 must reconcile the registry and translation-status flags to this approved release intent before merge; this documentation change does not itself enable/disable a locale or alter that PR.

The `en-XA` pseudo-locale remains a developer-only layout tool, not a release language. An additional release language can be proposed and added by an approved new or adjusted slice without changing any programme-wide total.

**RTL is optional, not a gate.** Retain useful direction metadata, but there is no mandatory RTL implementation, deadline, release deliverable or release-blocking RTL test for v1.1.0 or any later release. A future RTL experiment requires its own explicit feasibility, accessibility, bidirectional technical-field and UI approval. Inactive RTL records do not imply an obligation to publish them.

For each release, the actual release-approved and enabled locale registry is the test scope. UI, accessibility/status strings, the complete matching version of the Risk Acknowledgement, placeholders, recorded translation review/provenance, Windows/manual selection and proportionate script-family visual QA must be complete before enabling a locale. Installer-language support may be a documented subset of app UI languages, with clear fallback.

The proposed canonical Risk Acknowledgement clause 7.1 wording change (“is **distributed under** the GNU General Public License” in place of “is provided under”, retaining “is provided without warranties”) requires separate reconciliation with the structured en-AU v1.0 source and corresponding translations. Assess its non-substantive status under the acknowledgement-version rule; do not silently modify published v1.0.0 assets or existing acceptance records. This governance-only document does not implement that wording change.

## Structure

- src/i18n/locales.json — locale registry and metadata.
- src/i18n/catalogues/en-AU.json — canonical English translation catalogue.
- src/i18n/index.ts — locale resolution, translation lookup, interpolation, English fallback and persistent UI-language override hooks.
- src/i18n/formatting.ts — number/date formatting helpers that use regional formatting independently of the UI language.
- src/i18n/runtime.ts — Windows locale detection startup, override priority, document lang/dir updates and live language-change notifications.
- src/i18n/languageSelector.ts — reusable no-flag language selector used by the main UI and Risk Acknowledgement.
- src/i18n/types.ts — shared localisation types.
- src/i18n/riskAcknowledgements/ — versioned structured Mining Risk Acknowledgement translations.
- src/i18n/riskAcknowledgements/types.ts — acknowledgement content structure (sections, paragraphs, lists and inline emphasis).
- scripts/i18n-check.mjs — catalogue, metadata and Risk Acknowledgement validation.

Each locale registry entry contains:

- locale ID;
- native language name;
- text direction (ltr or rtl);
- fallback locale information;
- whether the locale is enabled.

Direction metadata is retained for extensibility and Windows preferred-UI-language matching. RTL implementation (including Arabic, Persian and Urdu) is optional future work requiring separate approval; neither v1.1.0 nor a later release is obliged by this programme to implement RTL. Such deferred entries remain disabled. Country flags are not used as language identifiers.

## Translation lookup and fallback

translate() resolves the requested UI locale, looks up the translation key in that catalogue and falls back to en-AU if the requested locale or key cannot be resolved. If a key does not exist even in en-AU, the key itself is returned so the failure remains visible and diagnosable.

Interpolation uses named placeholders such as {height} and {mode}. Values are substituted as plain text; the localisation layer does not evaluate expressions or translated markup. Missing placeholder values remain visibly unresolved rather than becoming undefined text.

## Persistent UI-language override

LANGUAGE_OVERRIDE_STORAGE_KEY, getLanguageOverride() and setLanguageOverride() persist an explicit user-selected language. L5 applies locale selection in this order:

1. explicit stored user override;
2. the best enabled match from Windows preferred UI languages;
3. language/script fallback where appropriate;
4. en-AU.

Selecting “Use Windows language” removes the explicit override and returns the application to Windows-driven language selection. The selector is available in the normal top bar and inside the first-run Mining Risk Acknowledgement before acceptance.

Windows preference detection is performed in Rust with GetUserPreferredUILanguages using language-name format. The frontend passes only currently enabled application locales to the matcher, so disabled future catalogues cannot become active prematurely.

The matcher is designed for an extensible enabled-locale registry. Regional Spanish variants collapse to es when enabled; Brazilian and European Portuguese remain distinct; Simplified and Traditional Chinese and Serbian script variants retain separate identities if and when enabled. Rust tests may cover registered future mappings without making inactive variants release requirements.

The active locale updates document lang and dir immediately. The normal application chrome, persistent status text and Risk Acknowledgement refresh without discarding mining/settings state.

The UI language and regional formatting locale remain separate concerns. Changing the UI language does not force number/date formatting to the same locale. formatting.ts continues to use the runtime regional formatting locale unless a caller explicitly supplies another formatting locale.

## Adding another locale later

1. Add or update locale metadata in src/i18n/locales.json without imposing a fixed total.
2. Add a matching catalogue under src/i18n/catalogues and register it in src/i18n/index.ts.
3. Keep the complete UI, accessibility, validation and status keys aligned with en-AU; preserve named placeholders.
4. Add a complete, structurally validated, version-consistent Mining Risk Acknowledgement for the locale.
5. Record translation provenance/review status and verify native-name, fallback and script metadata.
6. Check visual rendering and Windows/manual language selection as appropriate to the actual script; run npm run i18n:check, npm run build and relevant tests.
7. Enable the locale only following explicit release-scope approval and completion of all required content and checks. Partial, proposed and deferred locales remain disabled.

Technical names and identifiers such as The Safex Mine, Safex Cash, SFX, XMRig, WinRing, MSR, UAC, RPC, SHA-256 and GPL-3.0 should not be translated casually.

## Validation

Run:

    npm run i18n:check

The validator checks locale metadata, enabled-locale catalogue presence, missing keys, unexpected keys, blank values and placeholder mismatches. It scans the normal frontend source, including the Risk Acknowledgement dialog chrome, for translation-key references and verifies that every referenced key exists in the canonical en-AU catalogue. It also validates each versioned Risk Acknowledgement document and compares its section/paragraph/list/emphasis structure with the canonical en-AU source.

## L2 extraction notes

The normal user-facing wording owned by src/main.ts now comes from src/i18n/catalogues/en-AU.json. Stable internal values and protocol tokens remain unchanged. For example, Calm, Balanced and Full Bore remain the MiningMode values passed to the backend, while their displayed labels come from localisation keys.

The following English text is intentionally not treated as an L2 frontend translation:

- src/riskAcknowledgement.ts remains unchanged because the Mining Risk Acknowledgement is reserved for L4.
- Rust/helper-originating message payloads that are currently passed through to the UI remain source text from the backend. L3 will replace ordinary expected backend UI messages with stable machine-readable codes plus frontend translation. L2 localises the frontend-owned explanation or prefix around those details where one already exists.
- Internal protocol markers such as STATUS EXITED, STATUS IDLE, DAEMON=CONNECTED, STARTED_DEGRADED and MSR=UNAVAILABLE remain stable machine values and are not displayed as translated labels.
- Developer-only console diagnostics remain in English.
- Technical units and identifiers such as H/s, kH/s, MH/s, RPC, MSR and XMRig remain technical content rather than translated prose.
- The bootstrap title in index.html remains the product name The Safex Mine. main.ts sets document.title from app.name when the frontend starts.

The L2 source audit should therefore treat any future ordinary user-facing English added directly to main.ts as localisation debt, while leaving the deferred/backend/technical categories above for their designated slices.


## L3 backend-boundary notes

The elevated helper's named-pipe/XMRig protocol remains an internal technical protocol. L3 does not redesign that protocol or the mining process lifecycle.

The Tauri command boundary now follows these rules:

- expected daemon-validation outcomes return stable codes and structured data rather than English display strings;
- the backend probe returns a stable code plus the application version;
- helper/UAC/session failures return a serialisable backend error object with a stable code and optional diagnostic detail;
- mining start and stop responses are converted from helper protocol tokens into structured frontend results;
- raw helper/XMRig/Windows detail may still be carried as diagnostic detail, but the frontend presents it only after a translated human-readable explanation;
- telemetry protocol markers such as STATUS ACTIVE, STATUS EXITED, DAEMON=CONNECTED and HASHRATE_HS remain internal machine values and are not themselves treated as translatable UI wording.

The frontend maps backend error/status codes to keys in the canonical en-AU catalogue. Unknown or low-level failures fall back to a translated explanation while preserving useful original diagnostic detail.

Rust unit tests cover the start/stop helper-response mapping that feeds the structured frontend results. Run the localisation validator, frontend build and Rust tests before merging L3.


## L4 Mining Risk Acknowledgement structure

Mining Risk Acknowledgement v1.0 is stored independently from the ordinary UI catalogue under `src/i18n/riskAcknowledgements/v1.0/`. The canonical source is `en-AU.json`.

The acknowledgement is data rather than arbitrary translated HTML. Stable structural IDs identify sections, paragraphs and list items; inline segments record deliberate strong emphasis; paragraph metadata records the highlighted statutory-rights paragraph. The frontend renderer creates DOM/text nodes from this structure.

A future translation of acknowledgement v1.0 must:

- retain acknowledgementVersion `1.0` and schemaVersion `1`;
- use the same structural IDs, block types, list-item count and emphasis pattern as the canonical en-AU source;
- contain non-blank translated headings and text;
- preserve technical product names and legal references accurately;
- pass `npm run i18n:check` before that locale is enabled.

The acknowledgement acceptance storage key and `ACKNOWLEDGEMENT_VERSION` remain unchanged in L4. Existing users who already accepted v1.0 therefore remain accepted, while first-run and permanent review behaviour continue to use the same acknowledgement version.

Translating Mining Risk Acknowledgement v1.0 into another language does **not** create acknowledgement v1.1. The acknowledgement version changes only when the substantive canonical source wording changes. A translation correction that preserves the same source meaning likewise does not, by itself, create a new acknowledgement version.


## L5 Windows locale and selector notes

The Windows API feature is enabled through the existing windows crate rather than introducing a new localisation dependency. The Rust command returns both the ordered Windows preferred-language list and the best match from the enabled locale IDs supplied by the frontend.

At the completed L5 baseline, en-AU is the only enabled catalogue. The selector therefore offers “Use Windows language” and English (Australia). Unsupported Windows languages safely resolve to en-AU. Subsequent approved translation slices can enable more complete catalogues without changing the L5 selection priority.

Language names come from locale metadata and are displayed in their own language. Country flags are not used. The language selector does not alter the saved Safex address, daemon, mining mode or sound preference, and selecting a UI language does not modify regional number/date conventions.
