# Roadmap

This roadmap reflects the **current implementation state**, not the earlier design plan.

## Completed: mining core

- Safex-compatible XMRig integration;
- Safex Cash address validation;
- default public daemon;
- custom/LAN daemon entry;
- Calm/Balanced/Full Bore profiles;
- Start/Stop;
- live hashrate/thread telemetry;
- accepted/rejected counters;
- session timer.

## Completed: Windows privilege and lifecycle model

- standard-user Tauri GUI;
- UAC-elevated narrow helper;
- authenticated local named-pipe session;
- persistent helper across Stop -> Start;
- MSR success/failure telemetry;
- degraded mining path when MSR is blocked;
- graceful Ctrl+C stop;
- XMRig Job Object with kill-on-close protection;
- helper/backend failure detection and fresh-session recovery.

## Completed: connection recovery

- live daemon status/height;
- detection of mining connection loss;
- OFFLINE visual state;
- zero current hashrate while jobs are unavailable;
- automatic return to MINING when XMRig reconnects;
- no unnecessary new UAC prompt for ordinary daemon recovery.

## Completed: v1 visual/audio system

- READY / STOPPED scene;
- MINING scene;
- BLOCK FOUND scene;
- REJECTED scene;
- OFFLINE scene;
- scene crossfades;
- Safex header branding;
- Safex Cash bullion-bar visual motif;
- block-found cash-register sound;
- persistent mute/unmute control.

## Published baseline: v1.0.0 (18 September 2026)

### Packaging

Implemented:

- packaged helper resolution through the Tauri resource directory;
- bundled `runtime/` locations for helper, XMRig and WinRing;
- release-only merged Tauri configuration;
- dedicated `npm run tauri:build` wrapper that builds the helper before packaging;
- bundled project/third-party licence notices.

Validated:

- NSIS-only packaged build on Windows;
- GitHub-hosted clean-machine installer download;
- SmartScreen/Defender installation and recovery path;
- installed mining/helper UAC behaviour;
- Defender Full scan with the narrow install-folder exclusion;
- uninstall behaviour.

Publication completed:

- final source/documentation consistency and release preparation were completed;
- the public Windows x64 NSIS installer `The-Safex-Mine_1.0.0_x64-setup.exe` was published under the [v1.0.0 GitHub release](https://github.com/aussiesloth/the-safex-mine/releases/tag/v1.0.0);
- `SHA256SUMS.txt` and the final installer checksum were published alongside it.

The published v1.0.0 release is a historical baseline; future localisation changes do not retrospectively change its installer.

### Build reproducibility

- keep the Rust `base58-monero` address validator covered by release testing, including checksum, Safex mainnet prefix and address-structure checks;
- verify `npm ci` works on a clean contributor machine;
- document the exact reproducible XMRig MSVC/dependency build process used for release binaries.

### Product polish (optional future work)

- tidy source formatting where iterative development left uneven indentation;
- review UI wording and remaining backend messages.

### Documentation and licensing

Completed for the published v1.0.0 release:

- third-party dependency licence audit;
- generated dependency licence bundle;
- fallback package attributions;
- corresponding Safex XMRig source information;
- bundled WinRing0 redistribution notice;
- README/build/troubleshooting/security documentation;
- Windows installation guide with clean-machine screenshots;
- v1.0.0 changelog preparation.

### Release validation

Completed release-gate validation includes clean-machine installation/uninstall, helper UAC behaviour, MSR success and degraded paths, default-daemon mining, accepted-block presentation/sound, SmartScreen/Defender behaviour and full-scan survival with the narrow exclusion.

A naturally occurring rejected-result capture and an additional custom/LAN daemon regression run remain optional evidence, not v1.0.0 release blockers.

The final v1.0.0 SHA-256 was generated from the released installer and is available in the published release notes and `SHA256SUMS.txt`.

## Public release

Published v1.0.0 characteristics:

- unsigned Windows distribution;
- public source repository for inspection;
- clear community-project wording;
- checksum and source/version information;
- known-issues section if required.

## Current development phase: v1.1.0 localisation

The existing v1.0.0 Windows miner is public. The next proposed update is localisation-focused; do not change app/package versions to 1.1.0 until the L9 release-hardening slice.

The revised localisation programme (5 October 2026) establishes **extensible language coverage without a permanent maximum**. The current planning snapshot is canonical `en-AU` plus **23 LTR translations**, subject to complete content, actual release approval and validation. This snapshot must not become a hard-coded ceiling. Only explicitly approved, complete locales may be release-enabled.

- L6: reconcile the pilot PR with the current release scope, retain Serbian Latin as release-intended and keep completed Serbian Cyrillic pilot work inactive/deferred; preserve developer-only `en-XA`.
- L7a: European and related Latin-script languages — `fr`, `it`, `nl`, `pl`, `pt-BR`, `pt-PT`, `tr`, `hu`, `sl`. Completed and merged through PR #12; v1.0.0 assets unchanged.
- L7b: Cyrillic and Greek — `ru`, `uk`, `el`. Completed and merged through PR #13; v1.0.0 assets unchanged.
- L7c: Southeast Asian Latin scripts — `id`, `vi`, `fil`. Completed and merged through PR #14; v1.0.0 assets unchanged.
- L7d: remaining Asian LTR scripts — `ko`, `hi`, `bn`. Implemented on a dedicated branch, pending Windows CJK/Indic shaping and layout acceptance.
- L8: use supported multilingual NSIS installer capabilities and translate essential public documentation, documenting installer-language fallbacks where these differ from app languages.
- L9: test all *actually enabled and approved* locales, script-family layouts, settings persistence and Mining Risk Acknowledgement continuity; prepare the v1.1.0 release, without publishing until explicitly approved.

The v1.1.0 release-intended pilots carried forward are `de`, `es`, `sr-Latn`, `zh-Hans`, `ja`. Serbian Cyrillic (`sr-Cyrl`) and Traditional Chinese (`zh-Hant`) are deferred; RTL implementation is optional future investigation and **not** a required milestone or release gate for this or later versions. New locale proposals can be added in separately approved slices without a universal maximum.

The proposed *distributed under GPL-3.0* Risk Acknowledgement wording clarification requires separate canonical-source/version-policy reconciliation, not an undocumented change to published v1.0.0 assets.

## Deferred / optional future work

Potential later features only if they are useful:

- additional visual-state variants;
- special double-hit celebration;
- richer diagnostics/log view;
- automatic performance tuning;
- alternative visual themes;
- continuous character animation;
- other platforms.
