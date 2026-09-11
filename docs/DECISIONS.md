# Decision Log

This file records settled product decisions separately from implementation proposals.

| Date | Decision | Status | Reason / Notes |
|---|---|---|---|
| 2026-09-10 | Build a standalone desktop miner rather than browser-first | Settled | Native RandomSFX performance and process control |
| 2026-09-10 | Product name: **The Safex Mine** | Settled | Mining-themed graphical identity |
| 2026-09-10 | Use Galicone's modern XMRig fork as backend candidate | Settled pending build proof | `safex-rig` is outdated for current solo mining |
| 2026-09-10 | Default endpoint `rpc.safex.org:17402`, daemon mode, no TLS | Settled | Known working on existing Windows/Linux rigs |
| 2026-09-10 | Accepted blocks create treasure; rejected blocks create fool's gold | Settled | Visual state mirrors actual outcomes |
| 2026-09-10 | Rejection messages are randomized cosmetic text | Settled | Variety without changing technical meaning |
| 2026-09-10 | Celebration state must absorb consecutive blocks | Settled | Real rigs can find blocks seconds apart |
| 2026-09-11 | Repository owner/namespace is `aussiesloth` | Settled | Safex-community project rather than PracticalAutomationBuilds |
| 2026-09-11 | First run asks for public Safex receiving address and remembers it | Settled | Simple normal-user onboarding |
| 2026-09-11 | Mining never auto-starts on app launch | Settled | Explicit user intent required |
| 2026-09-11 | Default node hidden from normal workflow; custom node in Settings | Settled | Simple defaults with advanced flexibility |
| 2026-09-11 | Calm ~40%, Balanced ~70%, Full Bore ~100% of XMRig optimal threads | Settled pending performance tuning | Mode is based on useful mining threads, not raw core count |
| 2026-09-11 | Stop -> Start within one app run resumes the same visual session | Settled | Stop is not a history reset |
| 2026-09-11 | Changing receiving address clears the reward display | Settled | Never mix rewards for different destinations |
| 2026-09-11 | Closing/reopening app starts with empty reward display | Settled | App is not a wallet/history viewer |
| 2026-09-11 | No v1 CPU-temperature monitoring | Settled | End-user cooling responsibility; keep scope focused |
| 2026-09-11 | Recommend against laptop mining | Settled | Sustained CPU mining workload |
| 2026-09-11 | No analytics/telemetry/data harvesting | Settled | Privacy-first local miner |
| 2026-09-11 | Early community builds may be unsigned | Settled | Open source/provenance/checksums are the initial trust model |
| 2026-09-11 | Consider Safex Foundation signing only for a later stable candidate | Future option | Ask if available/appropriate when mature |
| 2026-09-11 | GUI and XMRig backend remain separate repos/executables | Settled | Clean architecture and licensing boundary |
| 2026-09-11 | Distributed XMRig build must be portable, not 5950X-specific | Settled | Support assorted hardware |
| 2026-09-11 | Tauri + PixiJS is preferred architecture | Preferred, validate during implementation | Lightweight desktop shell + GPU-accelerated 2D scene |
