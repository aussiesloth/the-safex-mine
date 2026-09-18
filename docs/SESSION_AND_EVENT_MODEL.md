# Session and Event Model

## 1. Session definition

A Safex Mine session is the current in-memory mining-statistics period.

A new session begins when the desktop application starts and also when the saved Safex mining address is changed to a different valid address while mining is stopped.

Session counters are held in frontend memory rather than persisted to disk.

## 2. Current session state

The frontend tracks, among other values:

- whether mining is running;
- accumulated mining time;
- current mining-start timestamp;
- Blocks Found;
- Rejected;
- last accepted/rejected telemetry values;
- current visual state;
- transient celebration/rejection queue;
- daemon-offline state.

## 3. Session boundaries

### Stop -> Start

Stop does **not** clear the current session.

The app preserves:

- accumulated mining time;
- Blocks Found;
- Rejected.

Start resumes the same in-memory session.

### Full application restart

A full app restart starts a new session. Counters/time reset to zero.

### Address change

The address field is locked while mining, so address changes can occur only while stopped.

When a newly validated Safex Cash address differs from the previously saved address, the current mining session is reset:

- `Blocks Found` resets immediately to `0`;
- `Rejected` resets immediately to `0`;
- accumulated mining time resets immediately to `00:00:00`.

The saved address is then updated. This makes a mining-address change a session boundary so statistics from one Safex address are never carried into another.

## 4. Backend telemetry model

The helper reports cumulative accepted/rejected counts for its current XMRig process.

The frontend stores the last-seen helper totals and computes deltas.

If helper counters reset because a new mining process/session is created, the frontend baseline is adjusted rather than treating the lower value as negative events.

## 5. Accepted block event

For each newly observed accepted result:

1. increment `Blocks Found` immediately;
2. update the counter display;
3. if sound is not muted, restart/play the block-found WAV;
4. queue/show the BLOCK FOUND scene;
5. after approximately 5.5 seconds, return to the appropriate base state or play the next queued transient event.

The block count is the state of record. The scene/sound are presentation effects.

## 6. Rejected event

For each newly observed rejected result:

1. increment `Rejected` immediately;
2. update the counter display;
3. queue/show the REJECTED scene;
4. after approximately 2.5 seconds, return to the appropriate base state or play the next queued transient event.

A rejection does not play the block-found sound.

## 7. Transient queue

Accepted/rejected events are not discarded merely because another transient scene is already visible.

If a transient timer is active, additional events are queued and played in order.

Counters are incremented when the events are observed, not when their later visual presentation begins.

## 8. User Stop during transient presentation

Mining state remains authoritative.

If mining stops, the transient queue is cleared and the scene returns to READY / STOPPED rather than continuing to pretend that mining is active.

## 9. Daemon loss

If XMRig loses its mining connection while the process remains alive:

- the frontend records daemon-offline state;
- current hashrate is displayed as zero;
- the visual state becomes OFFLINE;
- worker/process session remains available;
- counters/time are preserved;
- XMRig is allowed to reconnect.

When valid job telemetry resumes, the UI returns to MINING.

## 10. Helper/backend failure

If the helper session fails unexpectedly:

- the dead helper session is discarded;
- mining is marked unavailable;
- fields/mode controls are unlocked;
- Start becomes available again;
- a later Start launches a fresh helper.

Job Object protection ensures XMRig should not survive the helper that owns it.

## 11. Persisted preferences are not session state

Local storage persists:

- address;
- daemon;
- mode;
- sound-muted preference.

Those values configure the next session but do not preserve session counters.
