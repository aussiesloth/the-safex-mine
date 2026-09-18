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

The project also uses TypeScript, Vite and a number of transitive JavaScript and Rust crates.

Exact versions are recorded in:

- `package-lock.json`;
- `src-tauri/Cargo.lock`;
- `src-tauri/helper/Cargo.lock`.

Final release packaging should preserve or reproduce any notices required by those exact versions.

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
- [ ] complete a final review of the locked JavaScript/Rust dependency licences and any attribution texts they require;
- [ ] publish the SHA-256 checksum generated from the exact final public installer.
