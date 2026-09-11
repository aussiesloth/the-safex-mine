# XMRig Backend Integration

## Source

The backend is maintained separately in `aussiesloth/safex-xmrig`, derived from Galicone's XMRig fork.

Pinned proof candidate:

`3a5617f99a858614dc0c5897fc44c1bdb2618cca`

## Default mining configuration

```text
algorithm: rx/sfx
node: rpc.safex.org:17402
daemon mode: enabled
TLS: off
user: public Safex receiving address
donation: 0% (must be verified on the built binary)
```

## First proof run

Do not begin by optimizing everything. First prove:

1. exact pinned source/build identity;
2. connection to the default node;
3. receipt of Safex jobs;
4. sensible hashrate;
5. candidate submission;
6. a genuine accepted Safex block;
7. independent confirmation of the result;
8. captured console/API behaviour around the event.

The user's known-good XMRig 5.4.0 rig remains the reference control during this work.

## Build distinction

### Reference build on Bertha

A 5950X-specific performance build is acceptable for Milestone 0 validation.

### Distributed build

The binary packaged with The Safex Mine must be portable across supported x86-64 systems. Do not use host-specific compiler flags such as `-march=native` for the release binary.

## API/event strategy

Start by observing the existing local API and console behaviour. Candidate endpoints discussed for investigation are `/2/summary` and `/2/backends`, but exact support and field semantics must be verified against the pinned build.

If the existing interface reliably identifies accepted/rejected daemon results, use it. If it cannot preserve event identity, ordering or rapid bursts, add the smallest possible structured reporting patch in `safex-xmrig`.

Never interpret a pool-style `share` field as a Safex block without proving the daemon-mode semantics on the exact build.

## Runtime privileges

Windows large-page support may improve RandomX performance. First-run setup may offer an optional administrator step to grant the required privilege and then ask the user to restart. The GUI should not require permanent elevation.
