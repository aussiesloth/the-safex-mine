# The Safex Mine

**Status:** Pre-alpha / design and backend-validation phase  
**Owner:** `aussiesloth`  
**Primary target:** Windows x64, with Linux parity later

The Safex Mine is a standalone Safex Cash solo-mining application whose animated mine reflects real mining activity. A native CPU miner performs RandomSFX work while a GPU-rendered 2D scene shows a miner working a rock face. Accepted blocks become treasure; rejected blocks become fool's gold.

The governing rule is simple:

> **Mining events are authoritative. Animations adapt around them, never the other way around.**

## Current direction

- Desktop shell: **Tauri**
- 2D renderer: **PixiJS** (preferred; final confirmation still required)
- Mining backend: separate **Galicone/XMRig-derived** executable maintained in `aussiesloth/safex-xmrig`
- Algorithm: `rx/sfx`
- Default node: `rpc.safex.org:17402`
- Connection: daemon mode, no TLS on the default endpoint
- Mining address: public Safex receiving address supplied by the user
- GPU mining: disabled; the GPU is reserved for the animated interface

## Core v1 behaviour

- First run asks for the user's public Safex receiving address and remembers it locally.
- Every application launch starts **stopped**. Mining only begins after the user presses **Start Mining**.
- **Stop Mining** pauses the current visual session; a later Start resumes the same session.
- Changing the receiving address clears the current reward display so rewards for different addresses are never mixed.
- Closing and reopening the application starts with an empty reward display.
- The normal user does not need node configuration. Advanced Settings may specify a custom LAN/node address.
- Main-screen controls include **Start Mining**, **Stop Mining**, mining mode, node/status information, current hashrate and **Mute**.
- If XMRig stops or the node becomes unavailable, the animated miner returns to the reward area and sits in a chair while a clear status message is shown.

## Mining modes

The presets are based on XMRig's useful/optimal RandomX thread set rather than blindly on the OS-reported core count:

- **Calm:** ~40%
- **Balanced:** ~70%
- **Full Bore:** 100% initially; reserve one mining thread only if multi-machine testing shows it is needed for smooth controls/graphics

The character's working tempo follows the selected mode and a smoothed hashrate signal. Raw H/s is not mapped directly to pick swings.

## Reward presentation

- Accepted block -> genuine treasure item and celebration.
- Accepted messages are cosmetic and randomized from the agreed normal-block pool: **Strike!**, **Pay Dirt!**, **Treasure Found!**, **Gold!**, **Rich Vein!**, **Nice Find!**, **Block Found!**, **Claim Secured!**, **That One's Ours!**, **Good Strike!**, **Fresh Treasure!**, **We Hit Pay Dirt!**
- Context-specific accepted messages override the normal random pool where appropriate: the first accepted block of a session may use **First Strike!**; a further ordinary accepted block may use **Another One!**; consecutive accepted blocks use the streak messages **DOUBLE STRIKE!**, **TRIPLE STRIKE!**, and x4+ **MOTHER LODE!**
- Consecutive accepted blocks merge into an interruptible celebration streak rather than queueing full animations.
- Rejected block -> pyrite/fool's-gold animation and separate reject count.
- Rejection messages are cosmetic and randomized from the agreed pool: **Fool's Gold!**, **Pyrite!**, **Claim Lost!**, **Too Late!**, **Stale Find!**, **Another Miner Beat You!**, **False Strike!**
- High-volume sessions may visually consolidate rewards (for example, a bullion bar for each 100 accepted blocks) while the numerical count remains exact.

## Privacy

The Safex Mine is intended to collect **no analytics, telemetry, usage statistics or personal information**. Local runtime hashrate/status is displayed to the user but is not sent to the project maintainers. Normal network traffic is limited to the user's selected Safex node and any future explicitly user-initiated update/check mechanism.

The application never requests private keys, seed phrases or wallet passwords.

## Repository boundary

This repository contains the GUI/controller, artwork, sounds, settings, tests and installer work for The Safex Mine.

The mining backend lives separately in:

- `aussiesloth/safex-xmrig` - Galicone/XMRig-derived backend, GPL-3.0-or-later

Keeping the backend in a separate executable and repository is an intentional engineering and licensing boundary. Final GUI licensing will be confirmed before public distribution; MIT is the current leading candidate.

## Development order

1. Build and verify the exact pinned Galicone XMRig backend on the Windows 5950X reference machine.
2. Capture console/API behaviour through a real accepted Safex block.
3. Decide whether the existing XMRig API is sufficient or a minimal structured-event patch is required.
4. Build a basic Tauri controller with address, Start/Stop, status, hashrate and block counts.
5. Add the PixiJS mine scene and event-driven animation state machine.
6. Test community hardware, failure handling, high-volume sessions and Linux parity.
7. Package, review licensing, publish provenance/checksums and prepare community-test releases.

See [`docs/`](docs/) for the working project documents and [`docs/source/`](docs/source/) for the current Word specification.
