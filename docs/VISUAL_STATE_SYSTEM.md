# Visual State System

## 1. Purpose

The current release direction uses a **small number of authored visual states** instead of continuous character animation.

The miner still reacts to application events, but those reactions are shown using still scenes, crossfades and lightweight effects.

## 2. Core visual states

### VS00 — READY_STOPPED

**Meaning:** mining is not currently running by user choice.

**Visual:**

- miner seated in the chair;
- helmet and work gear remain on;
- pickaxe resting nearby;
- reward table remains visible;
- current session treasure remains visible.

**Triggers in:**

- application ready;
- user presses Stop;
- backend stops cleanly.

**Triggers out:**

- Start Mining;
- critical error, if a separate offline/error treatment is required.

---

### VS10 — MINING

**Meaning:** the mining backend is running normally.

**Visual:**

- miner standing at the rock face;
- pickaxe in working position;
- same mine layout as all other states;
- reward table visible;
- accumulated nuggets visible.

**Optional lightweight effects:**

- subtle dust;
- occasional rock sparkle;
- low-cost lantern flicker;
- headlamp glow.

No continuous character motion is required.

---

### VS20 — BLOCK_FOUND

**Meaning:** a real accepted mining result has been detected.

**Visual:**

- miner holding up a gold nugget;
- clear positive expression;
- reward table remains visible;
- newly found reward is added to the session state.

**Effects:**

- sparkler/firework sprites;
- gold sparkle;
- nugget glow;
- optional short UI pulse.

**Suggested duration:**

Approximately **5–6 seconds**, then return to MINING if mining is still running.

If mining has stopped or failed during the celebration, transition to the appropriate non-mining state instead.

---

### VS30 — REJECTED

**Meaning:** a rejected, stale or otherwise unsuccessful result has been detected.

**Visual:**

- miner tossing a fool's-gold/pyrite piece toward the scrap heap;
- mildly annoyed or disappointed expression;
- real reward table remains unchanged.

**Effects:**

- small toss/dust effect;
- optional brief scrap-heap glint;
- rejection message.

**Suggested duration:**

Shorter than a successful block celebration.

Initial target: roughly **2–3 seconds**, then return to MINING if mining is still running.

---

### VS90 — OFFLINE_ERROR

**Meaning:** mining is unavailable because of a technical interruption.

Examples:

- node/RPC unavailable;
- connection loss;
- backend crash;
- invalid configuration;
- unrecoverable launch failure.

The artwork may reuse the seated miner if desired, but the UI must clearly distinguish this from READY_STOPPED.

This state should prioritise diagnostic clarity over decorative behaviour.

## 3. State transition summary

```text
APP READY
   ↓
READY_STOPPED
   │
   └── Start Mining ───────→ MINING
                              │
                              ├── accepted block ─→ BLOCK_FOUND ─→ MINING
                              │
                              ├── rejected result → REJECTED ────→ MINING
                              │
                              ├── user Stop ──────→ READY_STOPPED
                              │
                              └── failure ────────→ OFFLINE_ERROR
                                                       │
                                                       ├── restored/restarted → MINING
                                                       └── user Stop          → READY_STOPPED
```

## 4. Interruption rules

### Block-found state

Do not abruptly cancel a block-found visual unless a critical failure needs immediate user attention.

However, the underlying mining and connection state remains authoritative.

### Rejection state

The rejection visual is disposable.

A critical error or accepted block may override it.

### User Stop

If the user presses Stop during a transient visual state:

- stop the mining backend immediately and safely;
- allow only a very brief transition;
- end in READY_STOPPED.

Do not keep pretending to mine because a celebration timer is still running.

## 5. Crossfade policy

Crossfades should apply to the scene/state image.

The following remain fixed:

- application controls;
- statistics;
- branding;
- connection indicators;
- window chrome;
- other persistent UI.

This makes the application feel like one continuous environment instead of a slideshow.

## 6. Visual continuity rules

All state artwork should preserve:

- identical or near-identical camera angle;
- chair location;
- table location;
- rock-face location;
- lighting direction;
- mine architecture;
- major background props;
- overall scale.

Only the miner's pose and state-specific foreground details should change significantly.

## 7. Reward table

The reward table is persistent within the current session.

Accepted block:

```text
accepted event
    ↓
increment session reward count
    ↓
add/update nugget representation
    ↓
show BLOCK_FOUND state
```

Rejected result:

```text
rejected event
    ↓
increment rejection count
    ↓
do not change reward table
    ↓
show REJECTED state
```

## 8. Multiple accepted events

If another accepted event arrives while BLOCK_FOUND is already being shown:

- never lose the event;
- increment the accepted counter immediately;
- update the reward state;
- queue or extend the celebration presentation.

The exact visual treatment can be simple in v1.

A later version may add a special double-hit celebration.

## 9. Messages

Accepted messages may be randomised from a positive phrase set.

Rejected messages can include:

- Fool's Gold
- Pyrite!
- Claim Lost
- Too Late
- Stale Find
- Another Miner Beat You
- False Strike

Where the backend exposes a specific reason, prefer a message that matches the actual event.

## 10. Performance rule

The scene and effects must remain subordinate to mining performance.

Avoid:

- expensive continuous character animation;
- unnecessary high-frequency effects;
- large CPU-side particle calculations;
- rendering behaviour that materially reduces hashrate.

GPU-side sprite effects are preferred where available.
