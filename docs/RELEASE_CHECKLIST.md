# Release Checklist

This is a pre-release checklist for future community builds. It is intentionally conservative.

## Backend provenance
- [ ] Exact `safex-xmrig` source commit recorded.
- [ ] Corresponding source available publicly to recipients of the binary.
- [ ] XMRig/Galicone notices and GPL licence preserved.
- [ ] Build toolchain/options recorded.
- [ ] Binary checksum published.
- [ ] Donation setting verified as 0%.

## GUI
- [ ] Version/commit recorded.
- [ ] Final GUI licence present and reviewed.
- [ ] Third-party dependency/asset licences reviewed.
- [ ] No private keys/seeds/passwords requested anywhere.
- [ ] No analytics/telemetry endpoints present.
- [ ] Start Mining is mandatory after launch.
- [ ] Stop Mining is clearly available.
- [ ] Normal exit stops XMRig.

## Functionality
- [ ] Default `rpc.safex.org:17402` path works.
- [ ] Custom-node path works.
- [ ] Accepted block detected and displayed correctly.
- [ ] Rejected-event logic tested in simulation and, if available, against real captured evidence.
- [ ] Consecutive-block streak handling tested.
- [ ] Address change clears session rewards.
- [ ] High-volume session remains responsive.
- [ ] Full Bore behaviour tested on multiple systems.

## Packaging / trust
- [ ] Checksums published.
- [ ] Build provenance/attestation generated where practical.
- [ ] Miner/antivirus warning documented honestly.
- [ ] Unsigned status clearly stated if applicable.
- [ ] Signing evaluated for stable releases when appropriate.
