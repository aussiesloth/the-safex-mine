# Localisation

The Safex Mine uses a small in-repository localisation layer under src/i18n.

## L1 scope

Localisation Slice L1 establishes the framework only. English (Australia), en-AU, is the canonical source locale and the only enabled locale in this slice. Existing user-facing strings in src/main.ts are intentionally not migrated yet; that work belongs to L2.

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

The metadata is deliberately suitable for later right-to-left languages and for Windows preferred-UI-language matching. Country flags are not used as language identifiers.

## Translation lookup and fallback

translate() resolves the requested UI locale, looks up the translation key in that catalogue and falls back to en-AU if the requested locale or key cannot be resolved. If a key does not exist even in en-AU, the key itself is returned so the failure remains visible and diagnosable.

Interpolation uses named placeholders such as {height} and {mode}. Values are substituted as plain text; the localisation layer does not evaluate expressions or translated markup. Missing placeholder values remain visibly unresolved rather than becoming undefined text.

## Persistent UI-language override

LANGUAGE_OVERRIDE_STORAGE_KEY, getLanguageOverride() and setLanguageOverride() provide the persistence mechanism for a future user-selected UI language. L1 does not expose a selector and does not yet apply a stored override during startup.

The UI language and regional formatting locale are separate concerns. Changing the UI language must not implicitly force number/date formatting to the same locale. formatting.ts therefore uses the runtime regional formatting locale unless a caller explicitly supplies another formatting locale.

## Adding another locale later

1. Add locale metadata to src/i18n/locales.json.
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

The validator checks locale metadata, enabled-locale catalogue presence, missing keys, unexpected keys, blank values and placeholder mismatches. In L1 it validates the canonical en-AU catalogue against the same rules future translations will use.
