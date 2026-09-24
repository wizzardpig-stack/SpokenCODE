# SpokenCODE

**Reality, compiled.**

SpokenCODE is a cinematic web experience where human-readable fictional code appears in a terminal and visibly compiles reality into existence. Milestone 1 is a deliberately narrow proof: `VOID → INIT → FIRST LIGHT → MATTER → APPLE`.

The terminal is the causal narrator. Each meaningful instruction changes the Three.js world in view; the apple is assembled progressively and never appears as a finished prop without cause.

## Run locally

Requires Node.js 20.19+ (Node 24 is used in this workspace).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The sequence starts automatically. Use **REPLAY** to run it again. Sound is opt-in because browsers block audio until a user gesture; use **SOUND OFF** to enable the restrained event cues.

## Verify

```sh
npm run check       # production build
npm run build       # same build, explicit target
npm run preview     # serve the production build locally
```

There is no automated browser test suite yet. Manual checks and known limitations are recorded in [`docs/QA.md`](docs/QA.md). The current build emits Vite's expected entry-chunk size warning because Three.js is bundled directly; it does not indicate a runtime failure.

## Milestone 1 scope

Included:

- deterministic, replayable event timeline;
- terminal commands with explicit terminal, world, camera, audio, and hold channels;
- void, space, time, light, and pooled matter particles;
- progressive `APPLE.add(form)`, `pigment`, `stem`, `texture`, `reflection`, `weight`, and `imperfection` stages;
- responsive desktop/mobile layout, capped device pixel ratio, resize handling, and disposal.

Intentionally excluded: rooms, houses, streets, cities, humans, civilization, recursion, free roam, accounts, AI generation, and editable code.

## Architecture

- `src/timeline.js` is the single RAF-driven scheduler. It has no per-command `setTimeout` calls.
- `src/sequence.js` is the Milestone 1 event script. Each event can target terminal, world, camera, audio, and timing channels.
- `src/world.js` owns the renderer, camera, scene graph, explicit world state, pooled particles, and responsive lifecycle.
- `src/apple.js` owns the progressive apple actor and its reusable geometry/materials.
- `src/terminal.js` is a terminal narrator, not a decorative log; it only receives text from timeline events.
- `src/audio.js` provides optional Web Audio cues and safely no-ops until unlocked.

See [`docs/PRD.md`](docs/PRD.md) for the milestone contract and [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) for implementation decisions.
