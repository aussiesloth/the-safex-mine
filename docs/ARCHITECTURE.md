# Architecture

## 1. Architectural principle

The project should separate **mining functionality** from **presentation**.

The mining backend, process manager, configuration layer and event parser should function independently of the visual mine scene.

This allows the project to:

- validate mining correctness before visual polish;
- keep the UI responsive;
- minimise performance impact;
- change the presentation system later without rewriting the mining core.

## 2. High-level structure

```text
The Safex Mine
│
├── Desktop Application
│   ├── first-run setup
│   ├── settings
│   ├── Start / Stop
│   ├── mining-mode selection
│   ├── statistics
│   ├── logs / diagnostics
│   └── update / release handling
│
├── Mining Orchestration
│   ├── XMRig process lifecycle
│   ├── generated configuration
│   ├── node/RPC selection
│   ├── thread / CPU profile selection
│   ├── MSR privilege workflow
│   └── crash / restart detection
│
├── Event Layer
│   ├── backend output parser
│   ├── hashrate events
│   ├── accepted-block events
│   ├── reject/stale events
│   ├── connection events
│   └── backend error events
│
└── Presentation Layer
    ├── static scene-state renderer
    ├── crossfade transitions
    ├── reward-table nugget layer
    ├── lightweight FX layer
    └── fixed application UI
```

## 3. Mining backend boundary

The desktop application should treat the mining engine as an external worker process.

Responsibilities of the application:

- generate or validate mining configuration;
- launch the backend;
- capture stdout/stderr;
- interpret relevant events;
- stop the backend cleanly;
- detect unexpected termination;
- display errors in a useful form.

Responsibilities of the backend:

- actual hashing;
- node/RPC communication;
- share/block submission;
- low-level CPU optimisation;
- MSR-related mining behaviour where supported.

## 4. Event-driven UI

The application should not infer state from artwork.

Instead:

```text
backend output
    ↓
parser
    ↓
normalised application event
    ↓
session/state manager
    ↓
UI + scene response
```

Example:

```text
Backend reports accepted block
    ↓
BLOCK_ACCEPTED
    ↓
increment session accepted count
add reward-table nugget
switch scene to BLOCK_FOUND
run celebration FX
wait configured duration
return scene to MINING
```

## 5. Visual layering

A useful rendering order is:

```text
background mine scene
    ↓
state image / miner scene
    ↓
reward-table nugget layer
    ↓
temporary effects
    ↓
fixed application UI
    ↓
branding
```

The fixed UI should not move or crossfade when the visual state changes.

Only the scene layer should transition.

## 6. Crossfade behaviour

State transitions should use a short fade or crossfade to avoid abrupt image replacement.

The duration should be tuned experimentally. The first implementation should favour a subtle transition rather than a slow cinematic fade.

Potential initial target:

- 200–400 ms for ordinary state changes;
- slightly longer only if visually justified.

## 7. UI framework

The project may continue with the existing desktop-application framework decision, but the visual design no longer requires a heavy character-animation engine.

If a lightweight 2D renderer is already part of the project, it can still be used for:

- crossfades;
- nugget sprites;
- fireworks;
- sparkles;
- glow;
- dust.

The state system should not depend on any specific rendering library.

## 8. State ownership

The application state manager should be authoritative for:

- whether mining is running;
- which mining profile is active;
- whether the backend is connected;
- current session counters;
- current visual state;
- whether a transient celebration/rejection state is in progress.

The renderer should remain a consumer of that state.

## 9. Failure isolation

Visual failure must never stop mining.

Examples:

- missing fireworks asset;
- failed sparkle emitter;
- state image load error.

These should degrade gracefully while mining continues.

Mining-backend failure, by contrast, must be surfaced immediately because it affects the user's primary task.

## 10. Future animation compatibility

If full character animation is revisited later, it should plug into the existing event layer.

The mining core should not need to know whether `BLOCK_ACCEPTED` is represented by:

- a still image;
- a 5-second celebration animation;
- a 3D character;
- no visual character at all.

That separation is intentional.
