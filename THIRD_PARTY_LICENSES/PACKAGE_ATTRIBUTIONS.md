# Package attributions for dependency archives without a root licence file

The generated `DEPENDENCY_LICENSES.txt` preserves package-provided licence and notice files where they exist. A small number of published crate archives in the locked Windows dependency graph do not contain a root-level licence file even though their package metadata declares a licence.

This file records the additional package-specific attribution/source information needed for those cases. The applicable standard licence texts are also present in `DEPENDENCY_LICENSES.txt` through other packages using the same licence families.

## BSD-3-Clause

### alloc-stdlib 0.2.4

- Licence: BSD-3-Clause
- Copyright: Copyright (c) 2016 Dropbox, Inc.
- Upstream repository: https://github.com/dropbox/rust-alloc-no-stdlib
- Exact crate: https://crates.io/crates/alloc-stdlib/0.2.4

## MPL-2.0

### selectors 0.36.1

- Licence: MPL-2.0
- Copyright: The Servo Project Developers
- Upstream repository: https://github.com/servo/servo
- Exact crate source archive: https://crates.io/api/v1/crates/selectors/0.36.1/download

The Safex Mine does not modify this crate. The MPL-covered source remains available from the exact-version source archive above.

## MIT

### webview2-com 0.38.2
### webview2-com-macros 0.8.1
### webview2-com-sys 0.38.2

- Licence: MIT
- Copyright: Copyright (c) 2021 Bill Avery
- Upstream repository: https://github.com/wravery/webview2-rs
- Exact crates:
  - https://crates.io/crates/webview2-com/0.38.2
  - https://crates.io/crates/webview2-com-macros/0.8.1
  - https://crates.io/crates/webview2-com-sys/0.38.2

## Apache-2.0 option selected for dual-licensed crates

The following published crate archives did not expose a root-level licence file in the local Cargo package cache, but their package metadata declares an Apache-2.0/MIT choice. For The Safex Mine distribution, the Apache-2.0 option is used:

- `defmt-parser 1.0.0`
- `tauri-plugin 2.6.3`
- `unic-char-property 0.9.0`
- `unic-char-range 0.9.0`
- `unic-common 0.9.0`
- `unic-ucd-ident 0.9.0`
- `unic-ucd-version 0.9.0`

The Apache-2.0 licence text is preserved in `DEPENDENCY_LICENSES.txt`.
