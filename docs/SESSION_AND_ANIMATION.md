# Session and Animation Behaviour

## Session definition

A visual session lasts for one running instance of The Safex Mine.

- App opens -> empty reward display.
- Stop Mining -> mining stops; rewards remain.
- Start Mining again -> same visual session resumes.
- Temporary node loss/XMRig restart -> rewards remain.
- Receiving-address change -> reward display and accepted/rejected counters clear immediately for the new address context.
- App close/reopen -> new empty visual session.

## Working intensity

Character motion reflects mode plus smoothed real hashrate:

- Calm: measured swings, relaxed movement, smaller effects.
- Balanced: steady purposeful rhythm.
- Full Bore: fast, energetic mining while remaining visually readable.

Do not drive swing speed directly from instantaneous H/s.

## Accepted block

1. Mining outcome is recognized and counted.
2. Cosmetic treasure is assigned.
3. The normal loop is interrupted by a special strike/reveal.
4. The character celebrates.
5. Treasure is delivered to the reward display.
6. Scene returns to the current backend state.

## Rejected block

1. Reject is recognized and counted separately.
2. Apparent treasure resolves into pyrite/fool's gold.
3. Miner reacts with mild comic disappointment.
4. Dud goes to the reject area.
5. One random thematic message is displayed.

Message pool:
- Fool's Gold!
- Pyrite!
- Claim Lost!
- Too Late!
- Stale Find!
- Another Miner Beat You!
- False Strike!

These messages are cosmetic; they must not imply a technical reason that the backend did not report.

## Consecutive accepted blocks

Celebrations are expandable, not serialized as complete queued clips.

- x1: normal celebration
- x2: DOUBLE STRIKE!
- x3: TRIPLE STRIKE!
- x4+: MOTHER LODE!

A new accepted result arriving while the character is celebrating, delivering treasure or returning to work immediately joins/escalates the current celebration group. Its accounting is already complete before the animation reacts.

Mixed outcomes must also be supported: a reject can arrive during an accepted celebration, and an accepted block can reverse a reject reaction into celebration without deleting the reject record.

## Failure scene

When the node disappears or XMRig stops unexpectedly, the miner returns to the reward area and sits in the chair. The app shows a clear factual message such as node unavailable or mining engine stopped. The message/state must not be obscured by thematic animation.

## High-volume sessions

The exact numerical accepted count is authoritative. Artwork may consolidate many rewards to avoid rendering hundreds/thousands of objects. A candidate representation is one bullion bar per 100 accepted blocks, with smaller objects representing the remainder.
