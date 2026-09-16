# Configuration and First Run

## 1. Current first-run model

The current application does not use a separate first-run wizard or Settings screen.

Configuration is performed directly in the main interface. The user can start mining after supplying a valid Safex Cash address and confirming a reachable daemon.

## 2. Safex Cash mining address

The address field:

- accepts paste/input directly;
- trims surrounding whitespace on change;
- validates the address before mining can start;
- shows valid/invalid feedback;
- stores a valid address in local storage.

The Rust validator checks the Safex mainnet prefix and expected decoded address structure.

## 3. Daemon endpoint

Default:

```text
rpc.safex.org:17402
```

The user may replace this with a custom remote or LAN endpoint.

The application validates daemon availability and displays the current chain height when the endpoint is online.

While the app is idle/ready, a silent background daemon refresh keeps the displayed status reasonably current.

## 4. Mining mode

Available modes:

| Mode | CPU allocation hint |
|---|---:|
| Calm | 40% |
| Balanced | 70% |
| Full Bore | 100% |

The selected mode is stored in local storage and restored on the next application launch.

Balanced is the default when no valid saved mode exists.

## 5. Sound setting

The top-bar speaker button controls the block-found sound.

- sound is enabled by default;
- clicking the control toggles muted/unmuted state;
- the mute choice is stored in local storage;
- the preference survives application restarts.

Only the block-found celebration sound is affected.

## 6. Starting mining

When the address and daemon are valid:

1. choose a mining mode;
2. press **Start Mining**;
3. Windows requests UAC approval for `safex-mine-helper.exe`;
4. the helper launches XMRig;
5. the UI transitions to MINING once the backend session is operating.

The whole Tauri GUI does not elevate.

## 7. Configuration locking while mining

While mining is active:

- the address field is locked;
- the daemon field is locked;
- mining-mode buttons are disabled;
- Start is unavailable;
- Stop remains available.

This avoids changing backend identity/connection settings underneath a running mining process.

## 8. Stop and restart

Pressing Stop:

- requests clean XMRig shutdown;
- keeps the application open;
- keeps current in-memory block/reject counters;
- keeps accumulated mining time;
- leaves the elevated helper available for a later Start in the same app session.

## 9. What persists across full application restart

Persisted:

- valid mining address;
- daemon endpoint;
- mining mode;
- sound-muted preference.

Not persisted:

- Blocks Found counter;
- Rejected counter;
- accumulated mining/session time;
- transient visual state.

A new application launch begins a new mining session.

## 10. Changing the address

The current implementation allows the address to be changed only while mining is stopped because the field is locked while mining.

When a newly validated address differs from the previously saved address, it begins a fresh in-memory mining session. **Blocks Found resets to 0, Rejected resets to 0, and accumulated mining time resets to 00:00:00.**

If that product rule changes before release, both the code and this document should be updated together.

## 11. Invalid/unavailable configuration

Mining is prevented or reported clearly when, for example:

- the Safex address is invalid;
- the daemon is unavailable;
- the helper cannot be launched;
- the XMRig executable is missing;
- the WinRing driver is missing;
- the backend fails during startup.

MSR failure is treated differently: mining may continue in degraded-performance mode.
