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

The repository copy of the published English v1.0 notice is maintained in `docs/MINING_RISK_ACKNOWLEDGEMENT.md`.

## Current multilingual first-run implementation on main (unreleased v1.1.0 development)

The current `main` branch implements a language selector on the **first-run Mining Risk Acknowledgement before the user accepts** and in the main interface thereafter. It displays native language names without flags. Language-resolution priority is: saved manual override; best enabled match from Windows preferred UI languages; appropriate language/script fallback; canonical `en-AU`. “Use Windows language” removes the manual override.

The selected enabled language controls both the dialog chrome and its complete version-consistent acknowledgement text. English remains an available reference/fallback. Switching language must not implicitly record acceptance, reset the checkbox/acceptance version improperly, modify the mining address, daemon, CPU mode, sound preference or ongoing mining session, or force a different regional number/date convention.

Current `main` has canonical English plus **23 release-enabled translated LTR locales**, all with complete UI/accessibility/status and acknowledgement content and completed translation-quality review. This is the current v1.1.0 release set, not a permanent language limit. Developer-only `en-XA`, deferred Serbian Cyrillic (`sr-Cyrl`) and Traditional Chinese (`zh-Hant`) are not ordinary release choices. RTL is optional future work and is not a v1.1.0 prerequisite. The published v1.0.0 installer remains unchanged and does not contain this multilingual implementation.

The published v1.0.0 Risk Acknowledgement acceptance marker remains version `1.0`. Merely adding translations or correcting translation phrasing does not create a new acknowledgement version; assess any canonical English wording clarification separately under the substantive-change rule. Existing acceptance is preserved unless that rule actually requires a new version. The original published v1.0.0 release assets are not retroactively altered.

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

Current `main` additionally persists an explicit UI-language override (or its removal when using Windows language); this behaviour is part of the unreleased v1.1.0 development line and was not part of the published v1.0.0 installer.

Not persisted:

- Blocks Found counter;
- Rejected counter;
- accumulated mining/session time;
- transient visual state.

A new application launch begins a new mining session.

## 11. Changing the address

The current implementation allows the address to be changed only while mining is stopped because the field is locked while mining.

When a newly validated address differs from the previously saved address, it begins a fresh in-memory mining session. **Blocks Found resets to 0, Rejected resets to 0, and accumulated mining time resets to 00:00:00.**

If that product rule changes in a future release, both the code and this document should be updated together.

## 12. Invalid/unavailable configuration

Mining is prevented or reported clearly when, for example:

- the Safex address is invalid;
- the daemon is unavailable;
- the helper cannot be launched;
- the XMRig executable is missing;
- the WinRing driver is missing;
- the backend fails during startup.

MSR failure is treated differently: mining may continue in degraded-performance mode.

### L7a coverage

L7a added selectable app UI and first-run acknowledgement languages `fr`, `it`, `nl`, `pl`, `pt-BR`, `pt-PT`, `tr`, `hu`, and `sl`. Windows first-run language switching, persistence and acknowledgement continuity were confirmed before PR #12 was merged. These languages are not contained in the published v1.0.0 installer.

### L7b coverage

L7b added selectable app UI and first-run acknowledgement languages Russian (`ru`), Ukrainian (`uk`) and Greek (`el`). Windows Cyrillic/Greek rendering, first-run switching, persistence, acknowledgement continuity and a targeted live-mining language switch were confirmed before PR #13 was merged. Acceptance version and storage remain unchanged.

### L7c coverage

L7c added selectable app UI and first-run acknowledgement languages Indonesian (`id`), Vietnamese (`vi`) and Filipino (`fil`). Windows Latin-script wrapping, Vietnamese diacritic/font/line-height rendering, natural Filipino terminology, first-run switching, persistence, acknowledgement continuity and a targeted live-mining language switch were confirmed before PR #14 was merged. Acceptance version and storage remain unchanged.

### L7d completed coverage

L7d added selectable app UI and first-run acknowledgement languages Korean (`ko`), Hindi (`hi`) and Bengali (`bn`). Acceptance version and storage remain unchanged. Windows Hangul/Devanagari/Bengali font fallback and shaping, line height, wrapping/text measurement, first-run language switching, persistence, acknowledgement continuity and a targeted live-mining language switch were confirmed before PR #15 was merged.

### Translation-quality audit

After L7d, all 23 release-enabled translated locales plus the complete developer-only Serbian Cyrillic translation were reviewed directly against canonical `en-AU` for UI/accessibility/status wording and Mining Risk Acknowledgement v1.0 semantics. PR #16 recorded the completed audit and conservative corrections. These remain AI-assisted community-project translations rather than native-speaker, professional or legal certification; language and terminology corrections remain welcome. Translation-only corrections that preserve canonical meaning do not by themselves change acknowledgement version `1.0` or invalidate previous acceptance.
