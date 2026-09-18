# Configuration and First Run

## 1. Mining Risk Acknowledgement

On first launch, The Safex Mine presents **Mining Risk Acknowledgement — Version 1.0** before the mining interface can be used.

The acknowledgement explains the principal risks and responsibilities associated with cryptocurrency mining, including:

- uncertain rewards and cryptocurrency value;
- sustained CPU load, heat, electricity use and hardware wear;
- possible interaction with manufacturer warranty terms;
- antivirus/SmartScreen detection and quarantine behaviour;
- UAC/elevated-helper and MSR behaviour;
- system stability and data-backup considerations;
- responsibility for the configured mining address and daemon;
- absence of guaranteed hashrate, profitability or rewards;
- software warranty/liability limitations subject to rights that cannot lawfully be excluded.

The user must actively check:

> I have read and understand the Mining Risk Acknowledgement above and choose to continue.

The available first-run actions are:

- **Exit** — closes the application without recording acknowledgement;
- **Acknowledge and Continue** — enabled only after the checkbox is selected.

The accepted acknowledgement version is stored locally as:

```text
safex-mine.mining-risk-acknowledgement-version
```

with the current value:

```text
1.0
```

If a later release materially changes the acknowledgement, incrementing the acknowledgement version will cause the updated notice to be shown once again.

After acceptance, the full notice remains available from the **Risk notice** control in the application header.

The repository copy of the notice is maintained in `docs/MINING_RISK_ACKNOWLEDGEMENT.md`.

## 2. Current first-run configuration model

The application does not use a separate configuration wizard or Settings screen.

After the Mining Risk Acknowledgement has been accepted, configuration is performed directly in the main interface. The user can start mining after supplying a valid Safex Cash address and confirming a reachable daemon.

## 3. Safex Cash mining address

The address field:

- accepts paste/input directly;
- trims surrounding whitespace on change;
- validates the address before mining can start;
- shows valid/invalid feedback;
- stores a valid address in local storage.

The Rust validator checks the Safex mainnet prefix and expected decoded address structure.

## 4. Daemon endpoint

Default:

```text
rpc.safex.org:17402
```

The user may replace this with a custom remote or LAN endpoint.

The application validates daemon availability and displays the current chain height when the endpoint is online.

While the app is idle/ready, a silent background daemon refresh keeps the displayed status reasonably current.

## 5. Mining mode

Available modes:

| Mode | CPU allocation hint |
|---|---:|
| Calm | 40% |
| Balanced | 70% |
| Full Bore | 100% |

The selected mode is stored in local storage and restored on the next application launch.

Balanced is the default when no valid saved mode exists.

## 6. Sound setting

The top-bar speaker button controls the block-found sound.

- sound is enabled by default;
- clicking the control toggles muted/unmuted state;
- the mute choice is stored in local storage;
- the preference survives application restarts.

Only the block-found celebration sound is affected.

## 7. Starting mining

When the acknowledgement has been accepted and the address/daemon are valid:

1. choose a mining mode;
2. press **Start Mining**;
3. Windows requests UAC approval for `safex-mine-helper.exe`;
4. the helper launches XMRig;
5. the UI transitions to MINING once the backend session is operating.

The whole Tauri GUI does not elevate.

## 8. Configuration locking while mining

While mining is active:

- the address field is locked;
- the daemon field is locked;
- mining-mode buttons are disabled;
- Start is unavailable;
- Stop remains available.

This avoids changing backend identity/connection settings underneath a running mining process.

## 9. Stop and restart

Pressing Stop:

- requests clean XMRig shutdown;
- keeps the application open;
- keeps current in-memory block/reject counters;
- keeps accumulated mining time;
- leaves the elevated helper available for a later Start in the same app session.

## 10. What persists across full application restart

Persisted:

- accepted Mining Risk Acknowledgement version;
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

## 11. Changing the address

The current implementation allows the address to be changed only while mining is stopped because the field is locked while mining.

When a newly validated address differs from the previously saved address, it begins a fresh in-memory mining session. **Blocks Found resets to 0, Rejected resets to 0, and accumulated mining time resets to 00:00:00.**

If that product rule changes before release, both the code and this document should be updated together.

## 12. Invalid/unavailable configuration

Mining is prevented or reported clearly when, for example:

- the Safex address is invalid;
- the daemon is unavailable;
- the helper cannot be launched;
- the XMRig executable is missing;
- the WinRing driver is missing;
- the backend fails during startup.

MSR failure is treated differently: mining may continue in degraded-performance mode.
