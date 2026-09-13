# Product Specification

## 1. Product summary

**The Safex Mine** is a Windows desktop application that makes Safex Cash solo mining accessible through a graphical interface.

The application is not intended to replace the underlying mining engine. It provides the orchestration, configuration, event handling, statistics, user experience and visual presentation around a Safex-compatible XMRig backend.

The initial public release should prioritise:

1. correct mining behaviour;
2. predictable Windows privilege handling;
3. simple configuration;
4. useful status and statistics;
5. a polished state-driven visual experience;
6. straightforward packaging and installation.

Continuous full-character animation is outside the current release scope.

## 2. Target user

The target user is someone who wants to solo mine Safex Cash on a Windows PC without manually maintaining command-line arguments, configuration files or mining-process lifecycle details.

The application should remain useful to experienced miners while being approachable to users who have never launched XMRig directly.

## 3. In-scope features

### 3.1 First-run setup

On first launch, the application should request at least:

- Safex Cash mining address;
- confirmation of the default public node/RPC or selection of a custom node;
- preferred initial mining mode.

Optional advanced settings should not block first use.

### 3.2 Node configuration

The application should support:

- a project-defined default public RPC/node;
- custom remote node configuration;
- LAN node configuration.

Connection status must be visible to the user.

### 3.3 Mining control

The application must provide:

- Start Mining;
- Stop Mining;
- Calm mode;
- Balanced mode;
- Full Bore mode.

Changing mode should update the mining backend cleanly without corrupting the current session state.

### 3.4 Mining statistics

At minimum, the UI should expose:

- current mining state;
- current mode;
- current hashrate;
- backend/node connection state;
- accepted blocks found during the session;
- rejected/stale results during the session;
- elapsed mining/session time where practical;
- useful backend error information when mining fails.

Additional useful metrics can be added after the core behaviour is stable.

### 3.5 Event feedback

Important backend events should be converted into user-facing application events.

Examples:

- mining started;
- mining stopped;
- hashrate updated;
- accepted block;
- rejected or stale result;
- connection lost;
- connection restored;
- backend exited unexpectedly;
- configuration error.

### 3.6 Visual presentation

The visual layer uses authored still-state scenes with crossfades.

Required v1 states:

- READY / STOPPED;
- MINING;
- BLOCK FOUND;
- REJECTED;
- OFFLINE / ERROR.

The application may add lightweight effects such as:

- fireworks;
- sparkles;
- nugget glow;
- subtle dust;
- subtle lantern or headlamp effects.

These effects must not materially reduce CPU mining performance.

### 3.7 Reward-table progression

Accepted blocks should be represented visually by nuggets appearing on the reward table.

The initial implementation should be simple and robust. Possible approaches include:

- one nugget sprite per accepted block up to a practical visual limit;
- staged pile levels;
- a hybrid system where individual nuggets accumulate initially and then collapse into larger pile states.

The visual representation does not need to map to actual reward value.

### 3.8 Rejected-result presentation

Rejected events should not add anything to the reward table.

The rejection state may use randomised messages such as:

- Fool's Gold
- Pyrite!
- Claim Lost
- Too Late
- Stale Find
- Another Miner Beat You
- False Strike

The exact message shown should reflect the backend result where that distinction can be determined reliably.

## 4. Session rules

Current decisions:

- Stop → Start continues the current session.
- The reward table is not cleared by Stop.
- Changing the mining address clears the current visual treasure/session state.
- Accepted and rejected event counters remain logically separate.
- Persistence across a full application restart is not yet specified and should be decided before release.

## 5. Performance modes

Initial target profiles:

### Calm

Approximately 40% CPU allocation.

Purpose:

- background mining;
- lower heat and noise;
- better responsiveness for simultaneous desktop use.

### Balanced

Approximately 70% CPU allocation.

Purpose:

- strong mining performance;
- reasonable desktop responsiveness;
- likely default mode.

### Full Bore

Highest practical CPU allocation.

Current design intent is to reserve enough capacity for Windows and the application rather than blindly consuming every logical processor. The exact strategy must be benchmarked across several systems.

## 6. Windows MSR requirement

MSR optimisation is a required part of the intended Windows performance profile.

The GUI itself should not run elevated.

The application should request elevation only for the mining backend or a narrow helper process that needs it.

Failure to obtain the required optimisation should be surfaced clearly rather than silently ignored.

## 7. Out of scope for v1

The following are not required for the initial release:

- full skeletal character animation;
- continuous mining-swing animation;
- walking animations;
- animated transitions between chair, rock face and reward table;
- front/side/seated rig systems;
- complex particle simulations;
- multiple animated celebration sequences;
- a general-purpose mining-pool client;
- non-Windows GUI releases.

These may be reconsidered later based on demand.

## 8. Release principle

The initial public release should be judged primarily on:

- reliability;
- ease of use;
- predictable performance;
- clarity of status;
- visual polish without unnecessary complexity.

The state-driven visual system exists to make the application distinctive and enjoyable, not to compete with the mining workload.
