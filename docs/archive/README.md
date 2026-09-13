# Archived Design Material

This directory is for superseded or deferred project design work.

The earlier concept for The Safex Mine used a fully animated miner with:

- articulated side rigs;
- front celebration rigs;
- seated/offline rigs;
- walking;
- pickaxe swing cycles;
- authored turn transitions;
- continuous character-state animation.

That concept informed the current state-driven design, but it is no longer part of the initial release scope.

The current release uses:

- authored still-state scenes;
- fade/crossfade transitions;
- lightweight sprite effects;
- persistent reward-table visuals.

Historical animation documents may be retained under:

```text
docs/archive/animated-concept/
```

They should not be linked from the main README as current implementation requirements.

If the community later shows strong interest in a fully animated edition, the archived material can be revisited without changing the mining core or event model.
