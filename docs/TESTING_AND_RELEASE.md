# Testing and Release

## 1. Release philosophy

The Safex Mine should not be released merely because the UI works on the development machine.

The release candidate should be tested as a complete Windows application:

- installation;
- first run;
- UAC/MSR workflow;
- backend launch;
- mining;
- block detection;
- rejects;
- Stop/Start;
- node loss;
- crashes;
- uninstall.

## 2. Test categories

### 2.1 Functional mining tests

Verify:

- valid address starts mining;
- default node works;
- custom node works;
- LAN node works;
- hashrate is displayed;
- Calm/Balanced/Full Bore apply the expected CPU profile;
- Stop halts mining;
- Start after Stop resumes the same session.

### 2.2 Accepted-block parser tests

Use captured real backend output from actual accepted Safex solo-mining events.

Verify:

- accepted event detected once;
- no duplicate count;
- session count increments;
- nugget table increments;
- BLOCK_FOUND state appears;
- celebration ends correctly.

### 2.3 Rejection parser tests

Use captured real output where possible.

Verify:

- reject/stale event detected;
- rejection count increments;
- no nugget added;
- correct rejection visual/message;
- return to mining.

### 2.4 Connection tests

Simulate:

- node unavailable at launch;
- node drops while mining;
- node returns;
- LAN node goes offline;
- wrong endpoint.

The UI must distinguish backend-running from mining-operational.

### 2.5 Backend failure tests

Test:

- missing executable;
- backend crash;
- invalid arguments;
- non-zero exit code;
- forced termination.

### 2.6 MSR/elevation tests

Test:

- UAC accepted;
- UAC denied;
- required operation succeeds;
- required operation fails;
- GUI remains non-elevated;
- repeat Start/Stop does not cause broken privilege state.

### 2.7 Session tests

Verify:

- Stop → Start retains session treasure;
- Stop does not clear accepted count;
- rejected count remains separate;
- address change clears visual treasure/session reward state;
- queued accepted events are not lost.

Persistence across application restarts must be tested once that policy is decided.

### 2.8 Visual tests

Verify:

- state scenes align during crossfade;
- UI remains stationary;
- no flicker when switching scenes;
- fireworks/sparkles do not obscure controls;
- nugget pile stays within table bounds;
- visual FX do not materially reduce mining hashrate.

## 3. Performance testing

Benchmark the mining backend with:

- UI closed/not rendering, where technically comparable;
- normal MINING scene;
- celebration effects active.

The visual layer should have negligible practical effect on hashrate.

## 4. Hardware coverage

Test on more than one CPU class before release.

At minimum, aim for:

- high-core-count desktop Ryzen;
- mainstream desktop CPU;
- modern laptop CPU.

The mining-mode calculation should be validated across differing logical-processor counts.

## 5. Clean-machine testing

Before public release, test on a Windows machine or VM that does not contain the development toolchain.

This catches:

- missing runtime dependencies;
- path assumptions;
- packaging mistakes;
- permissions issues.

## 6. Release artefacts

Recommended release outputs:

- Windows installer;
- versioned release notes;
- SHA-256 checksum;
- bundled third-party notices/licences;
- known-issues section if necessary.

## 7. Versioning

Use consistent semantic-style versioning.

Example:

```text
v0.x   development / preview
v1.0   first stable public release
v1.x   bug fixes and incremental features
v2.x   major feature expansion if warranted
```

Full animation does not need to define v2. It should only be added if it remains desirable.

## 8. Release gate

A public v1.0 should not ship until:

- mining backend is stable;
- MSR workflow is stable;
- accepted-block detection is proven;
- connection failure is handled cleanly;
- settings survive ordinary use;
- installer works on a clean system;
- required licences/attribution are present;
- branding permission is resolved;
- visual state system is polished enough to represent the project professionally.
