# Contributing

The Safex Mine is currently in private pre-alpha development. These guidelines are intentionally lightweight and can be expanded before the repository becomes public.

## Principles

- Preserve the rule that **real mining state is authoritative** and presentation follows it.
- Never introduce hidden mining, hidden destination-address substitution, analytics, telemetry or wallet-secret collection.
- Keep the GUI/controller and the GPL-covered XMRig backend as separate repositories and executables unless a later licensing review explicitly approves a different structure.
- Do not commit private keys, seed phrases, wallet files, personal diagnostic data or unredacted captures that a tester does not intend to publish.
- Keep backend changes minimal and reviewable.

## Branching

Use focused feature/fix branches and small reviewable commits. Do not commit generated build directories or local diagnostic captures.

## Before a pull request

- Build the affected component.
- Run relevant tests.
- Verify that Start/Stop and failure-state behaviour remain accurate.
- Confirm simulated block events cannot alter live mining totals.
- Update documentation when behaviour changes.

## Licensing

The final licence for this GUI repository is not yet locked. MIT is the current leading candidate. Do not add third-party assets or code unless their licence and attribution requirements are known and recorded.
