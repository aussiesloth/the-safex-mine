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

### Changed

- Changing the saved Safex address while mining is stopped now resets Blocks Found to 0 while preserving Rejected and accumulated mining time.
- The project is now licensed under GNU GPL v3.0.

- Replaced the earlier continuous-animation concept with authored static scenes and crossfades.
- Reworked reward visuals from nuggets/coins to rectangular Safex Cash bullion bars.
- Removed visible reward bars from the rock face; the successful BLOCK FOUND state reveals the discovered bar in the miner's hand.

### Pending before public release

- Final packaged helper/backend paths.
- Windows installer and clean-machine validation.
- Custom application icon set.
- Project licence selection.
- Final third-party licence bundle.
- Release checksum workflow.
- Antivirus/SmartScreen release notes.
- Final code tidy/release-hardening pass.
