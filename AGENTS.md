# Agent instructions

- This is a vanilla JavaScript + Three.js + Vite project. Use `npm install`, then `npm run dev`; verify with `npm run check` (or `npm run build`) and inspect the production bundle with `npm run preview`.
- The experience is driven by one RAF-based `src/timeline.js` scheduler. Sequence records in `src/sequence.js` may carry terminal, world, camera, audio, and timed-hold channels; do not add per-command `setTimeout` calls or parallel sequence state.
- `src/world.js` owns the renderer, camera, explicit world state, pooled particles, responsive resizing, DPR cap, and disposal. Realtime shadows and heavyweight post-processing are deliberately absent from Milestone 1.
- `src/apple.js` is the progressive apple actor. Preserve the causal `APPLE.add(form|pigment|stem|texture|reflection|weight|imperfection)` order; the apple must not be spawned finished.
- `src/terminal.js` is the causal narrator, not a generic log. Add terminal text through timeline events rather than coupling it directly to render code.
- Milestone 1 stops at the apple. Do not add rooms, houses, streets, cities, humans, civilization, recursion, free roam, accounts, AI generation, or editable code without a new milestone decision.
- `npm run check` succeeds but currently reports Vite's >500 kB entry-chunk warning because Three.js is bundled directly; treat that as a known build warning, not a failed check.
- There is no automated browser test suite; use the manual cases and known limits in `docs/QA.md` when validating changes.
