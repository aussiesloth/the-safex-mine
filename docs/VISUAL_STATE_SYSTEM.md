# Visual State System

## 1. Purpose

The Safex Mine uses five authored still scenes rather than continuous character animation.

Only the scene image crossfades. The header, controls, statistics and status panel remain fixed.

## 2. Scene assets

Current files:

```text
src/assets/scenes/READY-STOPPED.png
src/assets/scenes/MINING.png
src/assets/scenes/APPROVED.png
src/assets/scenes/REJECT.png
src/assets/scenes/OFFLINE.png
```

## 3. READY / STOPPED

Meaning: mining is not currently running.

Visual:

- miner seated/resting;
- established mine environment;
- Safex Cash bullion bars visible on the table;
- rock face contains only natural glowing ore/mineral seams.

Triggers:

- application start;
- clean user Stop;
- successful return to idle.

## 4. MINING

Meaning: XMRig is alive and receiving mining work.

Visual:

- miner striking/working the rock face;
- table bars remain part of the established environment;
- rock wall does not expose reward bars.

## 5. BLOCK FOUND

Meaning: a real accepted block event has been observed.

Visual:

- miner celebrates;
- miner proudly holds one rectangular Safex Cash bullion bar;
- bar uses the full Safex Cash rectangular-note motif;
- table/environment remains visually consistent.

Presentation duration:

```text
5500 ms
```

If sound is enabled, the block-found WAV is played at the start of this event.

## 6. REJECTED

Meaning: a rejected/stale result has been observed.

Visual:

- miner rejects/tosses an ordinary rock/fool's-gold object;
- rejected object is not branded as a successful Safex Cash bar;
- table bars remain unchanged.

Presentation duration:

```text
2500 ms
```

## 7. OFFLINE

Meaning: mining work is temporarily unavailable or the mining session has failed.

Visual:

- dedicated questioning/shrugging miner pose;
- clearly different from READY;
- no reward bar is exposed in the ore wall.

For recoverable daemon loss, XMRig remains alive and this scene returns to MINING automatically when connection/job telemetry resumes.

## 8. Safex Cash bullion-bar rule

The rectangular bullion bar is the canonical reward object.

Use the full Safex Cash rectangular-note shape/logo on the bar face.

Do not use:

- round coin substitutes;
- malformed partial Safex symbols;
- visible reward bars sticking out of the ore wall.

The visual story is that the miner is searching the rock. The successful bar becomes visible only when found, most clearly in the BLOCK FOUND scene.

## 9. Crossfade implementation

The frontend uses two scene `<img>` elements and alternates the active image so scene changes can fade cleanly without changing the rest of the layout.

The scene uses `object-fit: contain` so important artwork is not cropped when the window is resized. Dark unused space is preferable to cutting off scene content.

## 10. State labels

The scene uses small state captions:

- READY / STOPPED;
- MINING;
- BLOCK FOUND;
- REJECTED;
- OFFLINE.

Large descriptive scene text was removed to avoid competing with the artwork.

## 11. Sound feedback

Only a successful block event produces the cash-register sound.

The top-bar speaker control toggles that sound. No other ordinary application event is intended to create audio.

## 12. Performance rule

The release visual system is intentionally low-overhead:

- static images;
- short crossfades;
- one short WAV on block found;
- no continuous character rig;
- no CPU-heavy particle simulation.

The mining workload remains the priority.
