# Roadmap

## Phase 0 — Documentation reset

- adopt the state-driven release concept;
- archive or remove obsolete full-animation planning from the main documentation;
- define the new architecture;
- define v1 scope;
- confirm branding permission.

## Phase 1 — Mining core

Priority: make the application mine correctly before adding presentation polish.

Tasks:

- integrate the chosen Safex-compatible XMRig build;
- centralise backend launch/configuration;
- implement wallet address handling;
- implement default node;
- implement custom/LAN node;
- implement Start/Stop;
- implement Calm/Balanced/Full Bore;
- implement required MSR workflow;
- capture backend logs;
- detect backend exit.

## Phase 2 — Event parser and session model

- capture real accepted-block output;
- capture rejected/stale output;
- normalise backend events;
- implement hashrate updates;
- implement connection-state tracking;
- implement accepted/rejected counters;
- implement Stop → Start session continuity;
- implement address-change reset;
- finalise persistence policy across application restart.

## Phase 3 — Core Windows UI

- first-run wizard;
- main dashboard;
- settings;
- node status;
- hashrate display;
- session statistics;
- useful errors;
- log/diagnostic access.

## Phase 4 — State-driven visual system

Create and integrate:

- READY_STOPPED scene;
- MINING scene;
- BLOCK_FOUND scene;
- REJECTED scene;
- OFFLINE_ERROR treatment;
- scene crossfades;
- reward-table nugget layer.

## Phase 5 — Lightweight FX

- block-found fireworks/sparklers;
- gold sparkle/glow;
- subtle mining dust;
- optional lantern/headlamp polish;
- visual performance validation.

## Phase 6 — Packaging and release candidate

- Windows installer;
- clean-machine test;
- multi-hardware test;
- MSR/UAC test matrix;
- antivirus/false-positive documentation;
- third-party notices;
- checksums;
- release notes;
- branding approval confirmed.

## Phase 7 — Community release

Release the functional state-driven application.

Collect feedback on:

- ease of setup;
- node configuration;
- mining modes;
- stability;
- visual presentation;
- whether users actually want continuous animation.

## Deferred / optional future work

Only pursue if worthwhile:

- richer visual state variants;
- special double/triple-hit celebration;
- alternative mine themes;
- more detailed reward-table progression;
- fully animated miner;
- additional platforms.

The full-animation concept is explicitly **not** a prerequisite for a successful Safex Mine release.
