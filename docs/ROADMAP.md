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

## Current phase: release readiness

### Packaging

- replace development helper path with packaged runtime/sidecar path;
- define bundled XMRig and WinRing locations for installer builds;
- confirm `tauri build` produces a complete runtime;
- create/test Windows installer;
- test uninstall behaviour.

### Build reproducibility

- review the current Safex frontend dependency usage;
- remove any unused direct package such as `@safex/wallet-core` if it is not required;
- normalise any required GitHub dependencies from SSH-only lockfile URLs to anonymous HTTPS;
- verify `npm ci` works on a clean contributor machine without GitHub SSH configuration;
- document the exact reproducible XMRig MSVC/dependency build process used for release binaries.

### Product polish

- create final custom application icon set;
- remove unused default template assets;
- tidy source formatting where iterative development left uneven indentation;
- review/remove development-only Rust diagnostic commands from release builds;
- review UI wording and remaining backend messages.

### Documentation and licensing

- finalise The Safex Mine project licence;
- finalise third-party notices/licence bundle;
- include corresponding Safex XMRig source information;
- include exact WinRing redistribution notice;
- complete README/build/troubleshooting/security documentation;
- prepare release notes/changelog.

### Release validation

- clean-machine/VM install test;
- verify UAC/helper behaviour after installation;
- verify MSR success and degraded paths;
- verify default/custom daemon flows;
- verify accepted-block event and sound;
- attempt/collect a real rejected-result case if available;
- test SmartScreen/antivirus behaviour;
- generate SHA-256 checksums.

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
