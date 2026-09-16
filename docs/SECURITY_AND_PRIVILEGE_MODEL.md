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

The planned public Windows release is unsigned.

This means users may encounter SmartScreen/trust warnings. Public releases should compensate with transparency:

- public source;
- exact version/source references;
- SHA-256 checksums;
- clear third-party notices;
- no hidden security exclusions.

## 13. Antivirus considerations

Mining software is commonly flagged by endpoint-security products.

The Safex Mine must never:

- disable antivirus software;
- silently add exclusions;
- obscure the mining backend;
- claim a warning is a false positive without release-specific evidence.

## 14. Remaining release-security work

Before public release:

- remove or gate development-only backend diagnostic commands;
- finalise packaged helper/backend paths;
- test installed-file permissions;
- test the unsigned installer on a clean Windows system;
- document observed SmartScreen/AV behaviour;
- publish release checksums;
- finalise licence/notices.
