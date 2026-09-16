# Troubleshooting

This guide covers the current Windows development/pre-release build of **The Safex Mine**.

## Start Mining is unavailable

Check the two required inputs first:

- the Safex Cash mining address must validate;
- the configured daemon must be reachable.

The default daemon is:

```text
rpc.safex.org:17402
```

If a custom or LAN daemon is configured, confirm the host and port are reachable from the same PC.

## Windows asks for Administrator approval

This is expected when mining first starts during an application session.

The GUI itself remains non-administrative. The UAC prompt is for `safex-mine-helper.exe`, which launches/supervises XMRig and allows XMRig to attempt Windows MSR optimisation.

A normal Stop -> Start cycle during the same app session should reuse the already elevated helper and should not require another UAC prompt.

## I denied the UAC prompt

Mining cannot launch through the elevated helper if elevation is denied. Start mining again and approve the helper prompt if you want the backend to run.

Do not run the whole GUI as Administrator as a workaround.

## The helper executable cannot be found

For development, compile it with:

```powershell
cargo build --manifest-path .\src-tauri\helper\Cargo.toml --release
```

The development fallback path is:

```text
src-tauri\helper\target\release\safex-mine-helper.exe
```

Packaged builds resolve:

```text
runtime\safex-mine-helper.exe
```

from Tauri's resource directory.

Use `npm run tauri:build` for packaged builds so the helper is compiled before the release resources are evaluated. See `BUILDING.md`.

## The XMRig executable or WinRing driver cannot be found

The current development build expects:

```text
src-tauri\binaries\safex-xmrig-x86_64-pc-windows-msvc.exe
src-tauri\binaries\WinRing0x64.sys
```

Those files are intentionally excluded from Git. During packaging they are mapped into the installed `runtime\` resource directory beside the elevated helper. See `BUILDING.md` for the pinned backend source information.

## MSR optimisation failed

Some Windows systems block direct MSR writes when VBS/hypervisor-backed security is active.

The Safex Mine can continue mining in degraded-performance mode when this occurs. A lower hashrate does not mean the miner is non-functional.

Do not disable Windows security features solely to remove this warning unless you independently understand and accept the consequences.

## Hashrate is lower than expected

Possible causes include:

- MSR optimisation unavailable;
- CPU thermal or power limits;
- laptop cooling constraints;
- memory/BIOS configuration;
- CPU/cache behaviour at the selected thread allocation;
- other heavy applications using the system.

Full Bore uses a 100% CPU allocation hint, but that does not guarantee the highest hashrate on every CPU. Try Balanced as a comparison.

## The miner shows OFFLINE

If XMRig remains alive but the daemon connection is lost, the application intentionally switches to the OFFLINE visual state and reports zero current hashrate.

XMRig continues attempting to reconnect. When jobs resume, the GUI should return to MINING automatically without launching a new helper or asking for UAC again.

If it does not recover:

- verify internet/LAN connectivity;
- verify the configured daemon;
- stop and restart mining;
- if necessary, restart the application.

## The backend/helper crashed

An unexpected helper/backend failure should move the application to OFFLINE, unlock the configuration fields and allow a fresh Start.

The helper owns XMRig through a kill-on-close Windows Job Object, so terminating the helper should also terminate its mining child.

If a stale process remains despite that protection, capture the details before manually terminating it and report the issue.

## Block-found sound is missing

Check:

- the speaker/mute control in the top bar;
- Windows application/system volume;
- the selected output device.

The mute preference is persistent across application restarts.

## PowerShell says npm scripts are disabled

On systems where PowerShell execution policy blocks `npm.ps1`, use the `.cmd` shim:

```powershell
npm.cmd ci
npm.cmd run tauri dev
```

## Antivirus or SmartScreen warns about the application

Mining backends are commonly flagged by antivirus products, and the planned release is unsigned.

Do not disable security software wholesale. For public releases, verify:

- the download came from the project's GitHub release page;
- the published SHA-256 checksum matches;
- the corresponding source/version information is available.

Any project-specific false-positive guidance should be based on observed release behaviour, not generic advice to bypass security controls.

## Session counters reset after closing the app

This is current behaviour. Blocks Found, Rejected and accumulated mining time are maintained in memory for the current app session and survive Stop -> Start, but a full application restart begins a new session.
