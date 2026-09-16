# Mining backend binaries

This directory is the development/runtime location for the Safex-compatible XMRig backend used by The Safex Mine.

## Files expected by the current Windows development build

```text
safex-xmrig-x86_64-pc-windows-msvc.exe
WinRing0x64.sys
```

Both file types are intentionally excluded from Git history.

## XMRig source

Safex-compatible fork:

```text
https://github.com/galicone/xmrig
```

Pinned source commit:

```text
3a5617f99a858614dc0c5897fc44c1bdb2618cca
```

Known-good MSVC development executable SHA-256:

```text
01097B87B2EA6C2213D221ABDFBBE5977094E97642EDABFFB444955C7DE5ACBE
```

A locally rebuilt executable can legitimately have a different hash because of compiler/dependency/toolchain differences.

## Driver

`WinRing0x64.sys` must correspond to the runtime/backend build being used. The exact driver binary and its redistribution notice must be reviewed and included as part of final public release packaging.

## Build instructions

See the repository root `BUILDING.md`.

## Packaging note

The current development code resolves these files from this source-tree directory. Final installer packaging still needs to define the packaged runtime location and ensure required third-party notices are shipped beside/with the release.
