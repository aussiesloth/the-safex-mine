# Session and Event Model

## 1. Purpose

The session model separates mining-history behaviour from temporary scene effects.

A five-second celebration should never be the source of truth for whether a block was found.

## 2. Suggested session state

Conceptually:

```text
SessionState
├── miningAddress
├── startedAt
├── accumulatedMiningTime
├── acceptedCount
├── rejectedCount
├── currentMode
├── currentHashrate
├── connectionState
├── backendState
└── treasureVisualState
```

Additional metrics can be added later.

## 3. Session boundary

Current rules:

- pressing Stop does **not** end the current session;
- pressing Start after Stop resumes the same session;
- changing mining address clears the visual treasure/session reward state.

The policy for application restart is still undecided and should be explicitly resolved before release.

## 4. Event normalisation

Backend-specific messages should become application events before they reach UI code.

Suggested event set:

```text
APP_READY
MINING_START_REQUESTED
MINING_STARTED
MINING_STOP_REQUESTED
MINING_STOPPED
MODE_CHANGED
HASHRATE_UPDATED
BLOCK_ACCEPTED
BLOCK_REJECTED
CONNECTION_LOST
CONNECTION_RESTORED
BACKEND_WARNING
BACKEND_ERROR
BACKEND_EXITED
ADDRESS_CHANGED
```

## 5. Accepted event

On `BLOCK_ACCEPTED`:

1. increment accepted count;
2. update treasure/reward-table state;
3. store any useful block metadata;
4. trigger BLOCK_FOUND visual state;
5. trigger positive message/effects;
6. return to the correct base state after the transient presentation ends.

## 6. Rejected event

On `BLOCK_REJECTED`:

1. increment rejected count;
2. preserve any available reason;
3. do not modify reward-table treasure;
4. trigger REJECTED visual state;
5. show an appropriate message;
6. return to the correct base state.

## 7. Connection loss

On `CONNECTION_LOST`:

- mining status must change immediately;
- transient decorative states may be interrupted if necessary;
- move to OFFLINE_ERROR when mining is no longer operational;
- preserve session counts.

On `CONNECTION_RESTORED`:

- confirm actual mining resumption before returning to MINING.

## 8. Backend crash

On unexpected backend exit:

- record exit code and recent log context;
- set backend state to failed;
- stop presenting MINING;
- move to OFFLINE_ERROR;
- present Restart/Start controls as appropriate.

## 9. Event priority

Suggested priority:

1. critical backend/application failure;
2. connection unavailable;
3. accepted block;
4. rejected result;
5. mode change;
6. ordinary hashrate/stat updates;
7. decorative visual timers.

## 10. Queued accepted events

If multiple accepted blocks arrive during one celebration:

- all accepted events must be counted;
- all rewards must be added to session treasure;
- the renderer may combine or extend visual celebration;
- no event may be discarded because a prior effect is still running.

A later version may introduce special double/triple-hit presentation.
