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

## Current phase: v1.0.0 release

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

Remaining release-preparation work:

- perform the final source/documentation consistency check;
- merge the release-preparation branch;
- build the final v1.0.0 installer from the merged release commit/tag;
- publish the SHA-256 for that exact installer.

### Build reproducibility

- keep the Rust `base58-monero` address validator covered by release testing, including checksum, Safex mainnet prefix and address-structure checks;
- verify `npm ci` works on a clean contributor machine;
- document the exact reproducible XMRig MSVC/dependency build process used for release binaries.

### Product polish

- tidy source formatting where iterative development left uneven indentation;
- review UI wording and remaining backend messages.

### Documentation and licensing

Completed for v1.0.0 preparation:

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

The final SHA-256 is generated only after the exact v1.0.0 public installer is built.

## Public release

Planned release characteristics:

- unsigned Windows distribution;
- public source repository for inspection;
- clear community-project wording;
- checksum and source/version information;
- known-issues section if required.

## Deferred / optional future work

Potential later features only if they are useful:

- additional visual-state variants;
- special double-hit celebration;
- richer diagnostics/log view;
- automatic performance tuning;
- alternative visual themes;
- continuous character animation;
- other platforms.
