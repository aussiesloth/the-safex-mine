# Roadmap

This roadmap describes order, not delivery dates.

## Phase 0 - Backend validation
- Fork/pin Galicone XMRig backend in `aussiesloth/safex-xmrig`.
- Reproduce a Windows build on Bertha.
- Prove a real accepted Safex block at the default endpoint.
- Capture console/API evidence.
- Decide whether a backend reporting patch is needed.

## Phase 1 - Basic desktop controller
- Create Tauri application shell.
- Add first-run public address setup.
- Remember address locally.
- Add default node and advanced custom-node setting.
- Add Start Mining / Stop Mining / status / hashrate / block counts.
- Add Calm / Balanced / Full Bore presets.
- Add Mute control placeholder.

## Phase 2 - Animated mine
- Integrate PixiJS.
- Implement working loops and mode-linked tempo.
- Implement accepted/rejected animations.
- Implement chair/failure states.
- Implement consecutive-block streak state machine.
- Add developer event simulator.

## Phase 3 - Art/audio and high-volume behaviour
- Compare pixel/8-bit and smoother 2D art directions.
- Select final visual style.
- Design sound palette.
- Implement treasure consolidation for large sessions.
- Stress-test hundreds/thousands of results.

## Phase 4 - Community testing
- Test multiple AMD/Intel generations and core counts.
- Validate default RPC and local-node paths.
- Confirm distributed XMRig build portability.
- Capture real rejected block when naturally encountered.

## Phase 5 - Release preparation
- Final licensing review.
- Select GUI licence.
- Asset licence audit.
- Installer/update design.
- Checksums, build provenance and GitHub attestations where practical.
- Consider Safex Foundation signing for a stable release candidate if available.
- Linux parity/release work.
