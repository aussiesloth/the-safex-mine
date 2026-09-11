# Licensing and Third-Party Boundary

## GUI repository

The final licence for `aussiesloth/the-safex-mine` is not yet locked. **MIT** is the leading candidate because the project is intended to be easy for the community to inspect and fork.

Do not add a root `LICENSE` until the final GUI/XMRig integration has been reviewed and the maintainer intentionally selects the licence.

## Mining backend

The mining backend lives separately in `aussiesloth/safex-xmrig` and is derived from XMRig/Galicone code identified in the project discussion as **GPL-3.0-or-later**.

For any distributed backend binary:

- preserve upstream copyright/licence notices;
- clearly credit XMRig and Galicone;
- publish the corresponding source used for that binary;
- publish local modifications;
- record the exact source commit and build instructions;
- provide checksums/provenance for release binaries.

## Boundary rule

The GUI/controller and XMRig backend are intentionally separate repositories and separate executables communicating through process control/local API or another clearly defined IPC mechanism.

This separation supports engineering clarity and a cleaner licensing analysis, but it is not itself a legal conclusion. Review the final integration before public distribution.

## Assets and dependencies

Before accepting art, fonts, audio, libraries or installer components, record:

- source/author;
- licence;
- attribution requirement;
- redistribution/modification conditions.

Do not commit unlicensed or ambiguously licensed assets.
