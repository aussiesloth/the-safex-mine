# The Safex Mine

**The Safex Mine** is a Windows desktop solo-mining application for **Safex Cash (SFX)**.

Its goal is simple: make Safex Cash CPU solo mining easy to configure, easy to start, and easy to understand without requiring users to work directly with command-line mining software.

The application wraps a Safex-compatible XMRig backend in a graphical Windows interface, manages the mining configuration, exposes practical performance modes, and presents mining activity through a themed mine scene.

## Project direction

The current release target uses a **state-driven visual presentation** rather than continuous character animation.

The miner changes between a small number of authored visual states:

- **Ready / Stopped** — the miner is seated in his chair.
- **Mining** — the miner is working the rock face with pickaxe in hand.
- **Block Found** — the miner celebrates while holding up a nugget.
- **Rejected Result** — the miner tosses fool's gold toward the scrap heap.
- **Offline / Error** — the application clearly indicates that mining is unavailable or interrupted.

State changes use **fade or crossfade transitions**. Small GPU-driven effects such as sparkles or fireworks may appear during important events, but the application does not require a constantly animated character.

Found blocks are also represented visually by **nuggets accumulating on the reward table** during the current mining session.

A fully animated miner remains a possible future enhancement, but it is **not part of the current release scope**.

## Core goals

The Safex Mine is intended to provide:

- a straightforward Windows solo-mining experience;
- first-run wallet address setup;
- default public Safex node/RPC configuration;
- optional custom or LAN node configuration;
- Start and Stop controls;
- Calm, Balanced and Full Bore mining profiles;
- clear hashrate, connection and session statistics;
- accepted-block and rejected-result event handling;
- required Windows MSR optimisation without requiring the entire GUI to run as Administrator;
- useful logs and diagnostics;
- a polished, recognisable Safex-themed interface.

## Mining modes

The initial performance-mode targets are:

| Mode | Intended behaviour |
|---|---|
| **Calm** | Approximately 40% CPU allocation |
| **Balanced** | Approximately 70% CPU allocation |
| **Full Bore** | Maximum practical mining allocation while reserving enough system capacity for Windows and the application |

Exact thread counts should be derived at runtime for the user's CPU and validated during development.

## Visual feedback

The application scene is designed to make mining status understandable at a glance.

### Before mining starts

The miner sits in his chair and waits.

### While mining

The miner is shown at the rock face with the pickaxe.

### When a block is found

The scene crossfades to the celebration state. The miner holds up a gold nugget and lightweight celebratory effects can play for roughly five to six seconds before the scene returns to mining.

The session's reward table is updated to show the new find.

### When a result is rejected

The scene crossfades to a rejection state in which the miner tosses a fool's-gold piece toward the scrap heap. A short rejection message is shown before returning to the mining state.

### When mining becomes unavailable

Connection loss, daemon/RPC failure, backend failure or another critical interruption should be shown clearly and must not be confused with an intentional stop.

## Session behaviour

Current design decisions:

- **Stop → Start continues the current session.**
- Changing the configured mining address **clears the current visual treasure/session reward display**.
- Accepted and rejected events are tracked separately.
- The exact persistence policy across full application restarts is still to be finalised.

## Windows privilege model

MSR optimisation is considered a **required performance feature** for the Windows build.

The intended privilege model is:

- the desktop GUI runs normally as a standard user;
- only the mining backend or a narrowly scoped helper is elevated when required for MSR setup;
- the whole graphical application should not need to run as Administrator.

See [`docs/SECURITY_AND_PRIVILEGE_MODEL.md`](docs/SECURITY_AND_PRIVILEGE_MODEL.md).

## Repository documentation

- [Product Specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Visual State System](docs/VISUAL_STATE_SYSTEM.md)
- [Mining Engine Integration](docs/MINING_ENGINE_INTEGRATION.md)
- [Configuration and First Run](docs/CONFIGURATION_AND_FIRST_RUN.md)
- [Session and Event Model](docs/SESSION_AND_EVENT_MODEL.md)
- [Asset Plan](docs/ASSET_PLAN.md)
- [Security and Privilege Model](docs/SECURITY_AND_PRIVILEGE_MODEL.md)
- [Testing and Release](docs/TESTING_AND_RELEASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Branding](docs/BRANDING.md)
- [GitHub Repository Setup](docs/GITHUB_REPO_SETUP.md)

## Status

The project is under active development.

The current priority is to complete and validate the functional Windows solo-mining application first, then add the state-driven visual layer and release polish.

## Licensing and attribution

Licensing, third-party notices and upstream attribution must be finalised before public release. The mining backend is based on Safex-compatible XMRig work and must retain all notices required by its upstream licences.

No branding asset should be distributed without the necessary permission from its owner.
