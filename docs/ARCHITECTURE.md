# Architecture

## High-level model

```text
Safex daemon / node
        ^
        | JSON-RPC / daemon mining
        |
elevated safex-xmrig process
        ^
        | controlled by
        |
elevated SafexMineHelper
        ^
        | narrow privileged command interface
        |
Tauri controller / MiningService
normal user privilege
        |
        +--> current-session state
        |
        +--> HTML/CSS controls and settings
        |
        +--> PixiJS GameScene

Tauri controller <---- localhost API/events ---- safex-xmrig
```

## Responsibility boundaries

### Safex daemon
- Supplies work and accepts/rejects submitted candidates.
- Is the authority for mining outcomes.

### `safex-xmrig`
- Performs RandomSFX CPU mining.
- Connects to the selected daemon.
- Reports process state, hashrate and result information.
- Lives in its own GPL-3.0-or-later repository and executable.

### SafexMineHelper

- Runs elevated on Windows after user approval through UAC.
- Starts, stops and restarts the bundled XMRig backend with the required privileges for MSR optimisation.
- Accepts only tightly controlled mining-process operations.
- Does not expose arbitrary command execution or arbitrary executable paths.
- Remains available during the current application run so Stop -> Start does not require repeated elevation.
- Exits when The Safex Mine closes.

### MiningService / adapter
- Launches/stops the sidecar.
- Applies address, node and mining-mode configuration.
- Normalizes mining events.
- Deduplicates results and preserves ordering.
- Never creates a reward from animation state.

### Current-session state
- Holds accepted/rejected counts and assigned visual rewards only for the current app run.
- Survives Stop -> Start and temporary sidecar/node interruption within the same run.
- Clears on application restart or receiving-address change.
- Is not a wallet, persistent reward ledger or blockchain index.

### GameScene
- Renders normal mining, failure states, reward/reject sequences and streak celebrations.
- Receives normalized events only after the underlying outcome is recognized.
- Never modifies mining totals.

## Process rules

- One application instance must not accidentally launch multiple XMRig sidecars.
- Normal application exit stops the sidecar.
- XMRig should run without a visible console in production; logs remain available for diagnostics.
- Local API endpoints bind to loopback only.
- Do not allow renderer/web content to provide arbitrary executable paths or shell arguments.
  The main Tauri GUI runs with normal user privileges.
- XMRig must run with sufficient Windows privileges for RandomX MSR optimisation.
- Elevation is isolated to the helper/backend boundary rather than the whole GUI.
- One application instance must not accidentally launch multiple helpers or XMRig processes.
- Stop -> Start within the same application run should reuse the already-elevated helper.
- Normal application exit stops XMRig and terminates the elevated helper.

## Animation state versus backend state

Backend state and presentation state are separate dimensions. For example, XMRig may still be hashing while the character is celebrating an accepted block. A `CELEBRATING` presentation state must never overwrite a `HASHING` backend state.

Events must remain ingestible during all animations.
