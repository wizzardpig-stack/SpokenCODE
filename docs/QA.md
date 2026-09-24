# QA — Milestone 1

## Manual test cases

| ID | Steps | Expected result |
| --- | --- | --- |
| QA-01 | Load the app in a modern desktop browser with a clean cache. | `INIT`, `I shall create.`, and the full sequence begin automatically. |
| QA-02 | Watch the establishing commands through `create MATTER`. | Void dust, spatial arcs, time rings, a light source, and matter particles appear in order. |
| QA-03 | Watch `create APPLE` and the seven `APPLE.add(...)` lines. | The apple is visibly incomplete after creation and gains form, color, stem, texture, reflection, weight, and imperfection one command at a time. |
| QA-04 | Click `REPLAY` during and after the sequence. | The terminal, world state, and camera reset cleanly; no duplicate objects or lines remain. |
| QA-05 | Resize continuously between wide desktop and narrow mobile widths. | Canvas remains sharp within the DPR cap, the apple stays visible, and the terminal does not cover the subject. |
| QA-06 | Click `SOUND OFF`, then let the sequence run. | Audio remains silent until enabled; enabling the control unlocks restrained event cues without changing the visual sequence. |
| QA-07 | Run `npm run check`. | Vite completes the production build with exit code 0. |
| QA-08 | Open `dist/index.html` through a local server using `npm run preview`. | The built experience loads and behaves like the development version. |

## Known issues / limits

- There is no automated browser test suite checked into the repository; QA-01 through QA-08 are manual checks.
- Vite reports a bundle-size warning because the Three.js runtime is currently shipped in the entry chunk. It is a build warning, not a runtime error; code-splitting is deferred until the experience grows beyond this milestone.
- Audio cannot autoplay before a user gesture in normal browser policy, so visual causality is the primary proof.
- The apple uses procedural geometry rather than a scanned or sculpted asset; silhouette and surface detail are intentionally stylized.
- No advanced lighting, post-processing, shadows, or physics are included in this milestone to preserve performance and scope.
- The terminal is intentionally non-editable and non-interactive in Milestone 1.
