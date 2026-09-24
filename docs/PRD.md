# SpokenCODE — Milestone 1 PRD

## Objective

Prove that a viewer wants to watch readable fictional code visibly create a physical idea. The experience ends with a convincing apple assembled one causal instruction at a time.

## Audience and tone

The viewer is an observer, not a player. The tone is restrained and mysterious: a near-black world, sparse typography, quiet camera movement, and a small number of controlled color changes. It should feel like a premium title sequence, not a dashboard or hacker screensaver.

## Narrative contract

The sequence must communicate these states in order:

`VOID → INIT → FIRST LIGHT → MATTER → APPLE`

The terminal begins with:

```text
INIT
I shall create.
```

It then establishes space, time, light, and matter before issuing `create APPLE`. The apple is not spawned finished. These commands must each have a visible consequence:

```text
APPLE.add(form)
APPLE.add(pigment)
APPLE.add(stem)
APPLE.add(texture)
APPLE.add(reflection)
APPLE.add(weight)
APPLE.add(imperfection)
```

## Functional requirements

- Use Three.js with vanilla JavaScript.
- Drive the experience from one deterministic event timeline.
- Support terminal text, world actions, camera actions, audio cues, and timed holds per event.
- Keep explicit world and apple construction state.
- Make the sequence replayable from the beginning.
- Remain usable on narrow mobile viewports and wide desktop viewports.
- Cap device pixel ratio and avoid realtime shadow maps in this milestone.
- Reuse geometry/materials where practical and pool particle buffers.
- Dispose scene resources on teardown.

## Non-goals

No room, house, street, city, humans, civilization, recursion, free roam, accounts, AI generation, or editable code.

## Acceptance criteria

1. A fresh load presents the opening text and then runs the complete sequence without a user gesture.
2. Every listed terminal instruction has an observable world or apple change.
3. The apple remains incomplete until its construction commands have executed.
4. Replay resets the terminal, world state, and timeline rather than layering a second sequence on top.
5. Resize does not distort the canvas or push the subject outside the usable viewport.
6. The production build completes with no unresolved module or syntax errors.
7. Browser console has no errors during a complete run.

## Deferred decisions

Audio delivery, richer post-processing, a larger narrative, and automated browser testing are intentionally deferred until the visual proof is validated.
