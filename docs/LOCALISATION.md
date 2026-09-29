# Localisation

The Safex Mine uses a small in-repository localisation layer under src/i18n.

## Current scope

Localisation Slice L1 established the framework. Localisation Slice L2 extracts the existing normal frontend UI into the canonical English catalogue while preserving the v1.0.0 English wording and behaviour.

English (Australia), en-AU, remains the canonical source locale and the only enabled locale. The locked release locale set is present in the metadata registry so script and direction information can be validated early, but every non-English locale remains disabled and has no translation catalogue yet.

## Structure

- src/i18n/locales.json — locale registry and metadata.
- src/i18n/catalogues/en-AU.json — canonical English translation catalogue.
- src/i18n/index.ts — locale resolution, translation lookup, interpolation, English fallback and persistent UI-language override hooks.
- src/i18n/formatting.ts — number/date formatting helpers that use regional formatting independently of the UI language.
- src/i18n/types.ts — shared localisation types.
- scripts/i18n-check.mjs — catalogue and metadata validation.

Each locale registry entry contains:

- locale ID;
- native language name;
- text direction (ltr or rtl);
- fallback locale information;
- whether the locale is enabled.

The metadata is deliberately suitable for later right-to-left languages and for Windows preferred-UI-language matching. Arabic, Persian and Urdu are marked RTL in the registry now, although they remain disabled. Country flags are not used as language identifiers.

## Translation lookup and fallback

translate() resolves the requested UI locale, looks up the translation key in that catalogue and falls back to en-AU if the requested locale or key cannot be resolved. If a key does not exist even in en-AU, the key itself is returned so the failure remains visible and diagnosable.

Interpolation uses named placeholders such as {height} and {mode}. Values are substituted as plain text; the localisation layer does not evaluate expressions or translated markup. Missing placeholder values remain visibly unresolved rather than becoming undefined text.

## Persistent UI-language override

LANGUAGE_OVERRIDE_STORAGE_KEY, getLanguageOverride() and setLanguageOverride() provide the persistence mechanism for a future user-selected UI language. L1 does not expose a selector and does not yet apply a stored override during startup.

The UI language and regional formatting locale are separate concerns. Changing the UI language must not implicitly force number/date formatting to the same locale. formatting.ts therefore uses the runtime regional formatting locale unless a caller explicitly supplies another formatting locale.

## Adding another locale later

1. Add or update locale metadata in src/i18n/locales.json.
2. Add a matching catalogue under src/i18n/catalogues.
3. Register the catalogue in src/i18n/index.ts.
4. Keep the complete key set aligned with en-AU.
5. Preserve the same named placeholders used by the canonical English value.
6. Run npm run i18n:check and npm run build.
7. Enable a locale only when its catalogue is complete.

Technical names and identifiers such as The Safex Mine, Safex Cash, SFX, XMRig, WinRing, MSR, UAC, RPC, SHA-256 and GPL-3.0 should not be translated casually.

## Validation

Run:

    npm run i18n:check

The validator checks locale metadata, enabled-locale catalogue presence, missing keys, unexpected keys, blank values and placeholder mismatches. It also scans the normal frontend source for translation-key references and verifies that every referenced key exists in the canonical en-AU catalogue.

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
