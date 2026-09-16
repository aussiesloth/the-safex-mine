# Mining Engine Integration

## 1. Backend

The Safex Mine uses a Safex-compatible XMRig fork as its CPU-mining engine.

Source repository:

```text
https://github.com/galicone/xmrig
```

Pinned source commit:

```text
3a5617f99a858614dc0c5897fc44c1bdb2618cca
```

The backend executable is not committed to this repository.

## 2. Expected Windows runtime files

The current development layout expects:

```text
src-tauri\binaries\safex-xmrig-x86_64-pc-windows-msvc.exe
src-tauri\binaries\WinRing0x64.sys
```

The executable and driver are excluded by `.gitignore`.

## 3. Helper ownership

XMRig is not launched directly by the WebView/TypeScript frontend.

The standard-user Tauri application creates an authenticated helper session and elevates `safex-mine-helper.exe` through UAC. The helper then launches and supervises XMRig.

This design gives XMRig the opportunity to apply Windows MSR optimisation without elevating the entire GUI.

## 4. Backend command line

The helper launches XMRig with:

```text
--daemon
--algo=rx/sfx
--url <daemon>
--user <Safex Cash mining address>
--cpu-max-threads-hint=<profile>
--no-color
--print-time=5
```

The working directory is the backend binary directory.

## 5. Mining profiles

The current profile mapping is fixed:

| Profile | `--cpu-max-threads-hint` |
|---|---:|
| Calm | 40 |
| Balanced | 70 |
| Full Bore | 100 |

These values express CPU allocation targets. They are deliberately not presented as a performance ranking.

## 6. MSR handling

XMRig output is monitored for MSR success/failure.

If MSR succeeds, startup continues normally.

If MSR explicitly fails, The Safex Mine keeps the mining process and reports a degraded start. This is important for systems where VBS/hypervisor protections prevent direct MSR writes.

The project should not weaken Windows security automatically to make MSR available.

## 7. Job Object protection

Immediately after launch, the helper assigns XMRig to a Windows Job Object configured with:

```text
JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
```

If Job Object creation/configuration/assignment fails, startup fails rather than leaving an unmanaged elevated mining child.

If the helper later dies, closing the Job Object causes Windows to terminate XMRig.

## 8. Output capture

The helper captures both stdout and stderr from XMRig.

Relevant lines update a shared telemetry structure.

Current telemetry includes:

- MSR status;
- daemon connected/disconnected state;
- hashrate;
- worker threads;
- accepted count;
- rejected count;
- recent output lines.

## 9. Daemon state parsing

Current parsing behaviour includes:

- `new job from` -> daemon connected;
- `no active pools, stop mining` -> daemon disconnected and current hashrate zero.

This allows the GUI to distinguish a live XMRig process from an operational mining connection.

## 10. Accepted/rejected parsing

Accepted and rejected counters are parsed from XMRig result lines.

The frontend receives cumulative counts from helper status and computes the delta since the previous poll. Each new accepted event calls the application's real block-found handler; each new rejection calls the rejection handler.

That means the same event path drives:

- UI counters;
- BLOCK FOUND / REJECTED scene changes;
- block-found sound.

## 11. Status polling

The frontend polls mining status approximately every two seconds while a session is active.

Independent daemon validation also runs periodically so the UI can show endpoint status/height outside active mining.

## 12. Graceful stop

Normal Stop sends a Windows Ctrl+C event to XMRig.

The helper temporarily ignores Ctrl+C itself while directing the control event to the child process group. If XMRig does not exit cleanly within the shutdown window, the helper can fall back to forced termination.

The helper itself remains alive after a normal Stop.

## 13. Recovery behaviour

### Daemon/network interruption

XMRig is kept alive and allowed to reconnect. The UI enters OFFLINE while jobs are unavailable, then automatically returns to MINING when connection/job telemetry resumes.

### Helper/backend failure

If status communication fails or the session dies, the application discards the dead helper session, moves out of MINING, unlocks configuration and permits a fresh Start/UAC session.

## 14. Known-good backend build

The repository records this SHA-256 for the known-good MSVC development executable:

```text
01097B87B2EA6C2213D221ABDFBBE5977094E97642EDABFFB444955C7DE5ACBE
```

Compiler/toolchain differences can produce a different hash from the same source. Release artefacts should publish the hash of the exact binary actually distributed.

## 15. Packaging status

The development backend path is stable, but final installer packaging is not yet complete. The public release process still needs explicit packaged locations for:

- the helper;
- the XMRig executable;
- the WinRing driver;
- required third-party notices.
