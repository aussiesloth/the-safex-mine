# Archived: Asset Plan

> Historical planning document. This file predates the final static-scene production assets and is retained only for project history. For current assets, see `../ASSETS.md` and `../VISUAL_STATE_SYSTEM.md`.

# Asset Plan

## 1. Production rule

The current asset plan is intentionally much smaller than the earlier full-animation concept.

The release target does **not** require:

- articulated body-part rigs;
- walk cycles;
- front/side/seated animation systems;
- skeletal character animation;
- continuous mining loops.

Instead, the project needs a consistent set of authored state scenes plus a small reusable effects library.

## 2. Core state scenes

Recommended assets:

```text
assets/scenes/
├── ready-stopped.png
├── mining.png
├── block-found.png
├── rejected.png
└── offline-error.png
```

`offline-error.png` may reuse or derive from the seated state if the UI makes the error condition unmistakable.

## 3. Scene consistency

All core scenes should preserve:

- the same camera;
- the same chair location;
- the same reward-table location;
- the same rock-face location;
- the same major wooden supports;
- the same lighting logic;
- the same miner design;
- the same visual style.

This is essential for convincing crossfades.

## 4. Reward-table assets

Recommended structure:

```text
assets/rewards/
├── nugget-01.png
├── nugget-02.png
├── nugget-03.png
├── nugget-large.png
└── pyrite.png
```

The renderer can:

- place nugget sprites programmatically;
- use several variants to avoid repetition;
- randomise small position and rotation changes;
- collapse large counts into pile representations if required.

## 5. Effects

Recommended lightweight effects:

```text
assets/fx/
├── fireworks/
│   ├── burst-01.png
│   ├── burst-02.png
│   └── spark.png
├── sparkle/
│   ├── sparkle-01.png
│   └── sparkle-02.png
├── dust/
│   ├── dust-soft-01.png
│   └── dust-soft-02.png
└── lighting/
    ├── nugget-glow.png
    ├── headlamp-glow.png
    └── lantern-glow.png
```

Effects should be sprite-based and GPU-friendly.

## 6. Branding

Candidate structure:

```text
assets/branding/
└── safex-gradient-logo.svg
```

Do **not** ship the Safex logo until permission for its use in the application/repository has been confirmed.

If approved, SVG should be retained as vector artwork where the UI framework supports it.

## 7. Suggested visual layout

Current concept:

- Safex logo: top-left;
- mine scene: main background/visual area;
- miner state: integrated into the mine scene;
- reward table: visible across relevant states;
- controls and statistics: fixed overlay/panel;
- transient effects: above scene, below critical UI.

## 8. Approval checklist

Each scene should pass:

1. **Character check** — does the miner remain consistent?
2. **Environment check** — is the mine layout consistent?
3. **Camera check** — will crossfades align?
4. **Lighting check** — is the lighting coherent?
5. **State readability** — can the user understand the state quickly?
6. **UI clearance** — does important art avoid interface overlays?
7. **Performance check** — is asset size reasonable?
8. **Export check** — correct dimensions, colour profile and compression.

## 9. Recommended production order

```text
MINING scene
    ↓
READY_STOPPED scene
    ↓
BLOCK_FOUND scene
    ↓
REJECTED scene
    ↓
OFFLINE_ERROR treatment
    ↓
reward-table nugget sprites
    ↓
fireworks / sparkle FX
    ↓
dust / lighting polish
    ↓
branding integration after permission
```

The MINING scene should act as the environmental anchor for every other state.

## 10. Archived animated concept

The earlier articulated-rig and complete animation plans should be treated as historical design work.

If retained in the repository, move them under:

```text
docs/archive/animated-concept/
```

They are not required for the current release.
