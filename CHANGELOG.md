# Changelog

All notable public-facing changes to The Safex Mine will be recorded here.

The project is currently pre-release, so the entries below describe the current development state rather than a published stable release.

## [Unreleased]

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
- Restricted the registered Rust invoke command surface to production-used commands.
- Switched the canonical backend source reference to `aussiesloth/safex-xmrig`, while retaining `galicone/xmrig` and `xmrig/xmrig` in the documented upstream provenance chain.
- Replaced the earlier continuous-animation concept with authored static scenes and crossfades.
- Reworked reward visuals from nuggets/coins to rectangular Safex Cash bullion bars.
- Removed visible reward bars from the rock face; the successful BLOCK FOUND state reveals the discovered bar in the miner's hand.

### Pending before public release

- Windows installer and clean-machine validation.
- Final third-party licence/release bundle validation.
- Release checksum workflow.
- Antivirus/SmartScreen release notes.
- Remaining dead-code/source-format tidy pass.
