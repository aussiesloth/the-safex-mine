# Localisation

The Safex Mine uses a small in-repository localisation layer under src/i18n.

## Current scope

Localisation Slice L1 established the framework. Localisation Slice L2 extracted the normal frontend UI into the canonical English catalogue. Localisation Slice L3 moved ordinary Rust/backend-originating status and error presentation across a structured machine-readable boundary so the frontend localisation layer owns the human-readable wording. Localisation Slice L4 refactored Mining Risk Acknowledgement v1.0 into versioned structured localisation data without changing its wording or acceptance semantics. Localisation Slice L5 added Windows preferred-UI-language detection, locale matching and the persistent user language selector. L6 implemented the first translated pilot catalogues, Risk Acknowledgements and developer layout-stress tools. L7a adds the nine European and related Latin-script catalogues on a dedicated branch, pending Windows acceptance and merge.

English (Australia), en-AU, remains the canonical source locale. L6 makes German (`de`), Spanish (`es`), Serbian Latin (`sr-Latn`), Simplified Chinese (`zh-Hans`) and Japanese (`ja`) available as release-intended pilots. Serbian Cyrillic (`sr-Cyrl`) retains its complete pilot content as development-only script-test material but is disabled for release. `en-XA` is a development-only pseudo-locale. L7a additionally makes French, Italian, Dutch, Polish, Brazilian Portuguese, European Portuguese, Turkish, Hungarian and Slovenian release-intended/selectable following catalogue and structural completeness checks. Other proposed locales stay disabled until content, validation and release approval are complete.


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

Serbian Cyrillic (`sr-Cyrl`) was included in L6 as a pilot and its completed material should be retained for future development, but it is **not** proposed as a selectable v1.1.0 release locale. Traditional Chinese (`zh-Hant`) is likewise deferred. L6 reconciles registry and translation-status flags: Serbian Cyrillic is retained for development testing, but the v1.1.0 release-intended Serbian variant is Latin. Neither deferred script variant is a release requirement.

The `en-XA` pseudo-locale remains a developer-only layout tool, not a release language. An additional release language can be proposed and added by an approved new or adjusted slice without changing any programme-wide total.

**RTL is optional, not a gate.** Retain useful direction metadata, but there is no mandatory RTL implementation, deadline, release deliverable or release-blocking RTL test for v1.1.0 or any later release. A future RTL experiment requires its own explicit feasibility, accessibility, bidirectional technical-field and UI approval. Inactive RTL records do not imply an obligation to publish them.

For each release, the actual release-approved and enabled locale registry is the test scope. UI, accessibility/status strings, the complete matching version of the Risk Acknowledgement, placeholders, recorded translation review/provenance, Windows/manual selection and proportionate script-family visual QA must be complete before enabling a locale. Installer-language support may be a documented subset of app UI languages, with clear fallback.

L6 applies the accepted clause 7.1 clarification, replacing “is provided under the GNU General Public License” with “is **distributed under** the GNU General Public License” while retaining “is provided without warranties”. This identifies software distribution more precisely but does not change the warning, liability limitation, statutory rights or acceptance obligation. It is therefore assessed as non-substantive: Mining Risk Acknowledgement stays at version `1.0` and existing acceptance records remain valid. The structured canonical English source, pilot translations and Markdown reference are synchronised; already published v1.0.0 assets are not retrospectively modified.

## Structure

- src/i18n/locales.json — locale registry and metadata.
- src/i18n/catalogues/en-AU.json — canonical English translation catalogue; pilot and development-only catalogues sit beside it.
- src/i18n/translation-status.json — translation completeness, community feedback and enablement/provenance records.
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
- whether the locale is release-enabled; an optional developer-only marker allows inactive test locales.

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

The validator checks locale metadata, release/developer locale completeness and translation provenance, missing keys, unexpected keys, blank values and placeholder mismatches. It scans the normal frontend source, including the Risk Acknowledgement dialog chrome, for translation-key references and verifies that every referenced key exists in the canonical en-AU catalogue. It also validates each versioned Risk Acknowledgement document and compares its section/paragraph/list/emphasis structure with the canonical en-AU source.

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

## L6 pilot-language and review notes

The L6 pilot set is intentionally varied: German exercises text expansion, Serbian exercises both Cyrillic and Latin scripts, and Simplified Chinese and Japanese exercise CJK rendering. Spanish provides another widely used Latin-script language. All six language pilots retain the complete 104-key normal UI catalogue, including accessibility labels/tooltips, validation wording and backend/status explanations. Five are release-intended; Serbian Cyrillic is available only in development builds for script/layout tests.

The en-XA pseudo-locale is generated from the canonical English strings with conspicuous delimiters, diacritics and deliberate expansion. It has a complete UI catalogue and Mining Risk Acknowledgement so both the main dashboard and first-run/review acknowledgement layouts can be stressed. It is marked `developerOnly`, remains `enabled: false`, is excluded from Windows automatic matching and is only selectable when Vite reports a development build.

Mining Risk Acknowledgement v1.0 was translated clause-by-clause from the canonical en-AU structured source. The pilot translations preserve the same structural IDs, paragraph/list shape, emphasis pattern and acknowledgement version. A separate semantic/back-translation review checked the meaning of the risk warnings, warranty wording, statutory-rights qualification, responsibility clauses and limitation wording against the English source. Technical names and identifiers are preserved where appropriate.

Translation status and provenance are recorded in `src/i18n/translation-status.json`. These are AI-assisted **community-project translations**. Serbian Latin clause 7.1 received a targeted native-speaker correction; that does not constitute review of every paragraph. Language and terminology corrections—including native-speaker feedback—remain welcome. Translation corrections and the non-substantive GPL distribution clarification preserve canonical v1.0 meaning and do not change `ACKNOWLEDGEMENT_VERSION` or previous acceptance.

L6 also removes several fixed-width assumptions exposed by German and en-XA. Dashboard headers, stat labels, mode/action buttons and the Risk Acknowledgement header/actions can wrap or reflow without locale-specific CSS. The desktop control sidebar now grows responsively up to 460 px; the mining-mode section uses its own container width to retain three columns when space permits and stack the buttons at 400 px or narrower, while mode and Start/Stop labels wrap only at normal word boundaries. This avoids breaking German `Ausgewogen` mid-word and also works when the narrow-window layout presents sections in two columns.

## L7a Latin-script expansion (5 October 2026; PR pending acceptance)

Nine full 104-key UI/accessibility/status catalogues and nine complete structured Mining Risk Acknowledgement v1.0 documents are added: `fr`, `it`, `nl`, `pl`, `pt-BR`, `pt-PT`, `tr`, `hu` and `sl`. The pre-existing metadata entries are enabled, with new `hu` and `sl` metadata. Brazilian and European Portuguese have independently worded catalogues and risk documents, not aliases. Windows locale matching retains the existing regional preference: Brazilian tags map to `pt-BR`; other Portuguese tags without a Brazilian region map to `pt-PT` when both are enabled. A focused Rust regression test also covers L7a languages and preference order.

The original clause IDs, paragraph/list ordering, emphases, version `1.0`, acceptance storage key and canonical `en-AU` content are unchanged. The pre-existing clause 7.1 *distributed under GPL-3.0* clarification is carried into all new versions. Catalogue imports and provenance/enablement agreement are checked by the updated `i18n:check` script, as well as key, placeholder and acknowledgement-structure parity.

**Provenance and limitations:** Project-maintained AI-assisted draft translations were prepared directly from canonical `en-AU` with a separate project semantic/source comparison, including the non-excludable rights qualification, mining reward uncertainty, warranty limits, technical identifiers and GPL distribution/provision distinction. The Safex Mine translations are AI-assisted **community-project translations**, and language/terminology corrections—including native-speaker feedback—remain welcome, with particular attention to both Portuguese variants, Polish inflection, Turkish case handling and Hungarian/Slovenian diacritics. Review status is recorded per locale in `translation-status.json`.

The nine locales are release-intended in this development branch, **not part of the published v1.0.0 installer**. Physical Windows visual/persistence acceptance remains a pre-merge requirement. L7b, L7c, L7d, installer languages and release hardening remain separate.
