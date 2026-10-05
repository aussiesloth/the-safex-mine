# Testing and Release

## 1. Purpose

The Safex Mine should be released only after the installed application, mining backend, privilege model and recovery paths work together on clean Windows systems.

This file retains historical v1.0.0 development/release validation and documents the distinct planned v1.1.0 localisation release gate. The public v1.0.0 Windows installer was published on 18 September 2026.

## 2. Development validation completed

### Mining

Development testing has confirmed:

- real Safex Cash mining through the integrated XMRig backend;
- live hashrate/thread telemetry;
- Calm/Balanced/Full Bore profile changes;
- normal Stop -> Start behaviour;
- multiple real accepted blocks;
- frontend accepted-block counter tracking.

### Real block-found presentation

A real accepted block has been observed end-to-end with:

- Blocks Found increment;
- BLOCK FOUND scene transition;
- block-found cash-register sound.

This confirms that the audio/visual celebration is attached to the real accepted-block event path rather than only to a simulator.

### MSR paths

Development has exercised both:

- hardware/system where XMRig MSR optimisation succeeds;
- hardware/system where Windows security prevents MSR writes and mining continues in degraded mode.

### Daemon loss/recovery

Development testing has exercised live network loss while mining:

- XMRig remains alive;
- GUI enters OFFLINE;
- hashrate goes to zero;
- reconnection resumes MINING without launching a new helper.

### Helper process protection

Development testing has verified that terminating the elevated helper causes the Job Object to terminate XMRig.

### Backend/helper failure recovery

Unexpected session failure has been exercised so the frontend can leave MINING, discard the dead session and allow a fresh Start.

### Mining Risk Acknowledgement

Development validation has confirmed the versioned first-run acknowledgement flow:

- a fresh profile shows **Mining Risk Acknowledgement — Version 1.0** before the mining interface can be used;
- **Exit** closes the application without recording acceptance;
- **Acknowledge and Continue** requires the checkbox and then loads the miner interface;
- reopening the application after acceptance does not show the first-run gate again;
- the **Risk notice** control remains available in the top bar and reopens the full acknowledgement on demand.

Clean-machine packaged-build validation confirmed the same first-run acknowledgement behaviour after installation.

### Windows package generation

`npm run tauri:build` has completed successfully on Windows after the release target was narrowed to NSIS only. The build produced exactly one Windows bundle:

```text
src-tauri\target\release\bundle\nsis\The Safex Mine_0.1.0_x64-setup.exe
```

The public release model is deliberately **NSIS-only**. `src-tauri/tauri.release.conf.json` targets `nsis`; MSI is not part of the public release model.

The SHA-256 recorded for that historical clean-machine pre-release test artefact is:

```text
584DF8E7E83BEA4FF40B3DF24B5A565ACA6AED2D7651522DB9D24D27AF6A44D4
```

This checksum identifies only the historical pre-release installer selected for clean-machine validation; it must not be used to verify the published v1.0.0 installer. The public installer `The-Safex-Mine_1.0.0_x64-setup.exe` and `SHA256SUMS.txt` were published at the [v1.0.0 release](https://github.com/aussiesloth/the-safex-mine/releases/tag/v1.0.0). Its published installer SHA-256 is `87CC3E39639CCA4C34E3C552187FF80A5274708E517A07761DE142CEBF891B8E`.

Successful NSIS-only bundle generation and clean-machine installation/security behaviour were confirmed before the public v1.0.0 release. The release was subsequently tagged and published; those are no longer outstanding tasks.

## 3. Historical v1.0.0 release preparation and optional evidence

### Real rejection case

The rejection UI/parser path has been exercised through development/simulation, but a naturally occurring real rejected Safex result has not yet been relied upon as the primary validation case.

If a naturally occurring real rejection is encountered, capture and retain it as additional evidence; it is not a v1.0.0 release blocker.

### Clean-machine installer test

A clean Windows test machine with no development toolchain has successfully exercised the NSIS installer.

Observed:

- GitHub-hosted installer downloaded successfully;
- SmartScreen displayed **Windows protected your PC** / **Unknown publisher** and allowed continuation through **More info -> Run anyway**;
- NSIS installed to `%LOCALAPPDATA%\The Safex Mine`;
- installation completed successfully;
- Microsoft Defender quarantined the downloaded installer as `Trojan:Win32/Bearfoos.A!ml`;
- Microsoft Defender quarantined the packaged XMRig backend as `Trojan:Win64/HashvaultMiner.A`;
- restoring both expected files and excluding only `%LOCALAPPDATA%\The Safex Mine` allowed the installed miner to run normally;
- no helper or WinRing quarantine was observed in this test.
- first installed launch presented Mining Risk Acknowledgement v1.0 as intended;
- Start Mining produced UAC specifically for `safex-mine-helper.exe`;
- Stop -> Start in the same app session reused the already elevated helper without a second UAC prompt.

Uninstall subsequently completed without UAC and removed `%LOCALAPPDATA%\The Safex Mine`; the manually created Defender exclusion remained and must be removed separately by the user.

### Packaged path validation

The release configuration maps the helper, XMRig and WinRing driver into the installed `runtime/` resource directory. The clean-machine installed build successfully launched the packaged helper and mined with the packaged XMRig backend without any source-tree development files.

The NSIS package contains:

- `runtime/safex-mine-helper.exe`;
- `runtime/safex-xmrig-x86_64-pc-windows-msvc.exe`;
- `runtime/WinRing0x64.sys`;
- bundled licence/notices;
- scene/branding/audio assets.

WinRing/MSR success and blocked-MSR degraded behaviour were also exercised during development on different Windows systems.

### Antivirus / SmartScreen

The release contains components that antivirus/endpoint-security products commonly classify or quarantine: the CPU-mining backend, elevated helper and WinRing driver. Treat AV intervention as an expected release scenario that must be tested and documented rather than as an exceptional user error.

Observed with Microsoft Defender on the clean test machine:

- SmartScreen blocked first execution until **More info -> Run anyway** was selected;
- the installer reported **Unknown publisher**;
- the installed path was `%LOCALAPPDATA%\The Safex Mine`;
- Defender quarantined the downloaded installer as `Trojan:Win32/Bearfoos.A!ml`;
- Defender quarantined the installed XMRig backend as `Trojan:Win64/HashvaultMiner.A`;
- restoring the two expected files and excluding only the installation folder allowed mining to run normally;
- disabling Defender real-time protection was **not** required.
- a subsequent manual Defender **Full scan** left the restored runtime intact while the narrow install-folder exclusion remained in place.

Release documentation requirements:

- the application does not disable antivirus, change antivirus settings or create exclusions itself;
- a manual Microsoft Defender Full scan completed with the narrow `%LOCALAPPDATA%\The Safex Mine` exclusion in place and did not re-detect or remove the restored runtime;
- temporary real-time-scanning suspension remains a documented fallback only for products that cannot complete the verified restore/exclusion flow;
- the six captured clean-machine screenshots are included in `docs/WINDOWS_INSTALLATION.md`.

User guidance must distinguish between an installer quarantined immediately after download and runtime files quarantined after installation. If the installer cannot be hashed while in quarantine, the user may need to restore/allow that specific installer first and then verify its SHA-256 **before executing it**. For runtime files, guidance should require confirmation that the detected filename/path matches an expected component, followed by checksum verification after restoration where a published component checksum is available. It should warn against broad exclusions such as Downloads, a user profile or an entire drive, and against leaving real-time protection disabled.

## 4. Functional release checklist (historical v1.0.0 snapshot)

The entries below record the earlier development/packaging evidence. Any unchecked optional or visual tests are historical context, not evidence that v1.0.0 is still awaiting publication. The v1.1.0 localisation gate is defined separately in section 9.

- [x] fresh development profile is blocked by Mining Risk Acknowledgement until accepted;
- [x] acknowledgement Exit action closes the development app without persisting acceptance;
- [x] acknowledgement version persists after acceptance and suppresses repeat display in development;
- [x] Risk notice control reopens the full acknowledgement after acceptance in development;
- [x] packaged/installed first-run acknowledgement appears and behaves correctly;
- [x] valid Safex address accepted;
- [ ] optional explicit invalid-address UI regression check if convenient (not a v1.0.0 release blocker);
- [x] changing to a different valid address while stopped resets the session (Blocks Found and Session demonstrated live; Rejected uses the same reset path);
- [x] default public daemon works;
- [ ] optional additional end-to-end custom/LAN daemon check (not a release blocker);
- [x] Calm = 40%;
- [x] Balanced = 70%;
- [x] Full Bore = 100%;
- [x] hashrate displayed;
- [x] thread count displayed;
- [x] session timer behaves across Stop -> Start;
- [x] Stop shuts XMRig down in the installed build;
- [x] Start after Stop reuses helper in the same installed app session without another UAC prompt;
- [x] daemon loss enters OFFLINE;
- [x] daemon reconnection resumes MINING;
- [x] helper crash cannot orphan XMRig;
- [x] accepted block increments once;
- [x] BLOCK FOUND scene appears;
- [x] block-found sound plays once when unmuted;
- [x] mute preference survives restart;
- [x] rejected-result parser/UI path increments and returns to mining in development/simulation; a naturally occurring live rejection remains optional evidence;
- [x] full app restart resets session counters.

## 5. Visual release checklist (historical v1.0.0 snapshot)

- [ ] all five scene images load;
- [ ] scene crossfade does not move the fixed UI;
- [ ] no duplicate/baked-in Safex wordmark;
- [ ] Safex header wordmark is crisp;
- [ ] table reward objects are rectangular Safex Cash bars;
- [ ] no bars are visibly embedded in the ore wall;
- [ ] BLOCK FOUND miner holds a bar;
- [ ] OFFLINE pose clearly differs from READY;
- [ ] speaker icon correctly reflects mute state;
- [ ] Mining Risk Acknowledgement fits and scrolls correctly at supported window sizes in the packaged build;
- [ ] custom application icon appears correctly in the executable, taskbar, Start menu and NSIS installer surfaces;
- [ ] custom application icon remains recognisable at small Windows icon sizes;
- [ ] resizing does not crop critical scene content.

## 6. Privilege/security checklist

- [x] GUI starts non-elevated in the installed build;
- [x] acknowledgement Exit uses only the narrowly granted window-close capability;
- [x] UAC prompt is for `safex-mine-helper.exe`;
- [x] packaged helper launches from installed runtime resources;
- [x] packaged helper finds packaged XMRig beside it; WinRing is bundled at the same runtime path;
- [ ] denied UAC is handled cleanly;
- [x] MSR success path exercised during development;
- [x] MSR-blocked path degrades rather than preventing mining;
- [x] helper pipe remains local/authenticated;
- [x] Job Object assignment succeeds;
- [x] helper termination kills XMRig;
- [x] graceful Ctrl+C stop works;
- [x] no code disables antivirus/VBS automatically.

### Documentation screenshots

The tested Windows installation flow is documented in `docs/WINDOWS_INSTALLATION.md` using six clean-machine screenshots:

- SmartScreen initial warning;
- SmartScreen expanded details;
- NSIS install location;
- Defender installer detection;
- Defender XMRig detection;
- Windows Security route into the Exclusions controls.

The GitHub release page, Mining Risk Acknowledgement and helper UAC steps are documented textually and do not require screenshots for the current release guide.

### Licence/notices status

Mechanical checks confirm that the project GPL-3.0 file, GPL-3.0-only package metadata, `THIRD_PARTY_NOTICES.md`, and the exact WinRing0 redistribution notice are present and mapped into the release bundle. The locked Windows dependency graph has now been audited with zero missing licence metadata. The release build regenerates and bundles `THIRD_PARTY_LICENSES/DEPENDENCY_LICENSES.txt` from package-provided licence/notice files. `THIRD_PARTY_LICENSES/PACKAGE_ATTRIBUTIONS.md` supplies package-specific fallback attribution/source details for the small set of published crate archives without a root licence file, and exact-version source locations are documented for the MPL-2.0 components.

## 7. Release artefacts

The v1.0.0 public-release model (now published):

- one unsigned Windows NSIS `-setup.exe` installer;
- versioned release notes;
- SHA-256 checksum for that installer;
- source repository/tag;
- third-party notices/licence bundle;
- XMRig corresponding-source reference;
- known issues;
- troubleshooting link.

MSI is not part of the public release set.

## 8. Versioning

The first public release is **v1.0.0**, published on **18 September 2026**. The `0.1.0` installer and SHA-256 recorded earlier in this document are historical clean-machine validation artefacts only and are **not** the public v1.0.0 release checksum. Verify the published version using its release-page checksum / `SHA256SUMS.txt`.

L1-L8 intentionally retained project/package version 1.0.0 during localisation development. The approved L9 release-hardening slice advances the application, Tauri, Rust application, helper and corresponding lockfile versions consistently to 1.1.0. Mining Risk Acknowledgement remains independently versioned at 1.0.

## 9. v1.1.0 localisation validation and release gate — current status

Localisation implementation through L7d and the subsequent translation-quality audit are complete. L8 adds the multilingual NSIS configuration and essential translated public installation/first-use documentation for the same canonical `en-AU` plus **23 release-enabled translated LTR locales**. L8 Windows packaged acceptance was completed on 6 October 2026. L9 release hardening is now in progress with application/package/helper versions aligned at 1.1.0 while Mining Risk Acknowledgement remains version 1.0. No v1.1.0 tag/release exists yet.

The revised governing programme (5 October 2026) imposes **no permanent language count or fixed release maximum**. Test and enable only locales that are **actually complete and approved for the particular release**, using the enabled locale registry and provenance records; a proposed locale is not a mandatory release gate or an excuse to enable partial content.

### L8 installer/public-document implementation and acceptance

The L8 source configuration targets one NSIS installer with **22 installer languages total**: English plus 21 translated installer languages. Filipino and Bengali intentionally use English installer fallback because the NSIS 3.11 language set used by Tauri CLI 2.11.4 does not contain Filipino/Tagalog or Bengali. The application itself continues to provide both languages after launch.

Seven NSIS languages require project-maintained Tauri-specific message files: Serbian Latin, Polish, Hungarian, Slovenian, Greek, Indonesian and Hindi. The remaining translated installer languages use Tauri's bundled custom-message translations. `displayLanguageSelector` remains false so Windows chooses the installer language automatically.

The public-document layer contains 23 translated essential installation/first-use guides under `docs/localised/`, while English remains canonical. GPL-3.0 and third-party licence texts remain untranslated by design.

The L8 conformance logic is now release-generic. `npm run i18n:check` invokes it automatically; it is also available as `npm run release:check`, while `npm run l8:check` remains a compatibility alias. It checks the enabled locale registry against the installer manifest, the configured NSIS language set, all seven custom Tauri message files and required placeholders, all 23 translated installation guides, the two documented English fallbacks, consistent application/Tauri/Rust/helper versioning and Mining Risk Acknowledgement remaining 1.0.

Windows packaged acceptance completed on **6 October 2026** against the L8 branch. The final production-configuration validation build generated exactly one NSIS installer:

```text
The Safex Mine_1.0.0_x64-setup.exe
```

Validation-build SHA-256:

```text
64F6C037808227B7C5C910898E83331AF2A2DD04834BE96A456DEBB9A2980513
```

This hash identifies the local L8 validation artefact only. It is **not** a published v1.1.0 release checksum and must not be substituted for the later L9 release-candidate checksum.

Automated/build results on the Windows development machine:

- `npm ci`: passed; 0 reported npm vulnerabilities;
- `npm run i18n:check`: passed, including L8 validation of 22 NSIS languages, 23 translated installation guides and 2 documented English installer fallbacks;
- `npm run build`: passed;
- `cargo test --manifest-path .\\src-tauri\\Cargo.toml`: 12/12 tests passed;
- `cargo fmt --manifest-path .\\src-tauri\\Cargo.toml --check`: passed;
- required XMRig and WinRing runtime files were present;
- `npm run tauri:build`: passed and produced one Windows x64 NSIS bundle;
- regenerated `THIRD_PARTY_LICENSES/DEPENDENCY_LICENSES.txt` had no substantive Git diff and was restored to the committed form after the build.

Physical Windows acceptance:

- normal production configuration (`displayLanguageSelector: false`) opened directly in English on the English Windows test machine with no language picker;
- GPL page remained authoritative English while installer chrome followed the selected installer language;
- default per-user install path remained `%LOCALAPPDATA%\\The Safex Mine`;
- Microsoft Defender quarantined the installed XMRig backend as `Trojan:Win64/HashvaultMiner.A`; the specific expected XMRig file was restored and the narrow install-folder exclusion was used without disabling Defender or creating a broad exclusion;
- installer quarantine itself was not re-induced during L8 because the local repository/build path was already excluded from Defender; the earlier v1.0.0 clean-machine test remains the installer-quarantine evidence;
- first-run Mining Risk Acknowledgement appeared before the mining UI, remained version 1.0, and allowed language selection before acceptance;
- packaged German Risk Acknowledgement live-switch rendered correctly before acceptance;
- with the public RPC temporarily unavailable for external/node-maintenance reasons, packaged mining acceptance used the user's live local daemon instead;
- valid Safex address and local daemon validation succeeded; Calm mining produced live telemetry (approximately 8.01 kH/s and 13 threads on the test machine);
- first mining start produced UAC for `safex-mine-helper.exe`; same-session Stop -> Start reused the elevated helper with no second UAC;
- Safex address and RPC fields were locked while mining;
- language switching while mining did not disturb mining state;
- MSR-unavailable mode degraded correctly rather than preventing mining;
- uninstall completed without UAC, removed the application folder when **Delete the application data** was selected, and left the manually-created Defender exclusion intact for manual cleanup;
- a temporary, uncommitted `displayLanguageSelector: true` build exposed all 22 configured installer languages for visual acceptance;
- Filipino and Bengali were correctly absent from the NSIS picker, matching their documented English-installer fallback;
- European Portuguese and Brazilian Portuguese showed visibly distinct installer wording;
- Simplified Chinese and Greek welcome pages rendered cleanly;
- Hindi fresh install rendered cleanly through welcome, GPL chrome, install path, progress and finish pages;
- a second Hindi installer run exercised the project-custom Tauri maintenance strings (already installed, add/reinstall, uninstall), and the Hindi uninstaller exercised the custom **Delete application data** string;
- after those tests the picker flag was restored to `false` and the final production-configuration installer was rebuilt.

This acceptance is proportionate to L8's installer/document scope. It does not repeat the full L6/L7 mining, daemon-loss or translation regression suites because L8 changes no mining implementation source.

Before approving v1.1.0, L9 reuses the completed L8 physical functional/localisation acceptance rather than repeating it. L9 must verify by automation/source review that the enabled locale registry, catalogues, placeholders, Risk Acknowledgement v1.0 structure, fallback/matching configuration, installer-language mapping, packaged helper/XMRig/WinRing resources and project/third-party licence materials remain intact. It must also complete `npm ci`, `npm run i18n:check`, `npm run release:check`, the frontend build, relevant Rust tests/formatting, licence audit and a production NSIS package build.

The only additional L9 physical Windows gate is one final candidate **installation and uninstall validation**. Confirm that the generated v1.1.0 NSIS installer completes normally, the installed application launches, the expected application version is presented by the packaged build, and uninstall completes normally. The broader language-switching, mining, helper-UAC, MSR/degraded-mode, first-run and multilingual-installer behaviour remains supported by the completed L8 acceptance record because L9 does not change those functional paths.

RTL delivery or testing is **not required** for v1.1.0 or a later release under this programme. Retain direction metadata for any separately approved future feasibility work; an unsupported RTL locale must not block an otherwise ready LTR release. The developer-only pseudo-locale `en-XA`, deferred `sr-Cyrl` and `zh-Hant`, and incomplete/review-only languages must not be exposed as release choices merely to meet a planned total.

Do not create a tag, publish a GitHub release, or modify existing v1.0.0 assets during the development slices. After the L9 PR is merged and final tests are approved, present the release title, notes, exact tagged commit, expected NSIS installer, checksum filename and publication checklist for explicit authorisation before publishing.


### L7a acceptance matrix — nine Latin-script locales

On the L7a branch, run `npm ci`, `npm run i18n:check`, `npm run build`, and `cargo test --manifest-path .\\src-tauri\\Cargo.toml`. Run the Tauri development application using `npm run tauri dev` on the Windows MSVC development system with the existing helper/XMRig resources. Record actual local command outcomes in the PR before merge; connector-side structural review is not a substitute for a Windows build.

| Focus | Manual check |
| --- | --- |
| Every L7a locale | Main dashboard, all mode names, Start/Stop, tooltips, translated statuses, Risk Notice and first-run acknowledgement |
| Narrow window | Minimum configured 900 × 650, including long French, Polish, Hungarian and Slovenian labels; no clipping or unintentional mid-word breaks |
| Portuguese | Switch between `pt-BR` and `pt-PT`; check genuinely regional vocabulary; confirm both persist independently |
| Diacritics | French punctuation; Polish ł/ą/ę/ś/ź/ż; Turkish İ/ı/ğ/ş/ç/ö/ü; Hungarian ő/ű; Slovenian č/š/ž |
| Risk Acknowledgement | All seven section headings, five hardware list items, highlighted statutory-rights paragraph, complete scrolling, footer buttons, stable title/language-selector layout at normal desktop sizes, no checkbox reset merely from switching language |
| Language selection | First-run language switch before acceptance, Windows/default override, explicit override after restart and document `lang`; no change to regional telemetry formatting |
| Existing acceptance | A profile with stored acknowledgement `1.0` must not be prompted again after the UI changes language |
| Technical fields | Addresses, RPC/daemon endpoints, version strings, block heights, rates, UAC/MSR/XMRig references remain readable and unchanged in meaning |
| Targeted mining | In one selected L7a locale: valid address and daemon, Start → helper UAC → actual hashrate/threads → Stop; switch language during mining and check telemetry and settings remain intact |

L6's exhaustive MSR/degraded-recovery/daemon-disconnect regression is not required again unless source review detects a mining-related change. Do not change the v1.0.0 release artefacts, generate a new installer or bump versions during L7a.


### L7b acceptance matrix — Cyrillic and Greek

On the L7b branch, run `npm ci`, `npm run i18n:check`, `npm run build`, `cargo test --manifest-path .\\src-tauri\\Cargo.toml`, and `cargo fmt --manifest-path .\\src-tauri\\Cargo.toml --check`. Run `npm run tauri dev` on the Windows MSVC development system.

| Focus | Manual check |
| --- | --- |
| Russian | Main dashboard, translated mode/status/error labels, Cyrillic line-height and whole-word wrapping |
| Ukrainian | Main dashboard plus correct rendering of Ukrainian-specific Cyrillic characters present in the catalogue, including `І/і`, `Ї/ї` and `Є/є`; no accidental substitution or clipping |
| Greek | Main dashboard plus accented Greek vowels, uppercase scene labels, line-height and font fallback |
| Mining modes | Confirm content-aware horizontal/vertical orientation responds to translated labels rather than script or fixed width |
| Risk Acknowledgement | For all three locales: title/selector layout, all seven sections, final liability/GPL section, highlighted statutory-rights paragraph, scrolling and footer controls |
| First run | In the longest/stress locale: language switching before acceptance, checkbox remains unticked, Continue enables only after selection |
| Persistence | Explicit locale survives restart; existing acknowledgement `1.0` remains accepted |
| Technical fields | Safex address, RPC/daemon endpoint, UAC/MSR/XMRig, version and telemetry remain legible and unchanged |
| Targeted mining | In one L7b locale: Start → UAC → live telemetry → language switch → Stop; settings and mining state remain intact |

The existing Serbian Cyrillic developer-only locale remains useful as a comparison but is not a release acceptance target. Do not repeat the exhaustive unchanged L6 mining/MSR/daemon-loss suite unless implementation review identifies a mining-related change.

### L7c acceptance matrix — Southeast Asian Latin-script locales

On the L7c branch, run `npm ci`, `npm run i18n:check`, `npm run build`, `cargo test --manifest-path .\\src-tauri\\Cargo.toml`, and `cargo fmt --manifest-path .\\src-tauri\\Cargo.toml --check`. Run `npm run tauri dev` on the Windows MSVC development system.

| Focus | Manual check |
| --- | --- |
| Indonesian | Main dashboard, translated mode/status/error labels, normal modern Indonesian software terminology and whole-word wrapping |
| Vietnamese | Main dashboard plus the full set of Vietnamese diacritics actually used by the catalogue/acknowledgement, including stacked letter/tone marks and upper-/lower-case forms present; check font fallback, line height, clipping and accidental mark loss |
| Filipino | Main dashboard plus natural contemporary Filipino/Taglish terminology; retained technical English should read naturally rather than appearing as untranslated omissions |
| Main UI states | Inspect ready/stopped, active mining and transient block/reject/offline/status presentation as proportionate to the available test controls; translated labels must not clip or disturb technical fields |
| Mining modes | Confirm content-aware horizontal/vertical orientation responds to translated labels rather than locale-specific CSS or a fixed width |
| Risk Acknowledgement | For all three locales: title/selector layout, all seven sections, five hardware list items, final liability/GPL section, highlighted statutory-rights paragraph, scrolling and footer controls |
| First run | Switch among all three L7c languages before acceptance; checkbox remains unticked and Continue enables only after explicit selection |
| Persistence | Explicit locale survives restart; existing acknowledgement `1.0` remains accepted |
| Windows matching | Representative `id-ID → id`, `vi-VN → vi`, and `fil-PH → fil`; manual selection remains available |
| Technical fields | Safex address, RPC/daemon endpoint, UAC/MSR/XMRig, version, block height and telemetry remain legible and unchanged |
| Targeted mining | In one L7c locale: Start → UAC → live telemetry → language switch while mining → Stop; Safex address, daemon, mining mode, sound preference and mining state remain intact |

The existing L6/L7a/L7b responsive layout is the baseline. Prefer a general responsive fix if L7c reveals a real wrapping or line-height defect; do not add locale-specific CSS merely to force a preferred presentation. Do not repeat the exhaustive unchanged L6 mining/MSR/degraded/daemon-loss suite unless implementation review identifies a mining-related change.

### L7d acceptance matrix — Korean, Hindi and Bengali (completed 5 October 2026)

L7d passed `npm ci`, `npm run i18n:check`, `npm run build`, `cargo test --manifest-path .\\src-tauri\\Cargo.toml`, and `cargo fmt --manifest-path .\\src-tauri\\Cargo.toml --check`, followed by physical `npm run tauri dev` acceptance on the Windows MSVC development system.

| Focus | Manual check |
| --- | --- |
| Korean | Main dashboard and full Risk Acknowledgement; Hangul glyph fallback, line height, punctuation, wrapping and text measurement must remain clean |
| Hindi | Devanagari conjuncts and vowel signs/matras render in the correct visual order with no clipping, broken shaping or detached marks; inspect long status/error strings and acknowledgement paragraphs |
| Bengali | Bengali conjuncts, vowel signs and reordering render correctly with no clipping or mark loss; inspect both compact controls and long acknowledgement text |
| Main UI states | Inspect ready/stopped, active mining and transient block/reject/offline/status presentation; translated labels must not disturb technical fields |
| Mining modes | Confirm content-aware horizontal/vertical orientation responds to translated labels and measured text rather than locale-specific CSS |
| Risk Acknowledgement | For all three locales: title/selector layout, all seven sections, five hardware list items, final liability/GPL section, highlighted statutory-rights paragraph, scrolling and footer controls |
| First run | Switch among all three L7d languages before acceptance; checkbox remains unticked and Continue enables only after explicit selection |
| Persistence | Explicit locale survives restart; existing acknowledgement `1.0` remains accepted |
| Windows matching | Representative `ko-KR → ko`, `hi-IN → hi`, `bn-BD → bn` and `bn-IN → bn`; manual selection remains available |
| Technical fields | Safex address, RPC/daemon endpoint, UAC/MSR/XMRig, version, block height and telemetry remain legible and unchanged |
| Targeted mining | In one L7d locale: Start → UAC → live telemetry → language switch while mining → Stop; Safex address, daemon, mining mode, sound preference and mining state remain intact |

The L7d physical pass confirmed the existing responsive layout handles the three new scripts without locale-specific styling. The documented first-run, persistence, complete Risk Acknowledgement and targeted live-mining checks passed. The exhaustive unchanged L6 mining/MSR/degraded/daemon-loss suite was not repeated because L7d did not alter mining implementation.


### Translation-quality audit acceptance — existing localisations

This audit is content-only. It does not alter mining logic, the helper/XMRig/MSR implementation, locale enablement, acknowledgement acceptance semantics or application/package versioning.

**Automated validation completed 5 October 2026:** all required commands passed on the Windows development system.

Run the normal validation gate:

```powershell
npm ci
npm run i18n:check
npm run build
cargo test --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml --check
```

**PASS (5 October 2026):** `npm ci` completed with 0 vulnerabilities; `npm run i18n:check` passed for 26 locales / 104 keys / 83 frontend references / 1 Risk Acknowledgement version; `npm run build` completed successfully (Vite emitted only the existing chunk-size warning); Rust tests passed 12/12; `cargo fmt --check` passed with no output. `npm run tauri dev` also launched successfully for physical review.

Physical Windows review should be proportional to the changed source text rather than repeating every L6/L7 mining regression.

**Manual acceptance completed 5 October 2026:** all existing human-language Mining Risk Acknowledgements were reviewed in the running Windows application with no formatting, clipping, wrapping or script-rendering issues observed. The targeted live-mining language-switch check also passed: mining remained active across the language change and stopped normally afterward.

| Focus | Manual check |
| --- | --- |
| Changed UI strings | Inspect each changed language in the dashboard/settings/status surfaces and confirm revised wording is rendered completely with no clipping or unintended wrapping |
| Risk Acknowledgement | **PASS (5 October 2026):** every existing human-language Risk Acknowledgement was reviewed; headings, paragraphs, five-item hardware list, highlighted statutory-rights paragraph, scrolling and footer controls rendered correctly with no formatting issues observed |
| Script rendering | **PASS (5 October 2026):** the all-language Risk Acknowledgement review showed no clipping, shaping, line-height or word-boundary issues across the represented scripts |
| Mining modes | Confirm revised prose uses the same translated Calm/Balanced/Full Bore labels shown by the UI and remains grammatically natural |
| First run | Confirm the language selector and Risk notice presentation still work before acceptance and that acknowledgement version remains `1.0` |
| Targeted mining | **PASS (5 October 2026):** Start → UAC → live telemetry → language switch while mining → Stop completed successfully; mining/settings state remained intact |

The unchanged exhaustive mining/MSR/degraded/daemon-loss suites do not need to be repeated unless the final diff unexpectedly touches implementation code.
