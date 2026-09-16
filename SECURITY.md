# Security Policy

## Scope

This document covers security reporting and security-relevant behaviour for **The Safex Mine**.

The application launches a CPU mining backend and uses a narrowly scoped elevated helper on Windows. That makes transparent privilege handling, executable-path integrity and clear release provenance especially important.

## Reporting a security issue

Do **not** publish exploit details, privilege-escalation steps or other sensitive security findings in a public issue.

When the repository is public, use GitHub's private security-reporting / security-advisory mechanism for this repository if it is enabled. If private reporting is not available, contact the repository owner through GitHub and request a private channel before sending sensitive details.

Ordinary bugs that do not expose a security vulnerability can be reported through the normal issue tracker.

## Current Windows privilege model

- The Tauri GUI runs as the ordinary user.
- The GUI does not require Administrator privileges.
- A dedicated `safex-mine-helper.exe` is elevated through Windows UAC when mining first starts in an application session.
- The helper launches and supervises the Safex XMRig backend.
- GUI/helper communication uses a random local named-pipe session plus an authentication token.
- The pipe is local-only and created with an explicit security descriptor.
- XMRig is placed in a Windows Job Object configured with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`.
- If the elevated helper exits unexpectedly, closing the Job Object terminates the attached XMRig process.
- User Stop first requests a graceful XMRig Ctrl+C shutdown; forced termination is a fallback.

See `docs/SECURITY_AND_PRIVILEGE_MODEL.md` for the implementation model.

## MSR optimisation

XMRig attempts its normal Windows MSR optimisation from the elevated helper process.

If Windows security features such as VBS/hypervisor protections prevent MSR writes, The Safex Mine can continue in degraded-performance mode. The application should not instruct users to disable Windows security protections merely to obtain a higher hashrate.

## Mining software and antivirus products

Mining software is frequently classified or flagged by antivirus/endpoint-security products. The project must remain transparent about the included mining backend.

The Safex Mine will not:

- silently disable antivirus products;
- silently add antivirus exclusions;
- hide the presence of the mining backend;
- install persistence unrelated to normal application behaviour.

Public releases should provide checksums and source references so users can verify what they downloaded.

## Unsigned releases

The planned public Windows release is unsigned. Users should expect Windows SmartScreen or other trust warnings until/unless a future signing arrangement changes that.

Unsigned distribution is not an invitation to bypass security warnings blindly. Users should verify the release source and published checksum before running it.

## Supported versions

The project is currently pre-release. A formal supported-version table will be added when public versioned releases begin.
