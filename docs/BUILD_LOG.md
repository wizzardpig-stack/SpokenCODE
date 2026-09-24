# Build log

## 2026-09-24 — Milestone 1 foundation

### What was implemented

- Added a Vite + vanilla JavaScript + Three.js runtime.
- Added a single RAF-driven `Timeline` with fixed event timing, replay/reset support, and explicit terminal/world/camera/audio/hold channels.
- Added a fixed Milestone 1 event script ending at the progressive apple construction.
- Added a terminal narrator that receives only timeline-authored lines and exposes replay/sound controls.
- Added a Three.js world with explicit state for void, space, time, light, matter, and apple stages.
- Added pooled matter particles, restrained orbital/time geometry, a first-light source, and responsive camera behavior.
- Added a custom procedural apple body, progressive material/color stages, stem, leaf, texture freckles, reflection, weight settling, and imperfection marks.
- Added responsive styling, capped pixel ratio, resize handling, WebGL fallback messaging, and teardown/disposal paths.
- Documented the product contract, decisions, and manual verification cases.

### Why these choices

- A single timeline makes the experience replayable and keeps command causality inspectable.
- Explicit state makes each visual change attributable to a named sequence event instead of ambient animation.
- Pooled particles and no shadow maps keep the first proof inexpensive on mobile and desktop.
- A custom procedural apple avoids a heavyweight asset pipeline while allowing each construction stage to remain legible.
- Audio cues are optional and unlocked by a gesture so autoplay restrictions do not interrupt the visual milestone.

## Verification

- `npm run check` completes the Vite production build.
- JavaScript module syntax checks and `git diff --check` pass.
- A local Chromium smoke run confirmed WebGL initialization, all seven `APPLE.add(...)` state transitions, replay reset, responsive canvas sizing, and no page errors.
- The headless software renderer emits `ReadPixels` performance warnings while screenshots are captured; these are driver warnings from the test harness, not application errors.

## Current boundary

The implementation stops after the apple sequence. No later world, interaction, or generative systems were added.
