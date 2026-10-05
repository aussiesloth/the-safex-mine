# Security and Privilege Model

## 1. Implemented principle

The Safex Mine runs its graphical application with ordinary user privileges and elevates only the component that needs to launch the MSR-capable mining backend.

This split-privilege model is implemented, not merely planned.

## 2. Process model

```text
Standard-user Tauri GUI
        |
        v
Standard-user Rust backend
        |  Create private helper session
        |  Windows UAC / ShellExecute runas
        v
Elevated safex-mine-helper.exe
        |
        v
Safex XMRig child process
```

## 3. Why the GUI is not elevated

Running the whole application as Administrator would unnecessarily elevate:

- the WebView/UI;
- asset loading;
- settings/local-storage operations;
- ordinary daemon checks;
- presentation logic.

None of those tasks requires Administrator privileges.

## 4. Helper elevation

On the first Start during an application session, the Rust backend launches `safex-mine-helper.exe` with Windows UAC elevation.

The helper remains available across normal Stop -> Start cycles so the user is not repeatedly prompted for elevation.

If the helper session dies, the application discards it and a later Start launches a fresh elevated helper.

## 5. Authenticated IPC

GUI/backend communication with the elevated helper uses a local named pipe.

Per-session protections include:

- random pipe identifier;
- random authentication token;
- local-only pipe rejection behaviour;
- explicit Windows access-control/security descriptor;
- no persistent privileged network listener.

The helper is not intended to act as a general system service.

## 6. Executable path integrity

The helper launches the expected backend executable from the application's controlled binary directory:

```text
safex-xmrig-x86_64-pc-windows-msvc.exe
```

User input does not select an arbitrary privileged executable.

Daemon/address/mode values are passed as process arguments through the native process API rather than shell command concatenation.

## 7. XMRig Job Object

Before mining is accepted as running, XMRig is assigned to a Windows Job Object configured with:

```text
JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
```

If the elevated helper exits unexpectedly, its Job Object closes and Windows terminates XMRig.

Failure to create/configure/assign the Job Object is treated as a startup failure.

## 8. Graceful shutdown

Stop first uses a genuine Windows Ctrl+C console event for XMRig.

The helper protects itself from that event while targeting the mining child. Forced termination is used only if the graceful path does not complete.

## 9. MSR policy

MSR optimisation is an important performance feature and the reason the mining helper is elevated.

However, some systems intentionally block MSR writes through VBS/hypervisor security. The current implementation treats explicit MSR failure as a degraded-performance state rather than forcing users to weaken Windows security.

The project should never automatically disable VBS, antivirus, firewall or similar security controls.

## 10. Daemon/network failure

Loss of the Safex daemon connection is not treated as a reason to elevate a new helper.

XMRig remains alive and can reconnect. The GUI changes to OFFLINE and returns to MINING when jobs resume.

## 11. Logging/telemetry

Backend output is captured for operational telemetry. The project should keep logs limited to information useful for mining diagnosis.

Safex mining addresses and public node endpoints are not passwords, but release diagnostics should still avoid unnecessary machine/user information.

## 12. Unsigned release model

The published v1.0.0 Windows release is unsigned. The release-ready v1.1.0 build is also expected to remain unsigned unless a future signing arrangement changes.

Users may therefore encounter SmartScreen/trust warnings. Public releases compensate with transparency:

- public source;
- exact version/source references;
- SHA-256 checksums;
- clear third-party notices;
- no hidden security exclusions.

## 13. Antivirus considerations

Mining software is commonly flagged or quarantined by endpoint-security products. The Safex Mine's bundled mining backend, elevated helper and WinRing driver should therefore be treated as components likely to attract additional scrutiny from antivirus products.

The Safex Mine must never:

- disable antivirus software;
- silently add exclusions;
- obscure the mining backend;
- restore quarantined files automatically;
- claim a warning is a false positive without release-specific evidence.

Documentation may explain how a user who has independently verified the release can restore an expected quarantined runtime file or add a narrowly scoped exclusion for the dedicated installation/runtime folder. It must not recommend broad exclusions or disabling real-time protection.

## 14. Release-security validation status

The v1.0.0 release completed the release-security work that had previously been listed as pending. Clean-machine testing covered the unsigned NSIS installer, installed runtime layout, helper-only UAC behaviour, Microsoft Defender quarantine/recovery, a narrow install-folder exclusion, full-scan behaviour and uninstall. The published release includes a SHA-256 checksum and the required project/third-party licence material. Earlier development-only probe commands are not registered in the production invoke handler.

For future releases, these are release-specific checks rather than one-time assumptions. For v1.1.0, L8/L9 completed the required installer/runtime/security validation without changing the split-privilege model. The remaining publication step is to build/checksum the exact release-ready `main` commit and use the approved release materials.
