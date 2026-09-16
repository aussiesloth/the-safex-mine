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

## 3. Areas still requiring release validation

### Real rejection case

The rejection UI/parser path has been exercised through development/simulation, but a naturally occurring real rejected Safex result has not yet been relied upon as the primary validation case.

If practical, capture and retain a real rejection example before v1.0.

### Clean-machine installer test

Still required:

- fresh Windows machine or VM;
- no development toolchain;
- install;
- first run;
- UAC helper launch;
- mining;
- Stop/restart;
- uninstall.

### Packaged path test

The release configuration now maps the helper, XMRig and WinRing driver into the installed `runtime/` resource directory. Release validation must prove that the generated installer actually preserves that layout and that the installed app finds:

- `runtime/safex-mine-helper.exe`;
- `runtime/safex-xmrig-x86_64-pc-windows-msvc.exe`;
- `runtime/WinRing0x64.sys`;
- bundled licence/notices;
- scene/branding/audio assets.

The installed app must not depend on source-tree development paths.

### Antivirus / SmartScreen

Test the actual unsigned release artefacts and document observed behaviour.

Do not write generic bypass instructions in advance of real release testing.

## 4. Functional release checklist

- [ ] valid address accepted;
- [ ] invalid address rejected;
- [ ] changing saved address while stopped resets Blocks Found to 0;
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
- [ ] resizing does not crop critical scene content.

## 6. Privilege/security checklist

- [ ] GUI starts non-elevated;
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

- unsigned Windows installer/package;
- versioned release notes;
- SHA-256 checksum(s);
- source repository/tag;
- third-party notices/licence bundle;
- XMRig corresponding-source reference;
- known issues;
- troubleshooting link.

## 8. Versioning

Current project version is `0.1.0`.

Before the first public release, choose whether the release remains a preview (`0.x`) or is promoted to `1.0.0` after the release gates are satisfied.
