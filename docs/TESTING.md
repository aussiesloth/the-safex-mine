# Testing Strategy

## Milestone 0 - backend proof

### 0A: Pin and build
- Build the exact Galicone commit on the Windows Ryzen 9 5950X reference machine.
- Preserve the known-good XMRig 5.4.0 miner/configuration as a control.
- Record compiler, build options, source commit and binary checksum.

### 0B: Prove mining
- Connect to `rpc.safex.org:17402` with daemon mode and no TLS.
- Receive jobs and hash successfully.
- Obtain a genuine accepted Safex block.

### 0C: Capture and interpret
- Capture complete XMRig console logs.
- Poll/capture the local API around the accepted block.
- Independently confirm the block/reward.
- Determine the exact accepted-event semantics.

### 0D: Select event interface
- Use the existing API if it is reliable.
- Otherwise implement the smallest structured event patch required.

## Windows privilege and MSR tests

Verify on supported Windows systems that:

- The Safex Mine GUI launches without administrator privileges.
- Pressing Start Mining can elevate the mining helper through the normal Windows UAC flow.
- XMRig launches with sufficient privileges to apply RandomX MSR optimisation.
- Successful MSR application can be positively detected rather than assumed.
- Failure to apply MSR is clearly reported to the user.
- Stop -> Start within the same application run does not require another UAC prompt.
- Changing node configuration can restart XMRig through the existing elevated helper.
- Changing the mining address can restart XMRig through the existing elevated helper while clearing the visual reward session.
- Closing The Safex Mine terminates XMRig and the elevated helper.
- The helper cannot be used to launch arbitrary programs or arbitrary shell commands.
- No duplicate elevated helper or XMRig process is created after crashes, restarts or repeated Start/Stop operations.
-
- ## Controller tests

- First-run address entry and validation.
- Address remembered across app launches.
- App always launches stopped.
- Start/Stop lifecycle.
- Stop -> Start preserves current-session rewards.
- Address change clears the reward display.
- Custom node support.
- Node unavailable state.
- XMRig crash/restart handling.
- No duplicate sidecar process.

## Animation tests

Use a developer-only simulator that feeds the same normalized event contract as live mining but cannot alter real mining totals.

Test:
- candidate;
- accepted;
- rejected;
- x2/x3/x4+ accepted streaks;
- accepted during reject reaction;
- reject during accepted celebration;
- node disconnect/reconnect;
- high-volume accelerated runs (1,000+ accepted events);
- reward consolidation.

A genuine real-world reject is not required to build the reject animation. When one occurs, capture it and turn it into a regression fixture.

## Resource tests

Measure:
- hashrate with and without scene rendering;
- frame pacing and control responsiveness;
- Calm / Balanced / Full Bore behaviour;
- Full Bore at 100% versus one reserved mining thread;
- systems without large-page privilege;
- integrated versus discrete GPUs where available.

## Community hardware matrix

When the basic controller is stable, test across a deliberately varied set of machines:

- AMD and Intel CPUs;
- older and newer x86-64 generations;
- 4/6-core, 8-core, 12-16+ core systems;
- Windows 10/11 where practical;
- integrated and discrete graphics;
- default public RPC and local LAN node.

The intended community testers include Galicone and other Safex community members if they are willing to participate.
