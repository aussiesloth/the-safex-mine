# Assets

## 1. Active production assets

The current release path uses a small set of static production assets.

## 2. Scene images

```text
src/assets/scenes/READY-STOPPED.png
src/assets/scenes/MINING.png
src/assets/scenes/APPROVED.png
src/assets/scenes/REJECT.png
src/assets/scenes/OFFLINE.png
```

The five scenes share the same broad mine environment and visual language so crossfades read as state changes rather than unrelated illustrations.

Scene rules are documented in `VISUAL_STATE_SYSTEM.md`.

## 3. Branding

```text
src/assets/branding/safex-gradient-logo.svg
```

The SVG Safex wordmark is displayed in the app header at the top-right.

The wordmark is not baked into scene images.

## 4. Safex Cash reward motif

Successful mining finds are represented by rectangular gold bullion bars with the full Safex Cash rectangular-note motif.

Bars are visible as treasure on the table but should not be visibly embedded in the ore wall. In the successful block scene, the miner holds one bar aloft.

## 5. Audio

```text
src/assets/sounds/safex-block-cha-ching.wav
```

This is the single intentional application sound in the current release design. It plays on a real accepted-block event unless muted.

## 6. Application icons

`src-tauri/icons/` still contains the Tauri application icon set used by the current project configuration.

A final custom The Safex Mine icon set is still a release task.

## 7. Unused template assets

The repository also currently contains default/template assets such as:

```text
src/assets/tauri.svg
src/assets/typescript.svg
src/assets/vite.svg
```

They are not part of the current production interface and should be removed during the release-cleanup pass if no code reference remains.

## 8. Historical animation assets/plans

Earlier work explored articulated 2D/3D character animation. That material is historical/deferred and is not required for the current state-driven release.

Where retained, it belongs under `docs/archive/` or outside the active runtime asset tree.

## 9. Asset-change checklist

When replacing a production scene:

- keep the expected filename unless code is changed at the same time;
- preserve the broad camera/environment layout;
- check crossfade continuity;
- confirm the Safex Cash bar logo is correct;
- confirm no reward bars are exposed in the rock wall;
- verify the image displays correctly with `object-fit: contain`;
- run all five visual states before committing.
