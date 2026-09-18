# Third-Party Notices

The Safex Mine uses third-party open-source software. Each component remains subject to its own licence terms.

This file identifies the primary direct dependencies and bundled runtime components. Final public binary releases should also include the applicable licence texts/notices required by the exact dependency and driver versions shipped.

## Safex-compatible XMRig backend

Canonical Safex Mine backend repository:

```text
https://github.com/aussiesloth/safex-xmrig
```

Upstream provenance:

```text
aussiesloth/safex-xmrig
    -> galicone/xmrig
    -> xmrig/xmrig
```

Pinned source commit used by this project:

```text
3a5617f99a858614dc0c5897fc44c1bdb2618cca
```

Licence: **GNU General Public License v3.0 (GPL-3.0)**.

The compiled XMRig executable is intentionally not committed to this repository. Public binary distributions that include the backend must satisfy the GPL's corresponding-source and notice requirements for the exact backend version distributed.

## Rust address-validation library

Safex Cash address validation uses the Rust crate:

- `base58-monero` — MIT licence.

The exact resolved version is recorded in `src-tauri/Cargo.lock`.

## Tauri

Direct Tauri dependencies include:

- `@tauri-apps/api`;
- `@tauri-apps/cli`;
- `@tauri-apps/plugin-opener`;
- Rust-side Tauri crates recorded in `src-tauri/Cargo.lock`.

The JavaScript Tauri packages used by the current lockfile are licensed under **MIT and/or Apache-2.0** terms as declared by those packages.

## Other JavaScript and Rust dependencies

The Windows release dependency graph is audited from the exact lockfiles and target metadata.

The current audit records:

- 322 Rust packages in the conservative Windows target graph;
- 2 npm runtime packages: `@tauri-apps/api 2.11.1` and `@tauri-apps/plugin-opener 2.5.5`;
- no package missing both a declared licence expression and a licence-file declaration.

The detailed generated inventory is retained in `docs/DEPENDENCY_LICENSE_AUDIT.md`.

Before every packaged release, `npm run tauri:build` regenerates:

```text
THIRD_PARTY_LICENSES/DEPENDENCY_LICENSES.txt
```

from the exact Cargo registry/npm package files present on the release build machine. The generated bundle preserves package-provided `LICENSE`, `LICENCE`, `COPYING`, `NOTICE`, `COPYRIGHT` and `UNLICENSE` files where present, and is bundled into the installer under `licenses/DEPENDENCY_LICENSES.txt`.

Build/dev-only npm packages are not treated as shipped npm runtime dependencies. The Rust inventory is deliberately conservative and may include build-time crates resolved for the Windows target; preserving extra notices is preferable to omitting a notice for code that contributes to the release build.

## MPL-2.0 components and source availability

The audited Windows dependency graph contains these MPL-2.0 Rust crates:

- `cssparser 0.36.0` — https://crates.io/api/v1/crates/cssparser/0.36.0/download
- `cssparser-macros 0.6.1` — https://crates.io/api/v1/crates/cssparser-macros/0.6.1/download
- `dtoa-short 0.3.5` — https://crates.io/api/v1/crates/dtoa-short/0.3.5/download
- `option-ext 0.2.0` — https://crates.io/api/v1/crates/option-ext/0.2.0/download
- `selectors 0.36.1` — https://crates.io/api/v1/crates/selectors/0.36.1/download

Those links provide the exact-version source archives used by Cargo's registry ecosystem. The MPL-covered source remains available under MPL-2.0; The Safex Mine's GPL-3.0 licensing does not remove or restrict those source-code rights.

The generated dependency-licence bundle also preserves the licence/notice material supplied by those packages.

## WinRing driver

The Windows development/runtime layout uses:

```text
WinRing0x64.sys
```

For the pinned Safex-compatible XMRig source commit `3a5617f99a858614dc0c5897fc44c1bdb2618cca`, the driver is present in the canonical project fork at:

```text
bin/WinRing0/WinRing0x64.sys
```

and its redistribution notice is present at the corresponding source path:

```text
bin/WinRing0/LICENSE
```

That exact OpenLibSys notice is reproduced in this repository at:

```text
THIRD_PARTY_LICENSES/WinRing0-LICENSE.txt
```

Binary releases that ship this WinRing0 driver must also ship that notice unchanged. Do not substitute an unverified driver solely because it has the same filename.

## Safex branding

Safex/Safex Cash logos and branding are not covered by the software licences above or by The Safex Mine's GPL-3.0 application licence.

The repository includes the official Safex Cash logo asset at:

```text
src/assets/branding/safex-cash.svg
```

Its inclusion and use in The Safex Mine is pursuant to the branding permission documented in `docs/BRANDING.md`. No separate software-licence grant for the Safex/Safex Cash branding is implied by its presence in this repository.

## The Safex Mine application licence

The Safex Mine's own application code is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. The complete licence text is provided in the repository root `LICENSE` file.

## Release checklist

Current release-preparation status:

- [x] project `LICENSE` contains GPL-3.0;
- [x] npm, application Cargo and helper Cargo metadata declare `GPL-3.0-only`;
- [x] the release configuration bundles `LICENSE`;
- [x] the release configuration bundles this `THIRD_PARTY_NOTICES.md`;
- [x] the exact OpenLibSys WinRing0 redistribution notice is preserved in `THIRD_PARTY_LICENSES/WinRing0-LICENSE.txt` and bundled with the release;
- [x] the pinned Safex-compatible XMRig source repository and commit are documented so corresponding source can be obtained;
- [x] audited the locked Windows dependency graph; no missing licence metadata was found, MPL-2.0 source availability is documented, and package-provided licence/notice files are generated into the release bundle;
- [ ] publish the SHA-256 checksum generated from the exact final public installer.
