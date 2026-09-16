# Building The Safex Mine from Source

This document describes the **current Windows development build**.

The project is not yet at the point where `npm run tauri build` alone produces the final public installer. The elevated helper is still located through its development path, and the XMRig executable and WinRing driver are intentionally excluded from Git. Final packaging will replace those development assumptions with packaged runtime paths.

## 1. Supported development target

The current application targets:

- Windows x64;
- Tauri 2;
- Rust MSVC toolchain;
- Node.js/npm frontend tooling;
- a Safex-compatible XMRig backend built with MSVC.

Development has been exercised on Windows 11 with Node.js 24.x and Rust stable. The current Vite toolchain requires Node.js **20.19 or newer** (or Node.js 22.12+ on the Node 22 line).

## 2. Prerequisites

Install the following before cloning the project:

- Git;
- Node.js 20.19+ and npm;
- Rust stable with the `x86_64-pc-windows-msvc` target;
- Microsoft Visual Studio 2022 Build Tools with **Desktop development with C++** and a Windows SDK;
- CMake for building the XMRig backend;
- Microsoft Edge WebView2 Runtime if it is not already present on the system.

For a final MSI release build, additional Windows installer prerequisites may be required. Those instructions will be added once release packaging is finalised.

## 3. Clone the application

```powershell
git clone https://github.com/aussiesloth/the-safex-mine.git
cd the-safex-mine
```

Install the locked JavaScript dependencies:

```powershell
npm ci
```

If PowerShell execution policy blocks the `npm.ps1` wrapper, use `npm.cmd` instead:

```powershell
npm.cmd ci
```

### Address validation

Safex Cash address validation is implemented in the Rust/Tauri backend using the `base58-monero` crate with checksum support, Safex mainnet prefix checks and address-structure validation.

The earlier experimental frontend dependency on `@safex/wallet-core` has been removed. A clean JavaScript install therefore no longer depends on Safex Git repositories or project-specific GitHub SSH configuration.

## 4. Build the elevated helper

The helper is a separate Rust executable. Build it in release mode:

```powershell
cargo build --manifest-path .\src-tauri\helper\Cargo.toml --release
```

The current Tauri backend expects the development helper at:

```text
src-tauri\helper\target\release\safex-mine-helper.exe
```

That path is a **development-only implementation detail** and will change for packaged releases.

## 5. Prepare the Safex XMRig backend

The compiled mining backend is not committed to this repository.

Clone the Safex-compatible XMRig fork:

```powershell
git clone https://github.com/galicone/xmrig.git safex-xmrig
cd safex-xmrig
git checkout 3a5617f99a858614dc0c5897fc44c1bdb2618cca
```

Build that pinned source with the Microsoft Visual C++ toolchain using the normal XMRig Windows build process and its required dependencies.

The application expects the resulting executable to be copied and renamed to:

```text
<the-safex-mine>\src-tauri\binaries\safex-xmrig-x86_64-pc-windows-msvc.exe
```

The app also expects the matching Windows MSR driver at:

```text
<the-safex-mine>\src-tauri\binaries\WinRing0x64.sys
```

Both `*.exe` and `*.sys` files in `src-tauri/binaries/` are intentionally ignored by Git.

The repository currently records this known-good backend source commit:

```text
3a5617f99a858614dc0c5897fc44c1bdb2618cca
```

and this known-good MSVC XMRig executable SHA-256:

```text
01097B87B2EA6C2213D221ABDFBBE5977094E97642EDABFFB444955C7DE5ACBE
```

If your locally built executable differs, that does not automatically mean it is wrong; compiler/toolchain differences can change the binary hash. The hash above identifies the development build that was benchmarked for this project.

## 6. Confirm the required development layout

Before starting the app, the important runtime files should exist here:

```text
the-safex-mine/
|
|-- src-tauri/
|   |-- binaries/
|   |   |-- safex-xmrig-x86_64-pc-windows-msvc.exe
|   |   `-- WinRing0x64.sys
|   `-- helper/
|       `-- target/
|           `-- release/
|               `-- safex-mine-helper.exe
`-- ...
```

## 7. Run the development application

From the application repository root:

```powershell
npm run tauri dev
```

or, if required by PowerShell policy:

```powershell
npm.cmd run tauri dev
```

## 8. First mining test

1. Enter a valid Safex Cash mining address.
2. Leave the default daemon as `rpc.safex.org:17402` or enter a custom/LAN daemon.
3. Select a mining mode.
4. Press **Start Mining**.
5. Approve the Windows UAC prompt for `safex-mine-helper.exe`.

The helper launches XMRig with the selected profile and the Safex algorithm:

```text
--daemon
--algo=rx/sfx
--url <daemon>
--user <Safex Cash address>
--cpu-max-threads-hint=<40|70|100>
--no-color
--print-time=5
```

## 9. MSR behaviour

XMRig attempts its normal Windows MSR optimisation from the elevated helper session.

On systems where Windows VBS/hypervisor security prevents MSR writes, The Safex Mine can continue in degraded-performance mode. Do **not** disable Windows security features merely to make MSR available unless you independently understand and accept the security implications.

## 10. Development build checks

Before treating a local build as healthy, verify:

- the GUI launches without elevation;
- Start Mining produces a UAC prompt for the helper, not for the whole GUI;
- XMRig starts and reports `rx/sfx`;
- hashrate and thread count appear in the UI;
- Stop Mining shuts XMRig down;
- Start after Stop reuses the helper during the same app session;
- daemon loss switches the UI to OFFLINE and automatic reconnection resumes mining;
- if a real block is accepted, the block counter, BLOCK FOUND scene and block-found sound all trigger once.

## 11. Creating a frontend production build

The frontend itself can be compiled with:

```powershell
npm run build
```

This runs TypeScript checking and Vite production bundling.

## 12. Installer/package build status

Tauri's normal package command is:

```powershell
npm run tauri build
```

However, **do not treat the current output as the final supported public build process yet**. The project still needs to:

- relocate the helper from its development `target\release` path to a packaged runtime/sidecar location;
- define how the XMRig executable and WinRing driver are included in release artefacts;
- complete custom application icons;
- finalise third-party licence packaging;
- test the installer on a clean Windows system;
- document unsigned-binary/SmartScreen and antivirus behaviour;
- publish checksums for release artefacts.

Once those items are complete, this file will be updated with the reproducible release-build procedure.
