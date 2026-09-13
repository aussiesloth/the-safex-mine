# Mining Engine Integration

## 1. Scope

The Safex Mine uses a Safex-compatible XMRig backend as its mining engine.

The desktop application is responsible for making that backend manageable for ordinary Windows users.

## 2. Process lifecycle

The application should support:

```text
configure
    ↓
launch
    ↓
capture output
    ↓
parse status/events
    ↓
run
    ↓
stop cleanly
```

It must also detect:

- failure to start;
- unexpected process exit;
- node/RPC failure reported by the backend;
- invalid address/configuration;
- permission/elevation problems.

## 3. Backend invocation

The exact final command line and config-file strategy should be centralised in one module.

Do not spread command-line construction across UI code.

A single backend-launch component should own:

- executable path;
- wallet/mining address;
- node endpoint;
- CPU/thread profile;
- logging flags;
- required Safex algorithm options;
- privilege requirements.

## 4. MSR optimisation

MSR optimisation is considered mandatory for the intended Windows performance profile.

The application should:

1. attempt the required elevated backend/helper operation;
2. clearly report if elevation is denied;
3. clearly report if MSR optimisation fails;
4. avoid elevating the entire GUI.

The exact implementation should be validated on clean Windows systems.

## 5. Mining profiles

The application should translate user-facing modes into backend CPU/thread settings.

### Calm

Target approximately 40% CPU allocation.

### Balanced

Target approximately 70% CPU allocation.

### Full Bore

Target the maximum practical mining configuration while retaining system stability and enough capacity for the UI/Windows.

The profile calculation should be hardware-aware.

Do not hard-code thread counts for one development machine.

## 6. Output parsing

The parser should convert backend-specific text into normalised application events.

Examples:

```text
HASHRATE_UPDATED
BLOCK_ACCEPTED
BLOCK_REJECTED
CONNECTION_LOST
CONNECTION_RESTORED
BACKEND_WARNING
BACKEND_ERROR
BACKEND_EXITED
```

The visual layer must never parse raw XMRig text directly.

## 7. Accepted-block detection

Accepted results are important enough to warrant dedicated testing.

Development should capture real console/log output from known accepted Safex solo-mining events and create parser fixtures from those examples.

The parser should be tolerant of harmless formatting changes where practical, but not so loose that ordinary status messages are misclassified as accepted blocks.

## 8. Rejection detection

Rejected/stale results should also use captured real-world backend output where available.

Where the backend exposes a meaningful reject reason, preserve that distinction internally even if the first UI release presents a simplified message.

## 9. Connection state

The application should distinguish between:

- backend process running;
- node connected;
- mining operational.

A running process with no usable node connection is not the same as healthy mining.

## 10. Stop behaviour

User Stop should:

- request a clean backend shutdown where supported;
- enforce termination only if the backend does not exit in a reasonable time;
- leave the application open;
- preserve the current session state;
- transition the visual presentation to READY_STOPPED.

## 11. Restart behaviour

Start after Stop should begin mining again without clearing the current session.

Changing the mining address is a deliberate identity/session boundary and should clear the visual treasure state.

## 12. Logging

Retain enough backend output for useful diagnostics without overwhelming ordinary users.

Recommended approach:

- concise status panel in the main UI;
- detailed log view or log file for troubleshooting;
- timestamps;
- backend exit code;
- last known node state;
- MSR/elevation result.

## 13. Version pinning

The public application should ship with a known, tested backend version.

Updates to the mining backend should be deliberate and benchmarked before release rather than automatically following upstream changes.
