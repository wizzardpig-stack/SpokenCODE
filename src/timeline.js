const noop = () => {};

function schedule(events) {
  let cursor = 0;

  return events.map((event) => {
    const scheduled = {
      ...event,
      start: cursor,
      end: cursor + event.duration + (event.pause ?? 0),
    };

    cursor = scheduled.end;
    return scheduled;
  });
}

/**
 * A small deterministic scheduler. Events are dispatched in sequence while a
 * single RAF loop advances elapsed time; command effects never own timers.
 */
export class Timeline {
  constructor({ events, onEvent = noop, onTick = noop, onComplete = noop } = {}) {
    this.events = schedule(events ?? []);
    this.onEvent = onEvent;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.totalDuration = this.events.at(-1)?.end ?? 0;
    this.frameHandle = 0;
    this.lastTime = 0;
    this.elapsed = 0;
    this.eventCursor = 0;
    this.running = false;
    this.completed = false;
    this.frame = this.frame.bind(this);
  }

  play() {
    if (this.completed) {
      this.reset();
    }

    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.frameHandle = requestAnimationFrame(this.frame);
  }

  pause() {
    if (!this.running) {
      return;
    }

    this.running = false;
    cancelAnimationFrame(this.frameHandle);
    this.frameHandle = 0;
  }

  reset() {
    this.pause();
    this.elapsed = 0;
    this.eventCursor = 0;
    this.completed = false;
    this.lastTime = 0;
  }

  get progress() {
    return this.totalDuration === 0 ? 0 : Math.min(this.elapsed / this.totalDuration, 1);
  }

  frame(now) {
    if (!this.running) {
      return;
    }

    const delta = Math.min(Math.max((now - this.lastTime) / 1000, 0), 0.1);
    this.lastTime = now;
    this.elapsed = Math.min(this.elapsed + delta, this.totalDuration);

    while (
      this.eventCursor < this.events.length &&
      this.events[this.eventCursor].start <= this.elapsed
    ) {
      this.onEvent(this.events[this.eventCursor]);
      this.eventCursor += 1;
    }

    this.onTick({
      delta,
      elapsed: this.elapsed,
      progress: this.progress,
      running: this.running,
    });

    if (this.elapsed >= this.totalDuration) {
      this.running = false;
      this.completed = true;
      this.frameHandle = 0;
      this.onComplete();
      return;
    }

    this.frameHandle = requestAnimationFrame(this.frame);
  }

  dispose() {
    this.pause();
  }
}
