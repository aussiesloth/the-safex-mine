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

## Antivirus quarantines the miner or SmartScreen warns about the application

For the complete tested install flow with screenshot locations, see the [Windows Installation Guide](docs/WINDOWS_INSTALLATION.md).

The Safex Mine contains a CPU-mining backend, an elevated helper and the WinRing driver used by XMRig for Windows MSR access. Antivirus/endpoint-security products commonly classify or quarantine mining software, and the Windows release is unsigned.

### Observed clean-machine Windows behaviour

A clean-machine test of the unsigned NSIS installer produced the following Microsoft security flow:

- Windows Defender SmartScreen displayed **Windows protected your PC** and identified the publisher as **Unknown publisher**;
- choosing **More info** exposed the **Run anyway** option;
- the installer completed successfully to `%LOCALAPPDATA%\The Safex Mine`;
- Microsoft Defender later quarantined the downloaded installer under the detection name `Trojan:Win32/Bearfoos.A!ml`;
- Microsoft Defender quarantined the installed XMRig backend at `%LOCALAPPDATA%\The Safex Mine\runtime\safex-xmrig-x86_64-pc-windows-msvc.exe` under the detection name `Trojan:Win64/HashvaultMiner.A`;
- restoring those two expected files through Protection History and adding an exclusion for **only** `%LOCALAPPDATA%\The Safex Mine` allowed The Safex Mine to run normally.

Those detection names are the labels observed in that Microsoft Defender test; other Defender versions or antivirus products may use different names or behave differently. The helper and `WinRing0x64.sys` were not observed being quarantined in this test, but that should not be assumed for every system.

### Recommended installation/security sequence

Before running the installer:

1. download The Safex Mine only from the project's official GitHub release;
2. if the installer remains accessible after download, verify its published SHA-256 checksum;
3. if antivirus immediately quarantines the installer and prevents checksum verification, restore/allow that specific installer first, then verify its SHA-256 against the checksum published on the official release **before executing it**;
4. confirm the release notes identify the same version and bundled XMRig source commit;
5. if SmartScreen shows **Windows protected your PC**, use **More info** to inspect the application and publisher information before choosing whether to continue.

If Defender quarantines an expected The Safex Mine file:

1. open **Windows Security -> Virus & threat protection -> Protection history**;
2. confirm the affected filename/path matches the installer you just downloaded or an expected The Safex Mine runtime component;
3. restore/allow that specific expected file;
4. after installation, add an exclusion for the dedicated install folder only: `%LOCALAPPDATA%\The Safex Mine`;
5. do not exclude Downloads, your whole user profile, an entire drive or another broad location.

The clean-machine test completed successfully **without disabling Microsoft Defender real-time protection**. Temporarily pausing real-time scanning should therefore be treated only as a fallback for security products that will not permit the verified installer/runtime to be restored or narrowly excluded.

If a temporary pause is genuinely required, verify the installer first, run only the verified release, create the narrow install-folder exclusion immediately, and re-enable protection straight away. Do not browse or download unrelated files while protection is paused.

Do **not**:

- leave antivirus or real-time protection disabled;
- exclude the whole Downloads folder, user profile, drive or another broad location;
- restore unrelated files merely because they were detected at the same time;
- assume every security warning is harmless.

## Session counters reset after closing the app

This is current behaviour. Blocks Found, Rejected and accumulated mining time are maintained in memory for the current app session and survive Stop -> Start, but a full application restart begins a new session.

## Defender exclusion remains after uninstall

If you manually added an antivirus exclusion for:

```text
%LOCALAPPDATA%\The Safex Mine
```

Windows will not remove that exclusion automatically when The Safex Mine is uninstalled.

Clean-machine testing confirmed that the application folder itself is removed by uninstall, but the manually created Defender exclusion remains.

After uninstalling The Safex Mine, remove that exclusion manually through Windows Security if you no longer need it. The application and uninstaller deliberately do not modify Microsoft Defender settings on your behalf.
