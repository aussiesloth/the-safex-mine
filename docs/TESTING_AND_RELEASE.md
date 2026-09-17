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

Packaged-build validation is still required to confirm the same behaviour after installation.

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

Successful bundle generation does not by itself validate the installed resource paths, antivirus behaviour or clean-machine experience; those checks remain outstanding.

## 3. Areas still requiring release validation

### Mining Risk Acknowledgement — packaged build

Confirm in the installed release build that:

- a fresh application profile shows **Mining Risk Acknowledgement — Version 1.0** before the mining interface can be used;
- the acknowledgement text is scrollable and readable at supported window sizes;
- **Acknowledge and Continue** remains disabled until the checkbox is selected;
- **Exit** closes the installed application without recording acceptance;
- accepting the notice stores `safex-mine.mining-risk-acknowledgement-version=1.0` locally;
- reopening the installed application after acceptance does not show the first-run gate again;
- changing/removing the stored acknowledgement version causes the gate to appear again;
- the **Risk notice** control reopens the complete acknowledgement after acceptance;
- reviewing the acknowledgement later does not alter mining/session state;
- the acknowledgement does not replace or modify the GPL-3.0 licence presentation.

### Real rejection case

The rejection UI/parser path has been exercised through development/simulation, but a naturally occurring real rejected Safex result has not yet been relied upon as the primary validation case.

If practical, capture and retain a real rejection example before v1.0.

### Clean-machine installer test

Still required:

- fresh Windows machine or VM;
- no development toolchain;
- install the NSIS `-setup.exe`;
- first run;
- Mining Risk Acknowledgement;
- UAC helper launch;
- mining;
- Stop/restart;
- uninstall.

### Packaged path test

The release configuration now maps the helper, XMRig and WinRing driver into the installed `runtime/` resource directory. Release validation must prove that the generated NSIS installer actually preserves that layout and that the installed app finds:

- `runtime/safex-mine-helper.exe`;
- `runtime/safex-xmrig-x86_64-pc-windows-msvc.exe`;
- `runtime/WinRing0x64.sys`;
- bundled licence/notices;
- scene/branding/audio assets.

The installed app must not depend on source-tree development paths.

### Antivirus / SmartScreen

The release contains components that antivirus/endpoint-security products commonly classify or quarantine: the CPU-mining backend, elevated helper and WinRing driver. Treat AV intervention as an expected release scenario that must be tested and documented rather than as an exceptional user error.

For the actual unsigned NSIS release installer:

- record whether the installer is blocked before launch;
- record the exact SmartScreen flow presented;
- record which packaged files, if any, are quarantined or removed by Microsoft Defender and any other products used during release testing;
- verify that restoring an expected runtime file and applying a narrowly scoped installation/runtime-folder exclusion allows the verified release to operate;
- verify the application never disables antivirus, changes antivirus settings or creates exclusions itself;
- document the exact installed path users should exclude only after the final installer path has been validated;
- test the pre-install exclusion workflow;
- test the fallback workflow where real-time scanning is paused only long enough to install the verified artefact, create the narrow installation-folder exclusion and re-enable protection.

User guidance must distinguish between an installer quarantined immediately after download and runtime files quarantined after installation. If the installer cannot be hashed while in quarantine, the user may need to restore/allow that specific installer first and then verify its SHA-256 **before executing it**. For runtime files, guidance should require confirmation that the detected filename/path matches an expected component, followed by checksum verification after restoration where a published component checksum is available. It should warn against broad exclusions such as Downloads, a user profile or an entire drive, and against leaving real-time protection disabled.

## 4. Functional release checklist

- [x] fresh development profile is blocked by Mining Risk Acknowledgement until accepted;
- [x] acknowledgement Exit action closes the development app without persisting acceptance;
- [x] acknowledgement version persists after acceptance and suppresses repeat display in development;
- [x] Risk notice control reopens the full acknowledgement after acceptance in development;
- [ ] repeat the acknowledgement checks in the packaged/installed build;
- [ ] valid address accepted;
- [ ] invalid address rejected;
- [ ] changing saved address while stopped resets Blocks Found, Rejected and accumulated mining time to 0;
- [ ] default daemon works;
- [ ] custom/LAN daemon works;
- [ ] Calm = 40%;
- [ ] Balanced = 70%;
- [ ] Full Bore = 100%;
- [ ] hashrate displayed;
- [ ] thread count displayed;
- [ ] session timer behaves across Stop -> Start;
- [ ] Stop shuts XMRig down;
- [ ] Start after Stop reuses helper;
- [ ] daemon loss enters OFFLINE;
- [ ] daemon reconnection resumes MINING;
- [ ] helper crash cannot orphan XMRig;
- [ ] accepted block increments once;
- [ ] BLOCK FOUND scene appears;
- [ ] block-found sound plays once when unmuted;
- [ ] mute preference survives restart;
- [ ] rejected result increments/returns to mining;
- [ ] full app restart resets session counters.

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

- [ ] GUI starts non-elevated;
- [ ] acknowledgement Exit uses only the narrowly granted window-close capability;
- [ ] UAC prompt is for helper;
- [ ] packaged helper launches from installed runtime resources;
- [ ] packaged helper finds XMRig and WinRing beside it;
- [ ] denied UAC is handled cleanly;
- [ ] MSR success is reported correctly;
- [ ] MSR failure degrades rather than lying about success;
- [ ] helper pipe remains local/authenticated;
- [ ] Job Object assignment succeeds;
- [ ] helper termination kills XMRig;
- [ ] graceful Ctrl+C stop works;
- [ ] no code disables antivirus/VBS automatically.

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

Current project version is `0.1.0`.

Before the first public release, choose whether the release remains a preview (`0.x`) or is promoted to `1.0.0` after the release gates are satisfied.
