# Testing and Release

## 1. Purpose

The Safex Mine should be released only after the installed application, mining backend, privilege model and recovery paths work together on clean Windows systems.

This file separates behaviour already exercised during development from release work that is still outstanding.

## 2. Development validation completed

### Mining

Development testing has confirmed:

- real Safex Cash mining through the integrated XMRig backend;
- live hashrate/thread telemetry;
- Calm/Balanced/Full Bore profile changes;
- normal Stop -> Start behaviour;
- multiple real accepted blocks;
- frontend accepted-block counter tracking.

### Real block-found presentation

A real accepted block has been observed end-to-end with:

- Blocks Found increment;
- BLOCK FOUND scene transition;
- block-found cash-register sound.

This confirms that the audio/visual celebration is attached to the real accepted-block event path rather than only to a simulator.

### MSR paths

Development has exercised both:

- hardware/system where XMRig MSR optimisation succeeds;
- hardware/system where Windows security prevents MSR writes and mining continues in degraded mode.

### Daemon loss/recovery

Development testing has exercised live network loss while mining:

- XMRig remains alive;
- GUI enters OFFLINE;
- hashrate goes to zero;
- reconnection resumes MINING without launching a new helper.

### Helper process protection

Development testing has verified that terminating the elevated helper causes the Job Object to terminate XMRig.

### Backend/helper failure recovery

Unexpected session failure has been exercised so the frontend can leave MINING, discard the dead session and allow a fresh Start.

### Mining Risk Acknowledgement

Development validation has confirmed the versioned first-run acknowledgement flow:

- a fresh profile shows **Mining Risk Acknowledgement — Version 1.0** before the mining interface can be used;
- **Exit** closes the application without recording acceptance;
- **Acknowledge and Continue** requires the checkbox and then loads the miner interface;
- reopening the application after acceptance does not show the first-run gate again;
- the **Risk notice** control remains available in the top bar and reopens the full acknowledgement on demand.

Clean-machine packaged-build validation confirmed the same first-run acknowledgement behaviour after installation.

### Windows package generation

`npm run tauri:build` has completed successfully on Windows after the release target was narrowed to NSIS only. The build produced exactly one Windows bundle:

```text
src-tauri\target\release\bundle\nsis\The Safex Mine_0.1.0_x64-setup.exe
```

The public release model is deliberately **NSIS-only**. `src-tauri/tauri.release.conf.json` targets `nsis`; MSI is not part of the public release model.

The SHA-256 recorded for the current clean-machine test artefact is:

```text
584DF8E7E83BEA4FF40B3DF24B5A565ACA6AED2D7651522DB9D24D27AF6A44D4
```

This checksum identifies the exact pre-release installer selected for clean-machine validation. Final public-release checksums must still be generated from the exact artefact ultimately published.

Successful NSIS-only bundle generation and clean-machine installation/security behaviour are confirmed. The remaining release work is final source/document consistency, merge/tag preparation, the final v1.0.0 build, and checksum publication.

## 3. Remaining release preparation and optional evidence

### Real rejection case

The rejection UI/parser path has been exercised through development/simulation, but a naturally occurring real rejected Safex result has not yet been relied upon as the primary validation case.

If practical, capture and retain a real rejection example before v1.0.

### Clean-machine installer test

A clean Windows test machine with no development toolchain has successfully exercised the NSIS installer.

Observed:

- GitHub-hosted installer downloaded successfully;
- SmartScreen displayed **Windows protected your PC** / **Unknown publisher** and allowed continuation through **More info -> Run anyway**;
- NSIS installed to `%LOCALAPPDATA%\The Safex Mine`;
- installation completed successfully;
- Microsoft Defender quarantined the downloaded installer as `Trojan:Win32/Bearfoos.A!ml`;
- Microsoft Defender quarantined the packaged XMRig backend as `Trojan:Win64/HashvaultMiner.A`;
- restoring both expected files and excluding only `%LOCALAPPDATA%\The Safex Mine` allowed the installed miner to run normally;
- no helper or WinRing quarantine was observed in this test.
- first installed launch presented Mining Risk Acknowledgement v1.0 as intended;
- Start Mining produced UAC specifically for `safex-mine-helper.exe`;
- Stop -> Start in the same app session reused the already elevated helper without a second UAC prompt.

Uninstall subsequently completed without UAC and removed `%LOCALAPPDATA%\The Safex Mine`; the manually created Defender exclusion remained and must be removed separately by the user.

### Packaged path validation

The release configuration maps the helper, XMRig and WinRing driver into the installed `runtime/` resource directory. The clean-machine installed build successfully launched the packaged helper and mined with the packaged XMRig backend without any source-tree development files.

The NSIS package contains:

- `runtime/safex-mine-helper.exe`;
- `runtime/safex-xmrig-x86_64-pc-windows-msvc.exe`;
- `runtime/WinRing0x64.sys`;
- bundled licence/notices;
- scene/branding/audio assets.

WinRing/MSR success and blocked-MSR degraded behaviour were also exercised during development on different Windows systems.

### Antivirus / SmartScreen

The release contains components that antivirus/endpoint-security products commonly classify or quarantine: the CPU-mining backend, elevated helper and WinRing driver. Treat AV intervention as an expected release scenario that must be tested and documented rather than as an exceptional user error.

Observed with Microsoft Defender on the clean test machine:

- SmartScreen blocked first execution until **More info -> Run anyway** was selected;
- the installer reported **Unknown publisher**;
- the installed path was `%LOCALAPPDATA%\The Safex Mine`;
- Defender quarantined the downloaded installer as `Trojan:Win32/Bearfoos.A!ml`;
- Defender quarantined the installed XMRig backend as `Trojan:Win64/HashvaultMiner.A`;
- restoring the two expected files and excluding only the installation folder allowed mining to run normally;
- disabling Defender real-time protection was **not** required.
- a subsequent manual Defender **Full scan** left the restored runtime intact while the narrow install-folder exclusion remained in place.

Release documentation requirements:

- the application does not disable antivirus, change antivirus settings or create exclusions itself;
- a manual Microsoft Defender Full scan completed with the narrow `%LOCALAPPDATA%\The Safex Mine` exclusion in place and did not re-detect or remove the restored runtime;
- temporary real-time-scanning suspension remains a documented fallback only for products that cannot complete the verified restore/exclusion flow;
- the six captured clean-machine screenshots are included in `docs/WINDOWS_INSTALLATION.md`.

User guidance must distinguish between an installer quarantined immediately after download and runtime files quarantined after installation. If the installer cannot be hashed while in quarantine, the user may need to restore/allow that specific installer first and then verify its SHA-256 **before executing it**. For runtime files, guidance should require confirmation that the detected filename/path matches an expected component, followed by checksum verification after restoration where a published component checksum is available. It should warn against broad exclusions such as Downloads, a user profile or an entire drive, and against leaving real-time protection disabled.

## 4. Functional release checklist

- [x] fresh development profile is blocked by Mining Risk Acknowledgement until accepted;
- [x] acknowledgement Exit action closes the development app without persisting acceptance;
- [x] acknowledgement version persists after acceptance and suppresses repeat display in development;
- [x] Risk notice control reopens the full acknowledgement after acceptance in development;
- [x] packaged/installed first-run acknowledgement appears and behaves correctly;
- [x] valid Safex address accepted;
- [ ] optional explicit invalid-address UI regression check before final tag;
- [x] changing to a different valid address while stopped resets the session (Blocks Found and Session demonstrated live; Rejected uses the same reset path);
- [x] default public daemon works;
- [ ] optional additional end-to-end custom/LAN daemon check (not a release blocker);
- [x] Calm = 40%;
- [x] Balanced = 70%;
- [x] Full Bore = 100%;
- [x] hashrate displayed;
- [x] thread count displayed;
- [x] session timer behaves across Stop -> Start;
- [x] Stop shuts XMRig down in the installed build;
- [x] Start after Stop reuses helper in the same installed app session without another UAC prompt;
- [x] daemon loss enters OFFLINE;
- [x] daemon reconnection resumes MINING;
- [x] helper crash cannot orphan XMRig;
- [x] accepted block increments once;
- [x] BLOCK FOUND scene appears;
- [x] block-found sound plays once when unmuted;
- [x] mute preference survives restart;
- [x] rejected-result parser/UI path increments and returns to mining in development/simulation; a naturally occurring live rejection remains optional evidence;
- [x] full app restart resets session counters.

## 5. Visual release checklist

- [ ] all five scene images load;
- [ ] scene crossfade does not move the fixed UI;
- [ ] no duplicate/baked-in Safex wordmark;
- [ ] Safex header wordmark is crisp;
- [ ] table reward objects are rectangular Safex Cash bars;
- [ ] no bars are visibly embedded in the ore wall;
- [ ] BLOCK FOUND miner holds a bar;
- [ ] OFFLINE pose clearly differs from READY;
- [ ] speaker icon correctly reflects mute state;
- [ ] Mining Risk Acknowledgement fits and scrolls correctly at supported window sizes in the packaged build;
- [ ] custom application icon appears correctly in the executable, taskbar, Start menu and NSIS installer surfaces;
- [ ] custom application icon remains recognisable at small Windows icon sizes;
- [ ] resizing does not crop critical scene content.

## 6. Privilege/security checklist

- [x] GUI starts non-elevated in the installed build;
- [x] acknowledgement Exit uses only the narrowly granted window-close capability;
- [x] UAC prompt is for `safex-mine-helper.exe`;
- [x] packaged helper launches from installed runtime resources;
- [x] packaged helper finds packaged XMRig beside it; WinRing is bundled at the same runtime path;
- [ ] denied UAC is handled cleanly;
- [x] MSR success path exercised during development;
- [x] MSR-blocked path degrades rather than preventing mining;
- [x] helper pipe remains local/authenticated;
- [x] Job Object assignment succeeds;
- [x] helper termination kills XMRig;
- [x] graceful Ctrl+C stop works;
- [x] no code disables antivirus/VBS automatically.

### Documentation screenshots

The tested Windows installation flow is documented in `docs/WINDOWS_INSTALLATION.md` using six clean-machine screenshots:

- SmartScreen initial warning;
- SmartScreen expanded details;
- NSIS install location;
- Defender installer detection;
- Defender XMRig detection;
- Windows Security route into the Exclusions controls.

The GitHub release page, Mining Risk Acknowledgement and helper UAC steps are documented textually and do not require screenshots for the current release guide.

### Licence/notices status

Mechanical checks confirm that the project GPL-3.0 file, GPL-3.0-only package metadata, `THIRD_PARTY_NOTICES.md`, and the exact WinRing0 redistribution notice are present and mapped into the release bundle. The locked Windows dependency graph has now been audited with zero missing licence metadata. The release build regenerates and bundles `THIRD_PARTY_LICENSES/DEPENDENCY_LICENSES.txt` from package-provided licence/notice files. `THIRD_PARTY_LICENSES/PACKAGE_ATTRIBUTIONS.md` supplies package-specific fallback attribution/source details for the small set of published crate archives without a root licence file, and exact-version source locations are documented for the MPL-2.0 components.

## 7. Release artefacts

Planned release set:

- one unsigned Windows NSIS `-setup.exe` installer;
- versioned release notes;
- SHA-256 checksum for that installer;
- source repository/tag;
- third-party notices/licence bundle;
- XMRig corresponding-source reference;
- known issues;
- troubleshooting link.

MSI is not part of the public release set.

## 8. Versioning

The first public release is **v1.0.0**.

The `0.1.0` installer and SHA-256 recorded earlier in this document are historical clean-machine validation artefacts only. The public v1.0.0 checksum must be generated from the exact final v1.0.0 installer after the release commit/tag is prepared.
