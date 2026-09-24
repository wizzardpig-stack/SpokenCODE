import './styles.css';
import { AudioDirector } from './audio.js';
import { createSequence } from './sequence.js';
import { Terminal } from './terminal.js';
import { Timeline } from './timeline.js';
import { World } from './world.js';

const canvas = document.querySelector('#reality-canvas');
const experience = document.querySelector('.experience');
const terminalLines = document.querySelector('#terminal-lines');
const terminalState = document.querySelector('#terminal-state');
const worldState = document.querySelector('#world-state');
const readoutProgress = document.querySelector('#readout-progress');
const sequenceClock = document.querySelector('#sequence-clock');
const replayButton = document.querySelector('#replay-button');
const soundToggle = document.querySelector('#sound-toggle');
const soundState = document.querySelector('#sound-state');
const fallback = document.querySelector('#webgl-fallback');

let world;
try {
  world = new World(canvas);
} catch (error) {
  fallback.hidden = false;
  console.error('SpokenCODE could not initialize WebGL.', error);
}

if (world) {
  const terminal = new Terminal({ linesElement: terminalLines, stateElement: terminalState });
  const audio = new AudioDirector();
  let started = false;
  let soundEnabled = false;

  const formatTime = (seconds) => {
    const wholeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(wholeSeconds / 60).toString().padStart(2, '0');
    const remainder = (wholeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const updateReadout = (elapsed, progress) => {
    const snapshot = world.getSnapshot();
    const stageValues = Object.values(snapshot.apple);
    const appleProgress = stageValues.filter((value) => value === 1).length / 7;
    const label = snapshot.apple.created
      ? `APPLE / ${Math.round(appleProgress * 100).toString().padStart(2, '0')}%`
      : `${snapshot.phase} / ${Math.round(snapshot.level * 100).toString().padStart(2, '0')}%`;
    worldState.textContent = label;
    readoutProgress.style.transform = `scaleX(${progress})`;
    sequenceClock.textContent = formatTime(elapsed);
    experience.dataset.phase = snapshot.phase;
  };

  const resetExperience = () => {
    timeline.reset();
    terminal.reset();
    world.reset();
    updateReadout(0, 0);
    timeline.play();
    started = true;
  };

  const timeline = new Timeline({
    events: createSequence(),
    onEvent: (event) => {
      if (event.terminal) {
        terminal.append(event.terminal);
      }
      if (event.world) {
        world.applyEvent(event);
      }
      if (event.camera) {
        world.setCameraPreset(event.camera.preset);
      }
      if (event.audio) {
        audio.cue(event.audio);
      }
    },
    onTick: ({ delta, elapsed, progress }) => {
      world.update(delta);
      updateReadout(elapsed, progress);
    },
    onComplete: () => {
      terminal.setState('MILESTONE COMPLETE / OBSERVE');
      updateReadout(timeline.totalDuration, 1);
    },
  });

  replayButton.addEventListener('click', resetExperience);

  soundToggle.addEventListener('click', async () => {
    if (soundEnabled) {
      audio.disable();
      soundEnabled = false;
      soundToggle.setAttribute('aria-pressed', 'false');
      soundState.textContent = 'OFF';
      return;
    }

    const unlocked = await audio.enable();
    soundEnabled = unlocked;
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundState.textContent = soundEnabled ? 'ON' : 'UNAVAILABLE';
  });

  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      resetExperience();
    }
  });

  window.addEventListener('resize', () => world.resize(), { passive: true });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => world.resize()).observe(canvas);
  }

  document.addEventListener('visibilitychange', () => {
    if (!started) {
      return;
    }
    if (document.hidden) {
      timeline.pause();
    } else {
      timeline.play();
    }
  });

  window.addEventListener('beforeunload', () => {
    timeline.dispose();
    audio.dispose();
    world.dispose();
  });

  window.__SPOKENCODE__ = { timeline, world, resetExperience };
  updateReadout(0, 0);
  timeline.play();
  started = true;
}
