# Project Specification - Working Markdown Summary

**Baseline:** v1.1, 11 September 2026  
**Owner:** `aussiesloth`  
**Status:** Design baseline; implementation evidence still required

The authoritative formatted baseline is retained in `docs/source/The_Safex_Mine_Project_Specification_v1.1.docx`. This Markdown file is the GitHub-friendly working summary and should be updated whenever a settled design decision changes.

## 1. Product concept

The Safex Mine is a standalone Safex Cash solo miner with a 2D animated mine whose behaviour reflects real mining activity. A native XMRig-derived CPU process performs RandomSFX work. Tauri supervises the desktop application and sidecar; PixiJS is the preferred 2D renderer.

Accepted blocks are represented as genuine treasure. Rejected blocks are represented as pyrite/fool's gold. The presentation never invents a mining result.

## 2. First-run and normal-user experience

- First run asks only for a public Safex receiving address.
- The address is stored locally for future launches.
- Every launch begins stopped and requires **Start Mining**.
- **Stop Mining** stops mining without clearing the current visual session.
- Start after Stop in the same app run resumes the same reward display.
- Changing the mining address clears accepted/rejected rewards and counters before the new address is used.
- Closing/reopening the application starts a fresh visual session.
- Default node: `rpc.safex.org:17402`, daemon mode, TLS off.
- Custom LAN/node address is available only through Settings/Advanced Settings.
- A clearly visible **Mute** control is mandatory.

## 3. Mining backend

Candidate backend: Galicone's XMRig fork, pinned at:

`3a5617f99a858614dc0c5897fc44c1bdb2618cca`

The reported preceding change adds SFX solo-mining support and the pinned commit sets donation to 0%. These facts must be verified in the actual source/build before release.

The initial Windows proof may be optimized specifically for the Ryzen 9 5950X reference machine. The binary distributed with The Safex Mine must instead be a portable x86-64 build that relies on XMRig's runtime CPU detection rather than `-march=native` or equivalent host-specific tuning.

The GUI must launch the miner without a visible console but keep diagnostic logs accessible.

### Windows privilege model

RandomX MSR optimisation is a mandatory performance requirement for the Windows release.

The Tauri GUI itself must remain at normal user privilege. A narrowly scoped Windows helper should obtain elevation through UAC and launch/manage the bundled XMRig process with the privileges required for MSR optimisation.

The elevated helper should remain available throughout the current application run so that Stop -> Start and configuration-driven XMRig restarts do not repeatedly request elevation.

The helper must terminate when the application closes and must not expose arbitrary command or executable execution.

The application should verify successful MSR application and must not silently present a substantially degraded non-MSR mining state as normal operation.

## 4. Mining modes

- **Calm:** approximately 40% of XMRig's useful/optimal RandomX thread set.
- **Balanced:** approximately 70%; intended default.
- **Full Bore:** 100% initially, with one mining thread reserved only if testing shows that 100% materially harms animation/control responsiveness.

The animation tempo follows mode plus a smoothed actual-hashrate signal. Do not directly map raw H/s to pick-swing frequency.

CPU temperature monitoring is outside v1. Documentation should recommend adequate cooling and advise against laptop mining.

## 5. Failure states

If the selected node becomes unavailable or XMRig exits unexpectedly, the on-screen miner walks back to the reward area and sits in a chair while a clear status message explains the condition.

The graphical state must never imply active mining when the backend is stopped or disconnected.

Normal application exit stops the sidecar. V1 does not mine invisibly in the background.

## 6. Accepted, rejected and burst outcomes

### Accepted

- Count the result immediately.
- Assign its cosmetic treasure before animation.
- Play the reveal/celebration/delivery sequence.
- Display block metadata only when actually available from the backend.

### Rejected

- Count the reject separately.
- Show a pyrite/fool's-gold dud.
- Never include it in accepted reward/SFX totals.
- Randomized cosmetic wording may use: Fool's Gold!, Pyrite!, Claim Lost!, Too Late!, Stale Find!, Another Miner Beat You!, False Strike!.
- Cosmetic wording never substitutes for a technical backend reason.

### Consecutive accepted blocks

Celebrations are interruptible and expandable rather than queued as complete clips:

- x1: normal celebration
- x2: DOUBLE STRIKE!
- x3: TRIPLE STRIKE!
- x4+: MOTHER LODE!

A new accepted block may merge into a celebration during reveal, celebration, delivery or return-to-work. Accounting always occurs immediately.

## 7. Session-only rewards

The treasure display is not a wallet, trophy database or historical blockchain view.

- It exists only for the current application run.
- Stop -> Start preserves it.
- Temporary backend/node failure preserves it.
- Address change clears it.
- Application close/reopen clears it.
- No historical-block import or wallet-balance tracking is required.

High block counts should be visually consolidated while the exact numerical count remains authoritative. A candidate rule is one bullion bar per 100 accepted blocks plus smaller remainder treasures.

## 8. API/event layer

Before patching XMRig, capture the existing console and local API during a genuine accepted Safex block. Investigate whether accepted/rejected result counters and identifiers are sufficient.

If polling cannot reliably preserve identity, ordering or burst outcomes, add the smallest possible structured event mechanism to the `safex-xmrig` backend.

Backend state and animation/presentation state remain orthogonal.

## 9. Privacy

The app is intended to collect no analytics, telemetry, usage statistics or personal information.

- Hashrate and runtime status are local display information.
- The app never requests wallet private keys, seeds or passwords.
- Default network traffic is the connection to the selected Safex daemon.
- Diagnostic sharing must be deliberate and user-controlled.

## 10. Licensing and repository boundary

- `aussiesloth/safex-xmrig`: separate GPL-3.0-or-later XMRig-derived backend.
- `aussiesloth/the-safex-mine`: GUI/controller/assets/installer; MIT is the leading licence candidate but final selection waits for an integration review.

Early community builds may be unsigned. Publish source provenance, build details and checksums. GitHub provenance/attestations should be used where practical. Safex Foundation signing may be investigated for a stable release candidate if available.

## 11. Open decisions

- Final art style: old-school pixel/8-bit vs smoother modern 2D.
- Final sound palette and mute behaviour details.
- Exact minimum CPU requirement (likely 4-to-6-plus-core range, pending testing).
- Full Bore 100% versus one-thread-reserved behaviour.
- Treasure-consolidation thresholds/artwork.
- Celebration timing, streak extension limit and mixed accept/reject choreography.
- Final GUI licence and installer/signing path.
