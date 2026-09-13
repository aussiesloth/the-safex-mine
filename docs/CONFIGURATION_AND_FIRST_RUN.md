# Configuration and First Run

## 1. First-run objective

A new user should be able to install The Safex Mine, enter a Safex Cash mining address, accept the default connection settings, and start mining without manually editing a configuration file.

## 2. Minimum first-run flow

Suggested sequence:

```text
Welcome
  ↓
Mining address
  ↓
Node/RPC choice
  ↓
Initial mining mode
  ↓
Review
  ↓
Ready
```

## 3. Mining address

The address field should:

- be clearly labelled;
- allow paste;
- trim accidental whitespace;
- be validated as far as the project can do so reliably;
- never be silently changed.

If validation is uncertain, warn rather than inventing a correction.

## 4. Default node

The application should provide a default public Safex node/RPC so most users can start without configuration work.

The actual endpoint should be documented in the release build and easy to change in Settings.

## 5. Custom / LAN node

Advanced settings should allow a custom endpoint.

Useful fields may include:

- hostname or IP;
- port;
- any required protocol setting.

The UI should make LAN-node use straightforward.

## 6. Mining mode

The first-run wizard should allow:

- Calm;
- Balanced;
- Full Bore.

Balanced is the natural candidate for the default, subject to testing.

## 7. Settings screen

Settings should include at least:

- mining address;
- node/RPC endpoint;
- mining mode;
- startup behaviour if later supported;
- log access;
- application/backend version information.

Any setting that resets session state should warn the user first if that reset matters.

## 8. Address-change rule

Changing the mining address clears the visual reward/session treasure state.

The application should make that behaviour explicit.

## 9. MSR elevation

The first mining start may require an elevation prompt.

The UI should explain why:

> The Safex Mine needs to allow the mining backend to apply the required Windows MSR optimisation. The main application itself does not need to run as Administrator.

Do not present the elevation request without context.

## 10. Invalid configuration

When mining cannot start, show a useful error.

Examples:

- invalid address;
- node unavailable;
- backend executable missing;
- backend failed to start;
- permission denied;
- MSR setup failed.

Avoid generic messages such as "Something went wrong" when a more useful reason is available.

## 11. Configuration storage

Configuration should be stored in a normal per-user application-data location rather than beside the executable where practical.

Sensitive information is not expected in the normal mining configuration, but file permissions should still follow normal Windows application practice.
