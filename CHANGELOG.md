# Changelog

All notable public-facing changes to The Safex Mine will be recorded here.

The first public release is version **1.0.0**.

## [Unreleased] — v1.1.0 release-ready

### Added

- In-repository localisation framework with canonical `en-AU`, Windows preferred-UI-language matching, persistent manual language override and language selection before first-run acknowledgement.
- Complete UI/accessibility/status catalogues and Mining Risk Acknowledgement v1.0 content for **23 release-enabled translated LTR locales** in addition to canonical English.
- Developer-only expanded pseudo-locale `en-XA` and retained Serbian Cyrillic (`sr-Cyrl`) script-test material; these are not ordinary release choices.
- L8 single-binary multilingual NSIS configuration: English plus 21 translated installer languages, with documented English installer fallback for Filipino and Bengali.
- Essential Windows installation/security/first-use community translations for all 23 release-enabled translated application locales, with English retained as the canonical project reference.
- Source-controlled installer-locale manifest and automated release-conformance checks, with the historical `l8:check` command retained as a compatibility alias.

### Changed

- Ordinary backend status/error presentation now crosses a structured machine-readable boundary so human-readable wording is localised in the frontend.
- Mining Risk Acknowledgement v1.0 is stored as versioned structured localisation data while preserving acknowledgement version `1.0` and existing acceptance records.
- Responsive layout behaviour was hardened across Latin, Greek, Cyrillic, CJK, Hangul, Devanagari and Bengali content without locale-specific CSS.
- A complete translation-quality audit was merged after L7d, comparing every existing human-language localisation directly with canonical `en-AU`. These remain AI-assisted community-project translations; native-speaker corrections are welcome.
- The NSIS installer follows the Windows UI language automatically where supported; no extra installer language-picker dialog is enabled.

### Current release status

- The published release remains **v1.0.0** until the v1.1.0 GitHub release is actually published.
- L8 multilingual NSIS/public-documentation implementation and representative Windows packaged acceptance are complete.
- L9 release hardening is merged to `main`; application, Tauri, Rust and helper package versions are consistently `1.1.0`, while Mining Risk Acknowledgement remains version `1.0`.
- L9 automated checks, production NSIS packaging, final installation/launch/uninstall validation and dependency-licence review completed successfully on 6 October 2026. `main` is release-ready; only the final post-documentation build/checksum, explicit release approval and publication remain.

## [1.0.0] - 2026-09-18

### Added

- Windows Tauri desktop interface for Safex Cash solo mining.
- Safex Cash address validation.
- Default public daemon with custom/LAN daemon support.
- Calm (40%), Balanced (70%) and Full Bore (100%) CPU allocation profiles.
- Split-privilege Windows helper model for XMRig/MSR access.
- Authenticated local named-pipe GUI/helper communication.
- XMRig Job Object protection with kill-on-helper-close behaviour.
- Graceful Ctrl+C shutdown path for XMRig.
- Live hashrate, worker-thread, block/reject and session telemetry.
- Automatic daemon disconnect/reconnect handling.
- Recovery from unexpected helper/backend failure.
- Five static visual states: READY/STOPPED, MINING, BLOCK FOUND, REJECTED and OFFLINE.
- Safex branding and Safex Cash bullion-bar scene motif.
- Block-found cash-register sound effect.
- Persistent sound mute/unmute control.
- Custom The Safex Mine application icon set combining Safex Cash branding with a mining/pickaxe motif.
- Versioned first-run Mining Risk Acknowledgement with explicit user acknowledgement before the mining interface can be used, plus a permanent in-app Risk notice control for later review.

### Changed

- Changing the saved Safex address to a different valid address while mining is stopped now starts a fresh in-memory session, resetting Blocks Found, Rejected and accumulated mining time to 0.
- The project is now licensed under GNU GPL v3.0.
- Added release-only Tauri resource packaging for the helper, XMRig, WinRing driver and licence notices.
- Windows release packaging now targets the NSIS `-setup.exe` installer only; MSI is not part of the public release model.
- Restricted the registered Rust invoke command surface to production-used commands.
- Switched the canonical backend source reference to `aussiesloth/safex-xmrig`, while retaining `galicone/xmrig` and `xmrig/xmrig` in the documented upstream provenance chain.
- Replaced the earlier continuous-animation concept with authored static scenes and crossfades.
- Reworked reward visuals from nuggets/coins to rectangular Safex Cash bullion bars.
- Removed visible reward bars from the rock face; the successful BLOCK FOUND state reveals the discovered bar in the miner's hand.

### Validation completed

- NSIS-only Windows package generation.
- Clean-machine GitHub download and SmartScreen flow.
- Microsoft Defender quarantine/recovery and narrow install-folder exclusion.
- Installed first-run Mining Risk Acknowledgement.
- Helper-specific UAC and same-session Stop -> Start reuse.
- Defender Full scan with the narrow exclusion in place.
- Uninstall without UAC, including confirmation that user-created Defender exclusions remain for manual cleanup.

### Release publication

- Version **1.0.0** was published as the first public release on **18 September 2026**; it is not a release candidate.
- The public Windows x64 NSIS installer is `The-Safex-Mine_1.0.0_x64-setup.exe`, published with `SHA256SUMS.txt` at the [v1.0.0 release](https://github.com/aussiesloth/the-safex-mine/releases/tag/v1.0.0).
- The release is tagged `v1.0.0` and its published SHA-256 is provided in the release notes and checksum file.
- Clean-machine installation screenshots are included in the Windows installation guide.
- The locked Windows dependency graph has been audited and dependency licence/attribution material is included in the release bundle.
