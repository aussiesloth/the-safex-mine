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

`WinRing0x64.sys` must correspond to the runtime/backend build being used. The pinned upstream OpenLibSys notice is retained in `THIRD_PARTY_LICENSES/WinRing0-LICENSE.txt` and is bundled by the release Tauri configuration.

## Build instructions

See the repository root `BUILDING.md`.

## Packaging

Development resolves these files from this directory.

The release-only Tauri configuration maps them to:

```text
runtime/safex-xmrig-x86_64-pc-windows-msvc.exe
runtime/WinRing0x64.sys
```

alongside the packaged elevated helper. Use `npm run tauri:build` for the packaged build path.

The generated installer still requires clean-machine validation before public release.
