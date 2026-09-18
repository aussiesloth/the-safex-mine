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
src/assets/branding/safex-cash.svg
```

`safex-gradient-logo.svg` is the Safex wordmark displayed in the app header at the top-right.

`safex-cash.svg` is the official Safex Cash logo asset retained in the branding folder for approved Safex Cash branding use. It also served as the branding reference for the custom The Safex Mine application icon.

Safex/Safex Cash branding assets are not covered by The Safex Mine's GPL-3.0 application licence. Their use in this project is addressed separately in `BRANDING.md`.

The header wordmark is not baked into scene images.

## 4. Safex Cash reward motif

Successful mining finds are represented by rectangular gold bullion bars with the full Safex Cash rectangular-note motif.

Bars are visible as treasure on the table but should not be visibly embedded in the ore wall. In the successful block scene, the miner holds one bar aloft.

## 5. Audio

```text
src/assets/sounds/safex-block-cha-ching.wav
```

This is the single intentional application sound in the current release design. It plays on a real accepted-block event unless muted.

## 6. Application icons

The custom The Safex Mine application-icon source is:

```text
src/assets/branding/app-icon/safex_cash_mining_icon.png
```

The generated Tauri icon set is stored under:

```text
src-tauri/icons/
```

The set includes the Windows `.ico` plus the standard PNG/Store/Square variants generated for Tauri packaging. The icon combines recognisable Safex Cash branding with a pickaxe/mining motif so it remains identifiable as The Safex Mine rather than the standalone Safex Cash logo.

## 7. Historical animation assets/plans

Earlier work explored articulated 2D/3D character animation. That material is historical/deferred and is not required for the current state-driven release.

Where retained, it belongs under `docs/archive/` or outside the active runtime asset tree.

## 8. Asset-change checklist

When replacing a production scene:

- keep the expected filename unless code is changed at the same time;
- preserve the broad camera/environment layout;
- check crossfade continuity;
- confirm the Safex Cash bar logo is correct;
- confirm no reward bars are exposed in the rock wall;
- verify the image displays correctly with `object-fit: contain`;
- run all five visual states before committing.
