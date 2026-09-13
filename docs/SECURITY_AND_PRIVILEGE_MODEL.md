# Security and Privilege Model

## 1. Principle

The Safex Mine GUI should run with ordinary user privileges.

Administrator rights should be requested only when required for a narrowly defined mining operation, particularly Windows MSR optimisation.

## 2. Why this matters

Running the whole desktop application as Administrator would unnecessarily increase the privilege of:

- the UI;
- asset loading;
- settings handling;
- log viewing;
- update logic;
- any future web-rendered content.

That is not required for ordinary application behaviour.

## 3. Intended model

```text
Standard-user GUI
      │
      ├── ordinary configuration / UI work
      │
      └── requests privileged mining setup
                    ↓
          elevated backend/helper
                    ↓
               MSR operation
```

The exact implementation must be tested carefully on Windows.

## 4. Elevation UX

The user should be told why elevation is being requested before Windows displays the UAC prompt.

Suggested wording:

> The Safex Mine needs to allow the mining backend to apply the required Windows MSR optimisation. The main application remains non-administrative.

## 5. Denied elevation

If the user denies elevation:

- do not pretend the optimisation succeeded;
- show a clear status;
- explain the mining-performance consequence or block mining if the project decides MSR is mandatory at runtime.

The final product policy on whether mining may continue without MSR should be explicit before release.

## 6. Backend path integrity

The application should launch only the expected bundled/configured mining executable.

Avoid constructing privileged executable paths from untrusted or user-editable text.

## 7. Command-line safety

Wallet addresses, endpoints and other user-provided values should be passed safely.

Avoid shell command concatenation when direct process APIs are available.

## 8. Logging

Do not log unnecessary sensitive operating-system information.

Mining addresses and public node endpoints are not secret in the same way as passwords, but logs should still contain only what is useful for troubleshooting.

## 9. Update security

If automatic update functionality is added later, it should use a signed or otherwise verifiable release process.

Do not make self-updating a blocker for the initial release.

## 10. Antivirus considerations

Mining software is commonly flagged by security products.

The project should:

- be transparent that a mining backend is bundled;
- avoid deceptive installation behaviour;
- publish hashes for release files where practical;
- document any known false-positive behaviour;
- never attempt to disable security software automatically.
