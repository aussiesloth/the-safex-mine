# The Safex Mine

**The Safex Mine** is a Windows desktop solo-mining application for **Safex Cash (SFX)**.

It provides a graphical interface around a Safex-compatible XMRig backend so users can configure a Safex Cash mining address, choose a CPU profile, connect to the default public daemon or a custom/LAN node, and monitor mining without managing XMRig from the command line.

> **Project status:** **v1.0.0 release candidate.** Core mining, telemetry, recovery behaviour, state-driven artwork, block-found sound, the versioned Mining Risk Acknowledgement and the NSIS release package have been validated. Clean-machine download, installation, mining, Defender recovery/full-scan and uninstall testing are complete.

## What it does

- Windows desktop GUI built with Tauri.
- Safex Cash solo mining using `rx/sfx`.
- Default public daemon: `rpc.safex.org:17402`.
- Optional custom or LAN daemon endpoint.
- Safex Cash address validation before mining starts.
- Three CPU allocation profiles:
  - **Calm** — 40%
  - **Balanced** — 70%
  - **Full Bore** — 100%.
- Live hashrate, worker-thread count, session time, accepted blocks and rejected results.
- Automatic detection of daemon loss and recovery.
- Recovery from unexpected mining-helper/backend failure.
- Split-privilege Windows design: the GUI remains non-administrative while a narrowly scoped helper is elevated for the mining backend.
- Windows Job Object protection so XMRig is terminated if the elevated helper unexpectedly disappears.
- Graceful XMRig shutdown using Ctrl+C, with forced termination only as a fallback.
- Five authored visual states:
  - READY / STOPPED
  - MINING
  - BLOCK FOUND
  - REJECTED
  - OFFLINE
- A short cash-register-style sound when a real block is found.
- Persistent sound mute/unmute control.

## Current interface

The visual layer is intentionally state-driven rather than continuously animated. The miner changes between authored scenes while the controls and statistics remain fixed.

Safex Cash rewards are represented as rectangular bullion bars using the Safex Cash note motif. Bars are visible on the table as previous finds, but are not exposed in the rock face. When a block is found, the miner holds a newly discovered bar aloft.

## Mining modes

| Mode | CPU allocation target | Intended use |
|---|---:|---|
| **Calm** | 40% | Lower load, heat and noise |
| **Balanced** | 70% | Strong performance with more system headroom |
| **Full Bore** | 100% | Highest CPU allocation available to the miner |

Mining performance varies by hardware. Full Bore uses the highest CPU allocation available to the miner, but this does not guarantee the highest hashrate on every system. CPU architecture, cache behaviour, power limits, thermal limits and laptop cooling can all affect efficiency. On some systems, particularly laptops, Balanced mode may produce a similar or higher hashrate with less heat and power use.

## Windows privilege model

The Safex Mine does **not** run the whole graphical application as Administrator.

On the first mining start of an application session:

1. the standard-user GUI creates a private local helper session;
2. Windows displays a UAC prompt for `safex-mine-helper.exe`;
3. the elevated helper launches and supervises the Safex XMRig backend;
4. XMRig attempts its Windows MSR optimisation;
5. the helper remains available for later Stop -> Start cycles during the same app session.

If Windows security features such as VBS/hypervisor protections prevent MSR writes, the miner can continue in degraded-performance mode rather than weakening Windows security.

See [Security and Privilege Model](docs/SECURITY_AND_PRIVILEGE_MODEL.md).

## Getting started

### Running from source

See [BUILDING.md](BUILDING.md) for the current Windows development-build process.

The repository intentionally does **not** contain the compiled XMRig executable or WinRing driver. A complete source build therefore includes preparing the pinned Safex XMRig backend and placing the required runtime files in `src-tauri/binaries/`.

### Packaged releases

The Windows release is **unsigned**. Users can inspect the public source and decide whether they are comfortable running the application. Because the package contains a CPU miner, elevated helper and WinRing driver, users should expect antivirus/endpoint-security products may block or quarantine part of the runtime and Windows SmartScreen may warn about the unsigned application. The project provides verification and narrowly scoped exclusion/restoration guidance, but never disables security software or adds antivirus exclusions automatically.

The packaged build bundles the elevated helper, XMRig backend, WinRing driver and licence notices into Tauri resources. The NSIS installer has completed clean-machine download, installation, mining, Defender full-scan and uninstall validation.

### Before installing

For the tested step-by-step Windows path, including SmartScreen and Microsoft Defender recovery/exclusion guidance, see the [Windows Installation Guide](docs/WINDOWS_INSTALLATION.md).

The Safex Mine is an unsigned mining application. The normal installation path is therefore likely to encounter one or more Windows/browser security warnings.

Before running the installer:

1. download it only from the official The Safex Mine GitHub release;
2. if the installer remains accessible after download, verify its published SHA-256 checksum before running it;
3. if antivirus immediately quarantines the installer and prevents checksum verification, restore/allow that specific installer first, then verify its SHA-256 against the checksum published on the official release **before executing it**;
4. expect the browser to warn about or block an uncommon/unverified executable;
5. expect Microsoft Defender or another antivirus product may quarantine the installer or one of the mining runtime files;
6. the validated default install folder is `%LOCALAPPDATA%\The Safex Mine`; if an exclusion is required, exclude **only that dedicated folder**.

Do **not** exclude the whole Downloads folder, user profile or drive.

In the clean-machine Microsoft Defender test, the installer completed without disabling real-time protection. SmartScreen required **More info -> Run anyway**, Defender quarantined the installer and bundled XMRig backend, and restoring those expected files plus excluding only `%LOCALAPPDATA%\The Safex Mine` allowed mining to run normally. Temporarily pausing real-time scanning should therefore be treated only as a fallback for products that cannot complete this restore/exclusion workflow.

If the installer is quarantined immediately after download, restore/allow that specific installer and then verify its SHA-256 before running it. If an expected runtime file is quarantined after installation, confirm that its filename/path matches an expected The Safex Mine component, restore it using the antivirus product's normal controls, then verify the restored file where a published component checksum is available. See [Troubleshooting](TROUBLESHOOTING.md) for the recovery guidance.

After uninstalling, remove any Defender exclusion you created for `%LOCALAPPDATA%\The Safex Mine`; the uninstaller removes the application folder but does not alter user-created antivirus settings.


## Default use

1. Enter a valid Safex Cash mining address.
2. Leave the default daemon in place or enter a custom/LAN endpoint.
3. Select Calm, Balanced or Full Bore.
4. Press **Start Mining**.
5. Approve the UAC prompt for the elevated helper.
6. Monitor hashrate, threads, session time and block/reject counters.
7. Press **Stop Mining** to stop XMRig cleanly.

Stop -> Start retains the current in-memory session counters and accumulated mining time. Changing the saved Safex address to a different valid address while stopped starts a fresh in-memory mining session: Blocks Found, Rejected and accumulated mining time all reset to 0. A full application restart also starts a new session.

## Branding and project status

The Safex/Safex Cash branding used in this application has been permitted for this project. That permission does **not** make The Safex Mine an official Safex desktop distribution, and it does not imply that Safex signs, publishes, maintains or supports the application.

The Safex Mine should therefore be described as a **community Safex Cash mining application**.

See [Branding](docs/BRANDING.md).

## Repository documentation

- [Windows Installation Guide](docs/WINDOWS_INSTALLATION.md)
- [Building from Source](BUILDING.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security and Privilege Model](docs/SECURITY_AND_PRIVILEGE_MODEL.md)
- [Mining Engine Integration](docs/MINING_ENGINE_INTEGRATION.md)
- [Configuration and First Run](docs/CONFIGURATION_AND_FIRST_RUN.md)
- [Session and Event Model](docs/SESSION_AND_EVENT_MODEL.md)
- [Visual State System](docs/VISUAL_STATE_SYSTEM.md)
- [Product Behaviour and Scope](docs/PRODUCT_SPEC.md)
- [Assets](docs/ASSETS.md)
- [Testing and Release](docs/TESTING_AND_RELEASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Branding](docs/BRANDING.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Security Reporting](SECURITY.md)
- [Third-Party Notices](THIRD_PARTY_NOTICES.md)
- [Changelog](CHANGELOG.md)

## Mining backend

The Windows backend uses the project-maintained Safex-compatible fork at `aussiesloth/safex-xmrig`.

Source provenance:

- canonical Safex Mine backend: `aussiesloth/safex-xmrig`;
- upstream Safex-compatible fork: `galicone/xmrig`;
- original XMRig project: `xmrig/xmrig`.

Pinned source commit:

```text
3a5617f99a858614dc0c5897fc44c1bdb2618cca
```

The app launches the backend with the Safex RandomX algorithm (`rx/sfx`) and the selected CPU allocation profile.

## Licensing and third-party components

The application uses third-party open-source components, including the Safex-compatible XMRig backend and Rust/JavaScript libraries. Those components retain their own licences and attribution requirements.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The Safex Mine application code is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. See [LICENSE](LICENSE).
