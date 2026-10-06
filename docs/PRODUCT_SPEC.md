# Product Behaviour and Scope

## 1. Product summary

**The Safex Mine** is a Windows graphical solo miner for Safex Cash (SFX). It wraps a Safex-compatible XMRig backend with configuration, privilege handling, telemetry, recovery and a themed state-driven user interface.

Current public release: `1.1.0` (6 October 2026). Application/package/helper metadata is aligned at `1.1.0`. The historical v1.0.0 release remains available but is no longer the current release.

## 2. Published baseline and current development scope

The published v1.0.0 baseline is a Windows x64 desktop application with:

- simple Safex Cash address entry;
- default/custom daemon support;
- three CPU allocation modes;
- Start/Stop control;
- live mining statistics;
- accepted/rejected event handling;
- resilient daemon-loss handling;
- narrow UAC elevation;
- authored static mining scenes;
- block-found audio with a persistent mute control.

Continuous character animation is not part of the current release scope.

## 3. Main interface

The main window contains:

- product/Safex branding header;
- connection/mining status;
- persistent sound toggle;
- language selector in published v1.1.0;
- main mine scene;
- Safex Cash address;
- daemon endpoint/status;
- mining-mode buttons;
- hashrate;
- worker threads;
- session time;
- Blocks Found;
- Rejected;
- Start and Stop controls;
- backend/status messaging.

## 4. Mining configuration

### Address

A valid Safex Cash mainnet mining address is required. If the saved mining address is changed to a different valid address while stopped, that change starts a fresh in-memory mining session: Blocks Found resets to 0, Rejected resets to 0, and accumulated mining time resets to 00:00:00.

### Daemon

Default:

```text
rpc.safex.org:17402
```

Custom/LAN endpoints are supported.

### CPU modes

- Calm: 40%
- Balanced: 70%
- Full Bore: 100%

Balanced is the default saved-mode fallback.

## 5. Mining lifecycle

Start Mining:

- validates configuration;
- starts/reuses the elevated helper;
- launches the pinned Safex XMRig backend;
- applies the selected CPU hint;
- attempts MSR optimisation;
- transitions into live mining telemetry.

Stop Mining:

- requests graceful XMRig shutdown;
- preserves the current in-memory session counters/time;
- leaves the helper ready for another Start during the same app session.

## 6. Live status and recovery

The UI distinguishes:

- ready/stopped;
- mining;
- daemon offline while XMRig remains alive;
- helper/backend failure.

Daemon loss is recoverable in place. A dead helper/backend session is discarded so a fresh Start can launch a new helper.

## 7. Session statistics

The current session tracks:

- hashrate;
- worker threads;
- mining time;
- accepted blocks;
- rejected results.

Blocks/rejects/time survive Stop -> Start but reset after a full app restart.

## 8. Visual states

Required/implemented scenes:

- READY / STOPPED;
- MINING;
- BLOCK FOUND;
- REJECTED;
- OFFLINE.

The scenes crossfade while the fixed interface remains stationary.

Safex Cash treasure is shown as rectangular bullion bars. Bars may be visible on the table, but are hidden in the rock face. BLOCK FOUND shows the miner holding the discovered bar aloft.

## 9. Block-found audio

A real accepted block triggers a short cash-register-style sound at the same time as the counter and BLOCK FOUND scene.

The user can mute/unmute that sound from the top bar. The preference is saved across restarts.

## 10. Windows privilege policy

The GUI is never intended to require Administrator mode.

Only the helper is elevated. The helper controls XMRig, owns its Job Object and handles the MSR-capable mining session.

## 11. Performance policy

The app should not imply that a higher CPU allocation always produces a higher hashrate.

Full Bore means maximum configured CPU allocation, not guaranteed maximum efficiency.

## 12. Localisation and first-run language behaviour

The published v1.0.0 installer is the historical English-only baseline. Current `main` adds Windows preferred-UI-language matching, a persistent manual language override, live language switching, and language selection on the first-run Mining Risk Acknowledgement before acceptance.

Canonical `en-AU` is the source/fallback locale. Published v1.1.0 contains **23 release-enabled translated LTR locales** in addition to English, each with complete UI/accessibility/status content and Mining Risk Acknowledgement v1.0. The complete developer-only Serbian Cyrillic locale and `en-XA` pseudo-locale are retained for development/testing but are not ordinary release choices. Translation-quality review is complete for the current human-language set; native-speaker corrections remain welcome.

L8 adds a single multilingual Windows x64 NSIS installer configuration with English plus 21 translated installer languages, documented English installer fallback for Filipino and Bengali, and essential translated installation/first-use guidance for every release-enabled translated app locale. L8 packaged acceptance and L9 release hardening completed successfully. v1.1.0 was built from commit `4140fec9fbee64dc362484988b502a22a3a56699` and published on 6 October 2026.

## 13. Current scope exclusions

Not part of the current product scope unless separately approved:

- continuous miner animation;
- GPU mining;
- mining-pool management;
- automatic CPU-profile tuning;
- non-Windows desktop builds;
- automatic updater;
- dynamically accumulating reward sprites;
- complex particle systems.
