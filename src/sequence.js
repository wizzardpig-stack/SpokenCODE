const terminalLine = (text, kind = 'command') => ({ text, kind });

const worldStep = (phase, level) => ({
  type: 'set-level',
  phase,
  level,
});

export function createSequence() {
  return [
    {
      id: 'init',
      duration: 2.2,
      pause: 0.4,
      terminal: {
        lines: [
          terminalLine('INIT', 'init'),
          terminalLine('I shall create.', 'spoken'),
        ],
        state: 'INIT / LISTENING',
      },
      camera: { preset: 'void' },
      audio: { frequency: 74, duration: 1.8, volume: 0.018 },
    },
    {
      id: 'void',
      duration: 2.0,
      pause: 0.2,
      terminal: {
        lines: [terminalLine('create VOID')],
        state: 'VOID / ESTABLISHED',
      },
      world: worldStep('void', 'void'),
      camera: { preset: 'void' },
      audio: { frequency: 96, duration: 0.8, volume: 0.012 },
    },
    {
      id: 'space',
      duration: 2.1,
      pause: 0.2,
      terminal: {
        lines: [terminalLine('create SPACE')],
        state: 'SPACE / ESTABLISHED',
      },
      world: worldStep('space', 'space'),
      camera: { preset: 'space' },
      audio: { frequency: 132, duration: 0.7, volume: 0.01 },
    },
    {
      id: 'time',
      duration: 2.0,
      pause: 0.2,
      terminal: {
        lines: [terminalLine('create TIME')],
        state: 'TIME / ESTABLISHED',
      },
      world: worldStep('time', 'time'),
      camera: { preset: 'time' },
      audio: { frequency: 176, duration: 0.65, volume: 0.01 },
    },
    {
      id: 'light',
      duration: 2.2,
      pause: 0.35,
      terminal: {
        lines: [
          terminalLine('create LIGHT'),
          terminalLine('FIRST LIGHT', 'reveal'),
        ],
        state: 'LIGHT / FIRST LIGHT',
      },
      world: worldStep('light', 'light'),
      camera: { preset: 'light' },
      audio: { frequency: 264, duration: 1.2, volume: 0.014 },
    },
    {
      id: 'matter',
      duration: 2.4,
      pause: 0.3,
      terminal: {
        lines: [terminalLine('create MATTER')],
        state: 'MATTER / CONDENSING',
      },
      world: worldStep('matter', 'matter'),
      camera: { preset: 'matter' },
      audio: { frequency: 198, duration: 1.1, volume: 0.012 },
    },
    {
      id: 'apple',
      duration: 2.0,
      pause: 0.2,
      terminal: {
        lines: [terminalLine('create APPLE')],
        state: 'APPLE / UNFINISHED',
      },
      world: { type: 'create-apple', phase: 'apple' },
      camera: { preset: 'apple' },
      audio: { frequency: 220, duration: 0.9, volume: 0.014 },
    },
    {
      id: 'apple-form',
      duration: 2.0,
      pause: 0.15,
      terminal: {
        lines: [terminalLine('APPLE.add(form)')],
        state: 'APPLE / FORM',
      },
      world: { type: 'apple-stage', stage: 'form' },
      camera: { preset: 'apple' },
      audio: { frequency: 247, duration: 0.65, volume: 0.01 },
    },
    {
      id: 'apple-pigment',
      duration: 1.8,
      pause: 0.15,
      terminal: {
        lines: [terminalLine('APPLE.add(pigment)')],
        state: 'APPLE / PIGMENT',
      },
      world: { type: 'apple-stage', stage: 'pigment' },
      camera: { preset: 'apple' },
      audio: { frequency: 294, duration: 0.6, volume: 0.01 },
    },
    {
      id: 'apple-stem',
      duration: 1.8,
      pause: 0.15,
      terminal: {
        lines: [terminalLine('APPLE.add(stem)')],
        state: 'APPLE / STEM',
      },
      world: { type: 'apple-stage', stage: 'stem' },
      camera: { preset: 'apple' },
      audio: { frequency: 330, duration: 0.7, volume: 0.011 },
    },
    {
      id: 'apple-texture',
      duration: 1.8,
      pause: 0.15,
      terminal: {
        lines: [terminalLine('APPLE.add(texture)')],
        state: 'APPLE / TEXTURE',
      },
      world: { type: 'apple-stage', stage: 'texture' },
      camera: { preset: 'apple' },
      audio: { frequency: 370, duration: 0.55, volume: 0.009 },
    },
    {
      id: 'apple-reflection',
      duration: 1.8,
      pause: 0.15,
      terminal: {
        lines: [terminalLine('APPLE.add(reflection)')],
        state: 'APPLE / REFLECTION',
      },
      world: { type: 'apple-stage', stage: 'reflection' },
      camera: { preset: 'apple' },
      audio: { frequency: 440, duration: 0.8, volume: 0.01 },
    },
    {
      id: 'apple-weight',
      duration: 2.0,
      pause: 0.2,
      terminal: {
        lines: [terminalLine('APPLE.add(weight)')],
        state: 'APPLE / WEIGHT',
      },
      world: { type: 'apple-stage', stage: 'weight' },
      camera: { preset: 'apple' },
      audio: { frequency: 165, duration: 1.0, volume: 0.012 },
    },
    {
      id: 'apple-imperfection',
      duration: 2.2,
      pause: 0.4,
      terminal: {
        lines: [terminalLine('APPLE.add(imperfection)')],
        state: 'APPLE / COMPLETE',
      },
      world: { type: 'apple-stage', stage: 'imperfection' },
      camera: { preset: 'apple' },
      audio: { frequency: 523, duration: 1.4, volume: 0.013 },
    },
  ];
}
