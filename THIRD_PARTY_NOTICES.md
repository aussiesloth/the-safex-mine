# Third-Party Notices

The Safex Mine uses third-party open-source software. Each component remains subject to its own licence terms.

This file identifies the primary direct dependencies and bundled runtime components. Final public binary releases should also include the applicable licence texts/notices required by the exact dependency and driver versions shipped.

## Safex-compatible XMRig backend

Repository:

```text
https://github.com/aussiesloth/safex-xmrig
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

and its redistribution notice is present upstream at:

```text
bin/WinRing0/LICENSE
```

That exact OpenLibSys notice is reproduced in this repository at:

```text
THIRD_PARTY_LICENSES/WinRing0-LICENSE.txt
```

Binary releases that ship this WinRing0 driver must also ship that notice unchanged. Do not substitute an unverified driver solely because it has the same filename.

## Safex branding

Safex/Safex Cash logos and branding are not covered by the software licences above. Their use in this application is addressed separately in `docs/BRANDING.md`.

## The Safex Mine application licence

The Safex Mine's own application code is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. The complete licence text is provided in the repository root `LICENSE` file.

## Release checklist

Before publishing a binary release:

1. include/preserve the project `LICENSE` (GPL-3.0);
2. include the licence/notice material required by the bundled XMRig backend;
3. make corresponding XMRig source available in the manner required by GPL-3.0;
4. include `THIRD_PARTY_LICENSES/WinRing0-LICENSE.txt` with any release that ships the pinned WinRing0 driver;
5. review the locked JavaScript/Rust dependency licences;
6. publish SHA-256 checksums for the release artefacts.
