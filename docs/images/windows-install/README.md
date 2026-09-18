# Windows installation screenshots

This folder holds the public screenshots used by `docs/WINDOWS_INSTALLATION.md`.

Upload the clean-machine captures using these exact filenames:

1. `01-github-release.png` — GitHub release Assets showing the setup EXE and checksum information.
2. `02-smartscreen-warning.png` — initial **Windows protected your PC** screen with **More info**.
3. `03-smartscreen-details.png` — expanded SmartScreen screen showing installer filename, **Unknown publisher** and **Run anyway**.
4. `04-install-location.png` — NSIS **Choose Install Location** page showing the Local AppData destination.
5. `05-defender-installer.png` — Protection History showing the installer detection and Downloads path.
6. `06-defender-xmrig.png` — Protection History showing the XMRig detection and installed runtime path.
7. `07-defender-exclusion.png` — Windows Security exclusions page showing only the dedicated **The Safex Mine** install-folder exclusion.
8. `08-risk-acknowledgement.png` — optional first-run Mining Risk Acknowledgement.
9. `09-helper-uac.png` — UAC prompt for `safex-mine-helper.exe`; a tightly cropped still from the clean-machine test video is appropriate.

Before committing a screenshot:

- crop away unrelated desktop content where practical;
- remove or obscure unrelated personal filenames, notifications or account information;
- leave security-relevant text, application names and expected paths readable;
- do not alter the substance of Windows warnings or detection text.

The bracketed placeholders in `docs/WINDOWS_INSTALLATION.md` should be replaced with normal Markdown image embeds after the corresponding files are uploaded.
