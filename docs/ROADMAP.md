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

The published v1.0.0 Windows miner remains the current public release. The current `main` branch now contains the completed localisation implementation through L7d **and** the subsequent translation-quality audit. Application/package versions intentionally remain at 1.0.0 until the L9 release-hardening slice.

The revised localisation programme (5 October 2026) establishes extensible language coverage without a permanent maximum. The current v1.1.0 development set is canonical `en-AU` plus **23 release-enabled translated LTR locales**. All 23 have complete UI/accessibility/status catalogues, complete Mining Risk Acknowledgement v1.0 content, recorded provenance/review state and completed proportional Windows acceptance. The complete developer-only Serbian Cyrillic locale was also included in the translation-quality audit.

Completed development stages:

- L1-L5: localisation framework, UI extraction, structured backend/frontend message boundary, structured Risk Acknowledgement v1.0, Windows locale matching and persistent language selector;
- L6: pilot translations, developer-only `en-XA`, responsive layout hardening and pilot Windows acceptance;
- L7a: `fr`, `it`, `nl`, `pl`, `pt-BR`, `pt-PT`, `tr`, `hu`, `sl` — merged through PR #12;
- L7b: `ru`, `uk`, `el` — merged through PR #13;
- L7c: `id`, `vi`, `fil` — merged through PR #14;
- L7d: `ko`, `hi`, `bn` — merged through PR #15;
- translation-quality audit: all existing genuine translated localisations reviewed directly against canonical `en-AU`, with conservative corrections and full structural/Windows acceptance recorded in PR #16.

Next release stages:

- **L8 — complete pending merge:** one Windows x64 NSIS installer carries English plus 21 translated installer languages, with seven project-maintained Tauri-message files, English installer fallback for Filipino/Bengali, and essential translated installation/security/first-use guides for all 23 translated app locales. Automated, package-build and representative physical Windows acceptance completed on 6 October 2026;
- **L9 — next after L8 merge:** perform release hardening against the actual enabled locale registry, repeat final packaging/Windows validation, update versions consistently from 1.0.0 to 1.1.0, and prepare—but do not yet publish—the release candidate;
- **Final release gate:** publish v1.1.0 only after explicit approval of the verified commit, release notes, installer and checksum materials.

Serbian Cyrillic (`sr-Cyrl`) and Traditional Chinese (`zh-Hant`) remain deferred from ordinary release selection. RTL implementation is optional future investigation and is not a v1.1.0 or later mandatory gate under the current programme. New languages can be added through separately approved work without creating a universal maximum.

The clause 7.1 wording clarification from “provided under GPL-3.0” to “distributed under GPL-3.0” has already been assessed and implemented as a non-substantive terminology clarification. Mining Risk Acknowledgement remains version `1.0`; published v1.0.0 assets and existing acceptance records are not retroactively changed.

Translation perfection is not treated as an open-ended release blocker once the defined review/validation gates are satisfied. English remains the canonical reference, native-speaker corrections are explicitly welcome, and translation-only refinements that preserve canonical meaning may be incorporated into later patch releases through normal review.

## Deferred / optional future work

Potential later features only if they are useful:

- additional visual-state variants;
- special double-hit celebration;
- richer diagnostics/log view;
- automatic performance tuning;
- alternative visual themes;
- continuous character animation;
- other platforms.
