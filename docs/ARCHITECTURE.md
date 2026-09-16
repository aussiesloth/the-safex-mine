# Architecture

## 1. Overview

The Safex Mine is a Windows Tauri application that separates the ordinary-user graphical interface from the elevated mining process.

Current runtime shape:

```text
Tauri / TypeScript GUI (standard user)
        |
        | Tauri commands
        v
Rust application backend (standard user)
        |
        | authenticated local named pipe
        v
safex-mine-helper.exe (elevated by UAC)
        |
        | native child process
        v
Safex XMRig + WinRing0 driver
```

The GUI owns presentation and configuration. The Rust application backend owns Windows process/session orchestration. The elevated helper owns the XMRig child process and the privilege-sensitive mining lifecycle.

## 2. Frontend

The frontend is implemented in TypeScript and rendered inside the Tauri WebView.

It owns:

- Safex Cash address and daemon input;
- mining-mode selection;
- Start/Stop controls;
- status and statistics;
- scene transitions;
- block/reject counters;
- session-time display;
- the block-found sound and mute preference;
- local persistence of user-facing settings.

The main frontend entry point is `src/main.ts`, with application styling in `src/styles.css`.

## 3. Tauri/Rust application backend

The Rust side in `src-tauri/src/` exposes the production command surface used by the frontend for:

- backend connectivity;
- Safex address validation;
- daemon validation/status;
- helper/session management;
- mining Start/Stop/status.

Earlier development-only ping/XMRig/probe commands are not registered in the production invoke handler.

The GUI does not construct a shell command and run it as Administrator. Instead, the Rust backend creates a controlled helper session and asks Windows to elevate only the helper executable.

## 4. Elevated helper

`src-tauri/helper/` builds `safex-mine-helper.exe`.

The helper:

- starts elevated through Windows UAC;
- accepts commands only through the expected local pipe session;
- launches the expected XMRig executable;
- passes the validated daemon, address and CPU-profile arguments;
- captures XMRig stdout/stderr;
- parses mining telemetry;
- supervises graceful/forced shutdown;
- owns a Windows Job Object that contains XMRig.

## 5. GUI/helper IPC

Each helper session uses:

- a random local named-pipe identifier;
- a random authentication token;
- an explicit Windows security descriptor;
- local-only pipe behaviour.

The helper is intended to serve the launching application session rather than expose a general privileged service.

If the GUI/helper pipe closes unexpectedly, the helper exits. Because the helper also owns the XMRig Job Object, helper termination tears down the mining child.

## 6. Mining child process

In development, the helper launches XMRig from:

```text
src-tauri\binaries\safex-xmrig-x86_64-pc-windows-msvc.exe
```

For packaged builds, the helper, XMRig and WinRing driver are bundled together under the Tauri `runtime/` resource directory. The helper resolves its own executable directory and uses that directory as the XMRig working directory so the bundled driver is found beside the miner.

Current command-line shape:

```text
--daemon
--algo=rx/sfx
--url <daemon>
--user <Safex Cash address>
--cpu-max-threads-hint=<40|70|100>
--no-color
--print-time=5
```

## 7. Mining profiles

The UI profile names map directly to XMRig CPU allocation hints:

| UI mode | Helper profile | XMRig hint |
|---|---|---:|
| Calm | `calm` | 40 |
| Balanced | `balanced` | 70 |
| Full Bore | `full` | 100 |

These are allocation hints, not guaranteed performance rankings.

## 8. Telemetry flow

XMRig stdout/stderr is read by the helper and converted into compact telemetry that includes, among other fields:

- MSR success/failure;
- daemon connection state;
- current hashrate;
- worker-thread count;
- accepted count;
- rejected count;
- recent backend lines.

The frontend polls helper status at approximately two-second intervals.

Accepted/rejected counters from the backend are compared with the frontend's last-seen values. Each newly observed accepted event invokes the same block-found handler that updates the counter, switches the scene and plays the optional sound.

## 9. Connection model

The application distinguishes between:

- helper/backend process availability;
- daemon connection availability;
- active mining telemetry.

When XMRig reports that there are no active pools/jobs, the frontend enters OFFLINE without immediately destroying the mining session. XMRig can reconnect on its own. When a new job arrives, the UI returns to MINING.

The configured daemon is also validated independently so the user can see whether the endpoint itself is reachable.

## 10. Failure containment and recovery

### Helper/XMRig failure

Unexpected helper/session failure is treated as a failed mining session. The UI leaves MINING, unlocks the configuration fields and allows a fresh Start, which launches a new elevated helper.

### Daemon/network loss

Daemon loss does not automatically kill XMRig. The session remains alive so the backend can reconnect without a new UAC prompt.

### Job Object

XMRig is assigned to a Windows Job Object with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`. If the helper terminates unexpectedly, Windows terminates the attached mining process.

## 11. Stop behaviour

A normal Stop requests a genuine Ctrl+C event for XMRig. The helper temporarily protects itself from that console control event so the request reaches the mining child without killing the helper.

If graceful shutdown does not complete, forced termination is available as a fallback.

The elevated helper remains alive after a normal Stop so another Start in the same application session does not need a new UAC prompt.

## 12. Presentation architecture

The visual system uses five authored static images in `src/assets/scenes/`.

Two image elements are alternated for crossfades. The controls/statistics/header stay fixed while only the scene layer changes.

No continuously animated character rig is part of the current release path.

## 13. Configuration persistence

The frontend stores ordinary user preferences in browser local storage:

- mining address;
- daemon endpoint;
- selected mining mode;
- sound-muted state.

Mining-session counters and elapsed mining time are in-memory session state and reset when the application is fully restarted.

## 14. Development and packaged paths

The standard-user backend resolves the elevated helper in this order:

1. packaged Tauri resource: `runtime/safex-mine-helper.exe`;
2. development fallback: `src-tauri/helper/target/release/safex-mine-helper.exe`.

The release-only Tauri configuration maps the helper, XMRig and WinRing driver into one packaged `runtime/` directory. This keeps the installed privilege/process model the same as development while removing source-tree path assumptions from the packaged application.

The remaining packaging work is validation of the generated installer on a clean Windows system.
